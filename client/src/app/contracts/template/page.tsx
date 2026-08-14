"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Save, ArrowLeft } from "lucide-react";

export default function ContractTemplatePage() {
  const router = useRouter();
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/settings/contract-template")
      .then(r => r.json())
      .then(data => {
        if (data && data.content !== undefined) {
          setContent(data.content);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load contract template:", err);
        setLoading(false);
      });
  }, []);

  const saveTemplate = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/settings/contract-template", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content })
      });
      
      if (res.ok) {
        alert("Cập nhật điều khoản hợp đồng mẫu thành công!");
      } else {
        const errorData = await res.json();
        alert(`Lỗi: ${errorData.error}`);
      }
    } catch (error) {
      console.error(error);
      alert("Lỗi khi kết nối tới máy chủ");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Điều Khoản Mẫu</h1>
          <p className="text-zinc-500">Cập nhật nội dung các điều khoản hợp đồng mặc định.</p>
        </div>
        <div className="space-x-2">
          <Button variant="outline" onClick={() => router.push("/contracts")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại
          </Button>
          <Button onClick={saveTemplate} disabled={loading || saving}>
            <Save className="mr-2 h-4 w-4" />
            {saving ? "Đang lưu..." : "Lưu thay đổi"}
          </Button>
        </div>
      </div>

      <Card className="bg-zinc-50 dark:bg-zinc-900">
        <CardHeader>
          <CardTitle>Nội dung điều khoản</CardTitle>
          <CardDescription>
            Nội dung này sẽ được tự động điền sẵn mỗi khi bạn tạo một Hợp đồng mới. 
            Bạn có thể tuỳ chỉnh lại nội dung cho từng hợp đồng cụ thể sau.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center p-6">
          {loading ? (
            <p className="text-sm text-zinc-500">Đang tải...</p>
          ) : (
            <div className="w-full max-w-3xl bg-white dark:bg-zinc-950 shadow-sm border rounded-sm p-8 md:p-12">
              <Textarea 
                className="min-h-[800px] border-none shadow-none text-base leading-relaxed resize-none focus-visible:ring-0 p-0 text-justify" 
                placeholder="Nhập nội dung các điều khoản hợp đồng mẫu..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
