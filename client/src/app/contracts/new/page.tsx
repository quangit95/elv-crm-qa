"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Save, Sparkles } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Quotation = {
  id: string;
  code: string;
  grandTotal: number;
  leadId: string;
  lead: {
    title: string;
    customer: { name: string };
  };
};

export default function NewContractPage() {
  const router = useRouter();
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  
  const [selectedQuotationId, setSelectedQuotationId] = useState<string>("");
  const [code, setCode] = useState<string>(`HD-${new Date().getFullYear()}${String(new Date().getMonth()+1).padStart(2, '0')}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [terms, setTerms] = useState<string>("Đang tải điều khoản mẫu...");
  const [paymentSplit, setPaymentSplit] = useState<string>("50-50");

  useEffect(() => {
    // Lấy báo giá chưa chốt
    fetch("/api/quotations")
      .then(r => r.json())
      .then(data => {
        setQuotations(data);
      });
      
    // Lấy điều khoản mẫu
    fetch("/api/settings/contract-template")
      .then(r => r.json())
      .then(data => {
        if (data && data.content) {
          setTerms(data.content);
        } else {
          setTerms("Điều 1: Nội dung công việc\n\nĐiều 2: Giá trị hợp đồng và Phương thức thanh toán\n\nĐiều 3: Quyền và Nghĩa vụ các bên");
        }
      })
      .catch(err => {
        console.error("Failed to load contract template:", err);
        setTerms("");
      });
  }, []);

  const selectedQuotation = quotations.find(q => q.id === selectedQuotationId);

  const formatVND = (num: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num);

  const appendPaymentTerms = () => {
    if (!selectedQuotation) {
      alert("Vui lòng chọn Báo giá trước để tính toán giá trị hợp đồng.");
      return;
    }
    const grandTotal = selectedQuotation.grandTotal;
    let newText = `\n\nGiá trị hợp đồng: ${formatVND(grandTotal)}\n`;
    newText += `Phương thức thanh toán:\n`;
    
    if (paymentSplit === "100") {
      newText += `- Thanh toán 100% giá trị hợp đồng (${formatVND(grandTotal)}) ngay sau khi ký hợp đồng và bàn giao đầy đủ.`;
    } else if (paymentSplit === "50-50") {
      const p50 = grandTotal * 0.5;
      newText += `- Đợt 1: Tạm ứng 50% giá trị hợp đồng tương đương ${formatVND(p50)} ngay sau khi ký kết.\n`;
      newText += `- Đợt 2: Thanh toán 50% còn lại tương đương ${formatVND(p50)} sau khi nghiệm thu và bàn giao hệ thống.`;
    } else if (paymentSplit === "30-70") {
      const p30 = grandTotal * 0.3;
      const p70 = grandTotal * 0.7;
      newText += `- Đợt 1: Tạm ứng 30% giá trị hợp đồng tương đương ${formatVND(p30)} ngay sau khi ký kết.\n`;
      newText += `- Đợt 2: Thanh toán 70% còn lại tương đương ${formatVND(p70)} sau khi nghiệm thu và bàn giao hệ thống.`;
    } else if (paymentSplit === "30-50-20") {
      const p30 = grandTotal * 0.3;
      const p50 = grandTotal * 0.5;
      const p20 = grandTotal * 0.2;
      newText += `- Đợt 1: Tạm ứng 30% giá trị hợp đồng tương đương ${formatVND(p30)} ngay sau khi ký kết.\n`;
      newText += `- Đợt 2: Thanh toán 50% giá trị hợp đồng tương đương ${formatVND(p50)} sau khi hàng hóa được tập kết tại công trình.\n`;
      newText += `- Đợt 3: Thanh toán 20% còn lại tương đương ${formatVND(p20)} sau khi hoàn thành nghiệm thu và bàn giao.`;
    }

    setTerms(prev => prev + newText);
  };

  const saveContract = async () => {
    if (!selectedQuotationId) return alert("Vui lòng chọn một Báo giá để làm Hợp đồng!");
    if (!code) return alert("Vui lòng nhập Mã hợp đồng");
    
    try {
      const res = await fetch("/api/contracts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          quotationId: selectedQuotationId,
          startDate,
          endDate,
          terms
        })
      });
      
      if (res.ok) {
        alert("Khởi tạo Hợp đồng thành công!");
        router.push("/contracts");
      } else {
        const errorData = await res.json();
        alert(`Lỗi: ${errorData.error}`);
      }
    } catch (error) {
      console.error(error);
      alert("Lỗi khi kết nối tới máy chủ");
    }
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tạo Hợp Đồng Mới</h1>
          <p className="text-zinc-500">Khởi tạo hợp đồng từ Báo giá đã được chốt.</p>
        </div>
        <div className="space-x-2">
          <Button variant="outline" onClick={() => router.push("/contracts")}>Huỷ</Button>
          <Button onClick={saveContract} size="lg">
            <Save className="mr-2 h-4 w-4" />
            Lưu Hợp Đồng
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Thông tin Hợp đồng</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Mã Hợp đồng (*)</Label>
                <Input value={code} onChange={e => setCode(e.target.value)} />
              </div>
              
              <div className="space-y-2">
                <Label>Căn cứ Báo giá (*)</Label>
                <Select onValueChange={(v) => setSelectedQuotationId(v || "")} value={selectedQuotationId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn Báo giá đã chốt...">
                      {selectedQuotation ? `${selectedQuotation.code} - ${selectedQuotation.lead?.title}` : "Chọn Báo giá đã chốt..."}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {quotations.map(q => (
                      <SelectItem key={q.id} value={q.id}>
                        {q.code} - {q.lead?.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedQuotation && (
                <div className="p-3 bg-zinc-50 dark:bg-zinc-900 rounded-md border text-sm space-y-2">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Khách hàng:</span>
                    <span className="font-medium">{selectedQuotation.lead?.customer?.name}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2 mt-2">
                    <span className="text-zinc-500 font-bold">Giá trị HĐ:</span>
                    <span className="font-bold text-green-600">{formatVND(selectedQuotation.grandTotal)}</span>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Ngày bắt đầu</Label>
                  <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Ngày kết thúc</Label>
                  <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="text-primary flex items-center">
                <Sparkles className="w-4 h-4 mr-2" />
                Công cụ điền giá trị
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Tỷ lệ thanh toán theo đợt</Label>
                <Select onValueChange={(v) => setPaymentSplit(v || "")} value={paymentSplit || undefined}>
                  <SelectTrigger className="bg-white dark:bg-zinc-950">
                    <SelectValue placeholder="Chọn chia đợt thanh toán" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="100">Thanh toán 1 lần (100%)</SelectItem>
                    <SelectItem value="50-50">2 đợt: 50% - 50%</SelectItem>
                    <SelectItem value="30-70">2 đợt: 30% - 70%</SelectItem>
                    <SelectItem value="30-50-20">3 đợt: 30% - 50% - 20%</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={appendPaymentTerms} className="w-full" variant="outline">
                Chèn thông tin vào điều khoản
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2 space-y-6">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Nội dung Điều khoản</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea 
                className="min-h-[500px] text-base leading-relaxed" 
                placeholder="Nhập nội dung các điều khoản hợp đồng..."
                value={terms}
                onChange={(e) => setTerms(e.target.value)}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
