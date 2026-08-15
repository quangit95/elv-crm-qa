"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Save, Sparkles } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function EditContractPage() {
  const router = useRouter();
  const params = useParams();
  const contractId = params?.id as string;

  const [code, setCode] = useState<string>("");
  const [status, setStatus] = useState<string>("DRAFT");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [terms, setTerms] = useState<string>("");
  
  const [leadTitle, setLeadTitle] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [grandTotal, setGrandTotal] = useState<number>(0);
  
  const [paymentSplit, setPaymentSplit] = useState<string>("50-50");

  useEffect(() => {
    if (contractId) {
      fetch(`/api/contracts/${contractId}`)
        .then(r => r.json())
        .then(data => {
          setCode(data.code || "");
          setStatus(data.status || "DRAFT");
          setStartDate(data.startDate ? new Date(data.startDate).toISOString().split('T')[0] : "");
          setEndDate(data.endDate ? new Date(data.endDate).toISOString().split('T')[0] : "");
          setTerms(data.terms || "");
          setLeadTitle(data.lead?.title || "");
          setCustomerName(data.lead?.customer?.name || "");
          setGrandTotal(data.quotation?.grandTotal || 0);
        })
        .catch(err => {
          console.error(err);
          alert("Không thể tải thông tin hợp đồng.");
        });
    }
  }, [contractId]);

  const saveContract = async () => {
    try {
      const res = await fetch(`/api/contracts/${contractId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          startDate,
          endDate,
          terms
        })
      });
      
      if (res.ok) {
        alert("Cập nhật hợp đồng thành công!");
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

  const formatVND = (num: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num);

  const appendPaymentTerms = () => {
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

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Cập nhật Hợp Đồng</h1>
          <p className="text-zinc-500">Chỉnh sửa thông tin hợp đồng hiện tại.</p>
        </div>
        <div className="space-x-2">
          <Button variant="outline" onClick={() => router.push("/contracts")}>Huỷ</Button>
          <Button onClick={saveContract} size="lg">
            <Save className="mr-2 h-4 w-4" />
            Cập nhật Hợp Đồng
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
                <Label>Mã Hợp đồng (Chỉ đọc)</Label>
                <Input value={code} disabled />
              </div>
              
              <div className="p-3 bg-zinc-50 dark:bg-zinc-900 rounded-md border text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Khách hàng:</span>
                  <span className="font-medium">{customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Dự án:</span>
                  <span className="font-medium text-primary">{leadTitle}</span>
                </div>
                <div className="flex justify-between border-t pt-2 mt-2">
                  <span className="text-zinc-500 font-bold">Giá trị HĐ:</span>
                  <span className="font-bold text-green-600">{formatVND(grandTotal)}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Trạng thái</Label>
                <Select onValueChange={(v) => setStatus(v)} value={status}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DRAFT">Nháp</SelectItem>
                    <SelectItem value="SIGNED">Đã Ký</SelectItem>
                    <SelectItem value="COMPLETED">Hoàn Thành</SelectItem>
                    <SelectItem value="CANCELLED">Đã Huỷ</SelectItem>
                  </SelectContent>
                </Select>
              </div>

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
                <Select onValueChange={(v) => setPaymentSplit(v)} value={paymentSplit}>
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
