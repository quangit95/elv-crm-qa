"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, Save, FileText } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

type CatalogItem = {
  id: string;
  name: string;
  costPrice: number;
  sellingPrice: number;
  unit: string;
};

type Lead = {
  id: string;
  title: string;
  customer: { name: string };
};

type QItem = {
  catalogItemId: string;
  name: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  costPrice: number;
};

type QSection = {
  id: string;
  name: string;
  items: QItem[];
};

export default function EditQuotationPage() {
  const router = useRouter();
  const params = useParams();
  const quotationId = params?.id as string;

  const [leads, setLeads] = useState<Lead[]>([]);
  const [catalog, setCatalog] = useState<CatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedLead, setSelectedLead] = useState<string>("");
  const [discount, setDiscount] = useState<number>(0);
  const [tax, setTax] = useState<number>(8);
  
  const [sections, setSections] = useState<QSection[]>([
    { id: "sec-1", name: "Hệ thống chung", items: [] }
  ]);

  useEffect(() => {
    Promise.all([
      fetch("/api/leads").then(r => r.json()),
      fetch("/api/catalog").then(r => r.json())
    ]).then(([leadsData, catalogData]) => {
      setLeads(leadsData);
      setCatalog(catalogData);
    });
  }, []);

  useEffect(() => {
    if (quotationId) {
      fetch(`/api/quotations/${quotationId}`)
        .then(r => r.json())
        .then(data => {
          setSelectedLead(data.leadId);
          setDiscount(data.discount);
          setTax(data.tax);
          if (data.sections && data.sections.length > 0) {
            setSections(data.sections.map((sec: any) => ({
              id: sec.id,
              name: sec.name,
              items: sec.items.map((item: any) => ({
                catalogItemId: item.catalogItemId,
                name: item.name,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                costPrice: item.costPrice
              }))
            })));
          }
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          alert("Không thể tải thông tin báo giá.");
          setLoading(false);
        });
    }
  }, [quotationId]);

  const addSection = () => {
    setSections([...sections, { id: `sec-${Date.now()}`, name: "Hạng mục mới", items: [] }]);
  };

  const removeSection = (id: string) => {
    setSections(sections.filter(s => s.id !== id));
  };

  const addItemToSection = (sectionId: string, catalogItemId: string) => {
    const catalogItem = catalog.find(c => c.id === catalogItemId);
    if (!catalogItem) return;

    setSections(sections.map(s => {
      if (s.id === sectionId) {
        return {
          ...s,
          items: [...s.items, {
            catalogItemId: catalogItem.id,
            name: catalogItem.name,
            unit: catalogItem.unit,
            quantity: 1,
            unitPrice: catalogItem.sellingPrice,
            costPrice: catalogItem.costPrice
          }]
        };
      }
      return s;
    }));
  };

  const addCustomItemToSection = (sectionId: string) => {
    setSections(sections.map(s => {
      if (s.id === sectionId) {
        return {
          ...s,
          items: [...s.items, {
            catalogItemId: "",
            name: "Vật tư tuỳ chỉnh mới",
            unit: "Cái",
            quantity: 1,
            unitPrice: 0,
            costPrice: 0
          }]
        };
      }
      return s;
    }));
  };

  const updateItem = (sectionId: string, itemIdx: number, field: keyof QItem, value: any) => {
    setSections(sections.map(s => {
      if (s.id === sectionId) {
        const newItems = [...s.items];
        newItems[itemIdx] = { ...newItems[itemIdx], [field]: value };
        return { ...s, items: newItems };
      }
      return s;
    }));
  };

  const removeItem = (sectionId: string, itemIdx: number) => {
    setSections(sections.map(s => {
      if (s.id === sectionId) {
        const newItems = [...s.items];
        newItems.splice(itemIdx, 1);
        return { ...s, items: newItems };
      }
      return s;
    }));
  };

  const saveQuotation = async (viewPdf: boolean = false) => {
    if (!selectedLead) return alert("Vui lòng chọn Lead / Dự án");
    
    try {
      const res = await fetch(`/api/quotations/${quotationId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadId: selectedLead,
          discount,
          tax,
          sections
        })
      });
      if (res.ok) {
        if (viewPdf) {
          window.open(`/api/quotations/${quotationId}/pdf`, '_blank');
        } else {
          alert("Cập nhật báo giá thành công!");
        }
        router.push("/quotations");
      } else {
        alert("Lỗi khi cập nhật báo giá.");
      }
    } catch (error) {
      console.error(error);
      alert("Lỗi khi lưu báo giá");
    }
  };

  // Calculations
  const totalAmount = sections.reduce((sum, sec) => 
    sum + sec.items.reduce((s, item) => s + (item.quantity * item.unitPrice), 0)
  , 0);
  
  const totalCost = sections.reduce((sum, sec) => 
    sum + sec.items.reduce((s, item) => s + (item.quantity * item.costPrice), 0)
  , 0);

  const totalDiscountAmount = discount;
  const amountAfterDiscount = totalAmount - totalDiscountAmount;
  const taxAmount = amountAfterDiscount * (tax / 100);
  const grandTotal = amountAfterDiscount + taxAmount;
  const profit = totalAmount - totalDiscountAmount - totalCost;
  const profitMargin = totalAmount ? ((profit / totalAmount) * 100).toFixed(2) : 0;

  const formatVND = (num: number) => new Intl.NumberFormat('vi-VN').format(num);

  if (loading) {
    return <div className="flex justify-center p-20 text-zinc-500">Đang tải thông tin báo giá...</div>;
  }

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Chỉnh sửa Báo Giá</h1>
          <p className="text-zinc-500">Cập nhật thông tin các hạng mục báo giá.</p>
        </div>
        <div className="space-x-2 flex">
          <Button variant="outline" onClick={() => router.push("/quotations")}>Huỷ</Button>
          <Button variant="outline" onClick={() => saveQuotation(true)} size="lg" className="border-primary text-primary hover:bg-primary/5">
            <FileText className="mr-2 h-4 w-4" />
            Cập nhật & Xem Nhanh
          </Button>
          <Button onClick={() => saveQuotation(false)} size="lg">
            <Save className="mr-2 h-4 w-4" />
            Cập nhật Báo Giá
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Chi tiết Hạng mục</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {sections.map((section, sIdx) => (
                <div key={section.id} className="border rounded-lg p-4 bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
                  <div className="flex justify-between items-center mb-4">
                    <Input 
                      value={section.name} 
                      onChange={e => {
                        const newSecs = [...sections];
                        newSecs[sIdx].name = e.target.value;
                        setSections(newSecs);
                      }}
                      className="font-bold text-lg w-1/2 border-none shadow-none bg-transparent px-0"
                    />
                    <Button variant="ghost" size="icon" onClick={() => removeSection(section.id)} className="text-red-500">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-12 gap-2 text-sm font-semibold text-zinc-500 mb-2 px-2">
                    <div className="col-span-4">Mặt hàng / Thiết bị</div>
                    <div className="col-span-2 text-center">Đơn vị tính</div>
                    <div className="col-span-1 text-center">Số lượng</div>
                    <div className="col-span-2 text-right">Đơn giá (VNĐ)</div>
                    <div className="col-span-2 text-right">Thành tiền (VNĐ)</div>
                    <div className="col-span-1"></div>
                  </div>

                  <div className="space-y-2">
                    {section.items.map((item, iIdx) => (
                      <div key={iIdx} className="grid grid-cols-12 gap-2 items-center bg-white dark:bg-zinc-950 p-2 rounded border">
                        <div className="col-span-4 font-medium text-sm">
                          <Input 
                            value={item.name} 
                            onChange={e => updateItem(section.id, iIdx, 'name', e.target.value)}
                            className="h-8 font-medium bg-transparent border-transparent hover:border-input focus:border-input px-1"
                          />
                        </div>
                        <div className="col-span-2">
                          <Input 
                            value={item.unit}
                            onChange={e => updateItem(section.id, iIdx, 'unit', e.target.value)}
                            className="h-8 text-center bg-transparent border-transparent hover:border-input focus:border-input px-1"
                          />
                        </div>
                        <div className="col-span-1">
                          <Input 
                            type="number" 
                            value={item.quantity} 
                            onChange={e => updateItem(section.id, iIdx, 'quantity', Number(e.target.value))}
                            className="h-8"
                          />
                        </div>
                        <div className="col-span-3">
                          <Input 
                            type="number" 
                            value={item.unitPrice} 
                            onChange={e => updateItem(section.id, iIdx, 'unitPrice', Number(e.target.value))}
                            className="h-8"
                          />
                        </div>
                        <div className="col-span-1 text-right text-sm font-bold">
                          {formatVND(item.quantity * item.unitPrice)}
                        </div>
                        <div className="col-span-1 text-right">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500" onClick={() => removeItem(section.id, iIdx)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 flex gap-2">
                    <Select key={`select-${section.id}-${section.items.length}`} onValueChange={(val) => addItemToSection(section.id, val as string)}>
                      <SelectTrigger className="flex-1 bg-white dark:bg-zinc-950">
                        <SelectValue placeholder="Lựa chọn Mặt hàng / Sản Phẩm" />
                      </SelectTrigger>
                      <SelectContent>
                        {catalog.map(c => (
                          <SelectItem key={c.id} value={c.id}>{c.name} - {formatVND(c.sellingPrice)}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button variant="outline" onClick={() => addCustomItemToSection(section.id)}>
                      + Dòng tuỳ chỉnh
                    </Button>
                  </div>
                </div>
              ))}

              <Button variant="outline" className="w-full border-dashed" onClick={addSection}>
                <Plus className="mr-2 h-4 w-4" />
                Thêm Hạng Mục Mới
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Thông tin chung</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Khách hàng / Dự án</Label>
                <Select onValueChange={(v) => setSelectedLead(v || "")} value={selectedLead}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn Dự án...">
                      {selectedLead && leads.find(l => l.id === selectedLead) 
                        ? `${leads.find(l => l.id === selectedLead)!.title} (${leads.find(l => l.id === selectedLead)!.customer?.name})` 
                        : null}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {leads.map(l => (
                      <SelectItem key={l.id} value={l.id}>{l.title} ({l.customer?.name})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Chiết khấu (VNĐ)</Label>
                <Input type="number" value={discount} onChange={e => setDiscount(Number(e.target.value))} />
              </div>
              <div className="space-y-2">
                <Label>Thuế VAT (%)</Label>
                <Select onValueChange={(val) => setTax(Number(val))} value={tax.toString()}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn mức thuế..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="8">8%</SelectItem>
                    <SelectItem value="10">10%</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle>Tổng Kết Phân Tích</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">Tổng hạng mục:</span>
                <span className="font-semibold">{formatVND(totalAmount)} ₫</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">Chiết khấu:</span>
                <span className="text-red-500 font-semibold">-{formatVND(discount)} ₫</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">VAT ({tax}%):</span>
                <span className="font-semibold">{formatVND(taxAmount)} ₫</span>
              </div>
              <div className="pt-4 border-t flex justify-between items-center">
                <span className="font-bold">Tổng Thanh Toán:</span>
                <span className="text-xl font-bold text-primary">{formatVND(grandTotal)} ₫</span>
              </div>
              
              <div className="pt-4 mt-4 border-t border-dashed">
                <div className="flex justify-between text-sm items-center">
                  <span className="text-zinc-500">Lợi nhuận gộp:</span>
                  <Badge variant={profit > 0 ? "default" : "destructive"}>{profitMargin}%</Badge>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-zinc-500">Giá trị:</span>
                  <span className="font-semibold text-primary">{formatVND(profit)} ₫</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
