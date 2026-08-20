"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Save, Sparkles, Trash2, FileText } from "lucide-react";
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
  const [clauses, setClauses] = useState<{title: string, content: string}[]>([]);
  const [paymentSplit, setPaymentSplit] = useState<string>("50-50");
  const [partyA, setPartyA] = useState({ name: "", address: "", phone: "", email: "", representative: "", role: "", taxCode: "" });
  const [partyB, setPartyB] = useState({ name: "", address: "", phone: "", taxCode: "", bankAccount: "", bankAccountName: "", representative: "", role: "" });

  useEffect(() => {
    // Lấy báo giá chưa chốt
    fetch("/api/quotations")
      .then(r => r.json())
      .then(data => {
        setQuotations(data);
      });
      
      // Fetch company defaults
      fetch("/api/settings/company")
        .then(r => r.json())
        .then(data => {
          setPartyB(prev => ({
            ...prev,
            name: data.name || "CÔNG TY TNHH GIẢI PHÁP CÔNG NGHỆ VIỄN ĐÔNG",
            address: data.address || "Lô 17 đường 18A, KĐT Lê Hồng Phong 2, Phường Nam Nha Trang, Tỉnh Khánh Hòa",
            phone: data.phone || "0905.399.636",
            taxCode: data.taxCode || "4201341631",
            bankAccount: data.bankAccount ? (data.bankAccount + (data.bankName ? ` - ${data.bankName}` : '')) : "121992319 - Ngân hàng TMCP Á Châu ACB Khánh Hòa PGD Phương Sơn",
            bankAccountName: data.bankAccountName || "",
          }));
        });
        
      // Lấy điều khoản mẫu
      fetch("/api/settings/contract-template")
        .then(r => r.json())
        .then(data => {
          if (data && data.content) {
            const lines = data.content.split('\n');
            const result: {title: string, content: string}[] = [];
            let currentTitle = "";
            let currentContent: string[] = [];
            
            for(let line of lines) {
              if (line.trim().toLowerCase().startsWith('điều') || line.trim().match(/^[0-9]\./)) {
                if (currentTitle) {
                  result.push({ title: currentTitle, content: currentContent.join('\n').trim() });
                }
                currentTitle = line.trim();
                currentContent = [];
              } else {
                currentContent.push(line);
              }
            }
            if (currentTitle || currentContent.length > 0) {
              result.push({ title: currentTitle || "Điều khoản chung", content: currentContent.join('\n').trim() });
            }
            setClauses(result);
          } else {
            setClauses([
              { title: "Điều 1: Nội dung công việc", content: "Được ghi rõ tại bảng trên." },
              { title: "Điều 2: Giá trị hợp đồng và Phương thức thanh toán", content: "" },
              { title: "Điều 3: Quyền và Nghĩa vụ các bên", content: "" },
            ]);
          }
        })
        .catch(err => {
          console.error("Failed to load contract template:", err);
          setClauses([]);
        });
  }, []);

  // Auto-replace bank info in template clauses with company data
  const [companyData, setCompanyData] = useState<any>(null);
  useEffect(() => {
    fetch("/api/settings/company")
      .then(r => r.json())
      .then(data => setCompanyData(data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (companyData && clauses.length > 0) {
      const bankAccount = companyData.bankAccount || "";
      const bankName = companyData.bankName || "";
      const bankAccountName = companyData.bankAccountName || companyData.name || "";
      
      setClauses(prev => {
        const updated = prev.map(c => {
          let content = c.content;
          // Replace bank account number patterns like "Số Tài khoản : XXXXX tại Ngân hàng..."
          content = content.replace(
            /Số\s*Tài\s*khoản\s*[:\s]*[^\n]*/gi,
            `Số Tài khoản\t: ${bankAccount} tại ${bankName}`
          );
          // Replace account holder name patterns like "Chủ Tài khoản : XXXXX"
          content = content.replace(
            /Chủ\s*Tài\s*khoản\s*[:\s]*[^\n]*/gi,
            `Chủ Tài khoản\t: ${bankAccountName}`
          );
          return content !== c.content ? { ...c, content } : c;
        });
        return updated;
      });
    }
  }, [companyData, clauses.length]);

  const selectedQuotation = quotations.find(q => q.id === selectedQuotationId);
  
  useEffect(() => {
    if (selectedQuotation && selectedQuotation.lead?.customer) {
      setPartyA(prev => ({
        ...prev,
        name: selectedQuotation.lead.customer.name || "",
        address: selectedQuotation.lead.customer.address || "",
        phone: selectedQuotation.lead.customer.phone || "",
        email: selectedQuotation.lead.customer.email || "",
      }));
    }
  }, [selectedQuotationId, quotations]);

  useEffect(() => {
    if (code && clauses.length > 0) {
      setClauses(prev => prev.map(c => {
        if (c.title.toUpperCase().includes("ĐIỀU 8") || c.title.toUpperCase().includes("CHUNG")) {
          const newContent = c.content.replace(/(Hợp đồng Số:\s*)[^\n]+/i, `$1${code}`);
          if (newContent !== c.content) {
            return { ...c, content: newContent };
          }
        }
        return c;
      }));
    }
  }, [code]);

  const formatVND = (num: number) => new Intl.NumberFormat('vi-VN').format(num) + ' VNĐ';

  const appendPaymentTerms = () => {
    if (!selectedQuotation) {
      alert("Vui lòng chọn Báo giá trước để tính toán giá trị hợp đồng.");
      return;
    }
    const grandTotal = selectedQuotation.grandTotal;
    let newText = ``;
    
    if (paymentSplit === "100") {
      newText += `- Thanh toán 100% giá trị hợp đồng tương đương ${formatVND(grandTotal)} ngay sau khi ký hợp đồng và bàn giao đầy đủ.`;
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

    let paymentClauseIndex = clauses.findIndex(c => c.title.includes("3.1") && c.title.toLowerCase().includes("thanh toán"));
    if (paymentClauseIndex === -1) {
      paymentClauseIndex = clauses.findIndex(c => c.title.toLowerCase().includes("thanh toán"));
    }
    
    if (paymentClauseIndex === -1) {
      alert("Không tìm thấy Điều khoản nào có chứa chữ 'Thanh toán' ở tiêu đề để chèn! Vui lòng tạo một điều khoản thanh toán.");
      return;
    }

    const newClauses = [...clauses];
    const existingContent = newClauses[paymentClauseIndex].content;
    
    const regex = /^[\s\S]*?(?=Hồ sơ thanh toán gồm có:|$)/i;
    newClauses[paymentClauseIndex].content = existingContent.replace(regex, `${newText}\n`);
    setClauses(newClauses);
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
          partyA,
          partyB,
          terms: clauses.map(c => `${c.title}\n${c.content}`).join('\n\n')
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

  const saveAndPreview = async () => {
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
          partyA,
          partyB,
          terms: clauses.map(c => `${c.title}\n${c.content}`).join('\n\n')
        })
      });
      
      if (res.ok) {
        const data = await res.json();
        alert("Khởi tạo Hợp đồng thành công!");
        window.open(`/api/contracts/${data.id}/pdf`, "_blank");
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
        <div className="space-x-2 flex">
          <Button variant="outline" onClick={() => router.push("/contracts")}>Huỷ</Button>
          <Button variant="outline" onClick={saveAndPreview} className="text-teal-600 border-teal-600 hover:bg-teal-50">
            <FileText className="mr-2 h-4 w-4" />
            Lưu & Xem Nhanh
          </Button>
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
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Chọn Báo giá đã chốt...">
                      {selectedQuotation ? `${selectedQuotation.code} - ${selectedQuotation.lead?.title}` : "Chọn Báo giá đã chốt..."}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="w-[90vw] md:w-auto max-w-[500px]">
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

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Bên Mua (Bên A)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Tên đơn vị / Cá nhân</Label>
                  <Input value={partyA.name} onChange={e => setPartyA({...partyA, name: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Địa chỉ</Label>
                  <Input value={partyA.address} onChange={e => setPartyA({...partyA, address: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Điện thoại</Label>
                    <Input value={partyA.phone} onChange={e => setPartyA({...partyA, phone: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>Mã số thuế</Label>
                    <Input value={partyA.taxCode} onChange={e => setPartyA({...partyA, taxCode: e.target.value})} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input value={partyA.email} onChange={e => setPartyA({...partyA, email: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Người đại diện</Label>
                    <Input value={partyA.representative} onChange={e => setPartyA({...partyA, representative: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>Chức vụ</Label>
                    <Input value={partyA.role} onChange={e => setPartyA({...partyA, role: e.target.value})} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Bên Bán (Bên B)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Tên đơn vị</Label>
                  <Input value={partyB.name} onChange={e => setPartyB({...partyB, name: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Địa chỉ</Label>
                  <Input value={partyB.address} onChange={e => setPartyB({...partyB, address: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Điện thoại</Label>
                    <Input value={partyB.phone} onChange={e => setPartyB({...partyB, phone: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>Mã số thuế</Label>
                    <Input value={partyB.taxCode} onChange={e => setPartyB({...partyB, taxCode: e.target.value})} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Tài khoản ngân hàng</Label>
                  <Input value={partyB.bankAccount} onChange={e => setPartyB({...partyB, bankAccount: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Tên tài khoản (chủ TK)</Label>
                  <Input value={partyB.bankAccountName} onChange={e => setPartyB({...partyB, bankAccountName: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Người đại diện</Label>
                    <Input value={partyB.representative} onChange={e => setPartyB({...partyB, representative: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>Chức vụ</Label>
                    <Input value={partyB.role} onChange={e => setPartyB({...partyB, role: e.target.value})} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="h-full">
            <CardHeader>
              <CardTitle>Nội dung Điều khoản</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {clauses.map((clause, idx) => (
                <div key={idx} className="p-4 border rounded-md bg-zinc-50 dark:bg-zinc-900 space-y-3 relative">
                  <div className="flex items-center gap-2">
                    <Input 
                      value={clause.title} 
                      onChange={e => {
                        const nc = [...clauses];
                        nc[idx].title = e.target.value;
                        setClauses(nc);
                      }}
                      className="font-bold bg-transparent text-lg border-none px-0 shadow-none focus-visible:ring-0"
                      placeholder="Tên điều khoản (VD: Điều 1: Giá trị)"
                    />
                    <Button variant="ghost" size="icon" onClick={() => setClauses(clauses.filter((_, i) => i !== idx))} className="text-red-500 shrink-0">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <Textarea 
                    value={clause.content}
                    onChange={e => {
                      const nc = [...clauses];
                      nc[idx].content = e.target.value;
                      setClauses(nc);
                    }}
                    className="min-h-[120px] text-base leading-relaxed bg-white dark:bg-zinc-950"
                    placeholder="Nhập nội dung điều khoản..."
                  />
                </div>
              ))}
              <Button variant="outline" className="w-full border-dashed py-8 text-zinc-500" onClick={() => setClauses([...clauses, { title: `Điều ${clauses.length + 1}: Điều khoản mới`, content: "" }])}>
                + Thêm Điều Khoản Mới
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
