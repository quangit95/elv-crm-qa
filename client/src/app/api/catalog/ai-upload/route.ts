import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("image") as File;

    if (!file) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "GEMINI_API_KEY is not configured on the server." }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Create generative part for the image
    const imagePart = {
      inlineData: {
        data: buffer.toString("base64"),
        mimeType: file.type || "image/jpeg"
      },
    };

    const prompt = `
Bạn là một trợ lý thông minh giúp bóc tách dữ liệu từ phiếu xuất kho, phiếu mua hàng, hoá đơn mua vật tư.
Hãy phân tích hình ảnh này và trả về danh sách các sản phẩm/thiết bị có trong phiếu.
Yêu cầu:
- Bóc tách 'name' (Tên thiết bị/vật tư). BẮT BUỘC giữ lại toàn bộ chuỗi tên bao gồm cả mã model bên trong (Ví dụ: "Camera IP 4MP DS-2CD2043G2-I").
- Bóc tách 'model' (Mã sản phẩm/Model). Trích xuất riêng phần mã model từ tên ra. Nếu không thấy rõ mã, hãy trả về chuỗi rỗng "".
- Bóc tách chính xác 'costPrice' (Giá nhập/Đơn giá - viết dưới dạng số nguyên, ví dụ: 15000). Nếu không tìm thấy, để là 0.
- Bóc tách 'unit' (Đơn vị tính - ví dụ: Cái, Cuộn, Mét, Bộ). Nếu không thấy, tự suy luận dựa vào tên (mặc định là 'Cái').
- Bóc tách 'quantity' (Số lượng - số nguyên). Nếu không có, mặc định là 1.
CHỈ trả về kết quả dưới định dạng JSON Array chứa các object, KHÔNG kèm giải thích, KHÔNG bọc trong markdown code block (như \`\`\`json).
Ví dụ trả về:
[
  {
    "name": "Camera IP 4MP DS-2CD2043G2-I",
    "model": "DS-2CD2043G2-I",
    "costPrice": 1250000,
    "unit": "Cái",
    "quantity": 2
  }
]
`;

    const result = await model.generateContent([prompt, imagePart]);
    const responseText = result.response.text();
    
    // Clean up potential markdown formatting if the model still includes it
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
      return NextResponse.json({ data: parsedData });
    } catch (parseError) {
      console.error("Failed to parse JSON from AI:", cleanedText);
      return NextResponse.json({ error: "AI trả về dữ liệu không đúng định dạng JSON.", rawOutput: responseText }, { status: 500 });
    }

  } catch (error: any) {
    console.error("AI Upload error:", error);
    return NextResponse.json({ error: error.message || "Something went wrong" }, { status: 500 });
  }
}
