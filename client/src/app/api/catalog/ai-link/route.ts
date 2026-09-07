import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ error: "No URL provided" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "GEMINI_API_KEY is not configured on the server." }, { status: 500 });
    }

    // Fetch the URL content
    let htmlContent = "";
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`);
      }
      htmlContent = await response.text();
    } catch (e: any) {
      return NextResponse.json({ error: "Không thể truy cập đường link này. Lỗi: " + e.message }, { status: 400 });
    }

    // Extract image from meta og:image before cleaning up HTML
    let imageUrl = "";
    const ogImageMatch = htmlContent.match(/<meta\s+(?:[^>]*?\s+)?property=["']og:image["']\s+(?:[^>]*?\s+)?content=["']([^"']+)["']/i) 
                      || htmlContent.match(/<meta\s+(?:[^>]*?\s+)?content=["']([^"']+)["']\s+(?:[^>]*?\s+)?property=["']og:image["']/i);
    if (ogImageMatch && ogImageMatch[1]) {
      imageUrl = ogImageMatch[1];
      if (imageUrl.startsWith('/')) {
        const urlObj = new URL(url);
        imageUrl = urlObj.origin + imageUrl;
      }
    }

    // Clean up HTML to save tokens
    let textContent = htmlContent
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove scripts
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '') // Remove styles
      .replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, '') // Remove svgs
      .replace(/<[^>]+>/g, ' ') // Remove remaining HTML tags
      .replace(/\s+/g, ' ') // Collapse whitespaces
      .trim();

    // Limit to 40,000 characters to fit in prompt token limits reasonably
    textContent = textContent.substring(0, 40000);

    const categories = await prisma.category.findMany();
    const brands = await prisma.brand.findMany();
    
    const categoryList = categories.map((c: any) => `"${c.id}": "${c.name}"`).join(", ");
    const brandList = brands.map((b: any) => `"${b.id}": "${b.name}"`).join(", ");

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash" });

    const prompt = `
Bạn là một trợ lý thông minh giúp bóc tách dữ liệu sản phẩm từ nội dung website được cào về.
Dưới đây là phần text của website. Hãy phân tích và trả về thông tin sản phẩm.
Yêu cầu:
- Bóc tách 'name' (Tên thiết bị/vật tư).
- Bóc tách 'model' (Mã sản phẩm/Model). Trích xuất riêng phần mã model. Nếu không thấy rõ mã, hãy trả về chuỗi rỗng "".
- Bóc tách 'description' (Mô tả). Viết một mô tả ngắn gọn (trong 5 dòng đổ lại) tóm tắt các tính năng chính, MỖI TÍNH NĂNG TRÊN 1 DÒNG VÀ BẮT ĐẦU BẰNG DẤU GẠCH ĐẦU DÒNG (-). BẮT BUỘC thêm câu "- Bảo hành 12 tháng" ở cuối cùng của đoạn mô tả.
- Bóc tách 'categoryId' (ID Danh mục). Dựa vào thông tin sản phẩm, tìm danh mục phù hợp nhất trong danh mục sau (định dạng ID: Tên): {${categoryList}}. BẮT BUỘC trả về ID (chuỗi string) của danh mục khớp nhất. Nếu không có danh mục nào phù hợp, trả về chuỗi rỗng "".
- Bóc tách 'brandId' (ID Thương hiệu). Dựa vào thông tin, tìm thương hiệu phù hợp trong danh sách sau (định dạng ID: Tên): {${brandList}}. BẮT BUỘC trả về ID (chuỗi string) của thương hiệu khớp nhất. Nếu không tìm thấy, trả về chuỗi rỗng "".
- Bóc tách 'costPrice' (Giá nhập/Đơn giá). Lấy giá bán trên website nhập vào trường này (viết dưới dạng số nguyên, ví dụ: 1250000). Nếu không tìm thấy giá, để là 0.

CHỈ trả về kết quả dưới định dạng JSON Object (chứa 1 sản phẩm), KHÔNG kèm giải thích, KHÔNG bọc trong markdown code block (như \`\`\`json).
Ví dụ trả về:
{
  "name": "Router Wifi cho gia đình Ruijie RG-EW1200G PRO",
  "model": "RG-EW1200G PRO",
  "description": "- Router Wifi tốc độ cao...\\n- Hỗ trợ 64 thiết bị...\\n- Bảo hành 12 tháng",
  "categoryId": "id-cua-danh-muc",
  "brandId": "id-cua-thuong-hieu",
  "costPrice": 950000
}

Nội dung Text của Website:
${textContent}
`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // Clean up potential markdown formatting
    let cleanedText = responseText.trim();
    if (cleanedText.startsWith("```json")) {
      cleanedText = cleanedText.substring(7);
    } else if (cleanedText.startsWith("```")) {
      cleanedText = cleanedText.substring(3);
    }
    if (cleanedText.endsWith("```")) {
      cleanedText = cleanedText.substring(0, cleanedText.length - 3);
    }
    cleanedText = cleanedText.trim();

    try {
      const parsedData = JSON.parse(cleanedText);
      if (imageUrl && !parsedData.image) {
        parsedData.image = imageUrl;
      }
      return NextResponse.json({ data: parsedData });
    } catch (parseError) {
      console.error("Failed to parse JSON from AI:", cleanedText);
      return NextResponse.json({ error: "AI trả về dữ liệu không đúng định dạng JSON.", rawOutput: responseText }, { status: 500 });
    }

  } catch (error: any) {
    console.error("AI Link error:", error);
    return NextResponse.json({ error: error.message || "Something went wrong" }, { status: 500 });
  }
}
