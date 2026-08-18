"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, Save, FileText } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

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

const ProductSearchBox = ({ catalog, onSelectMultiple }: { catalog: CatalogItem[], onSelectMultiple: (ids: string[]) => void }) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  const filtered = catalog.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.id.includes(search));

  const handleAdd = () => {
    onSelectMultiple(Array.from(selectedIds));
    setSearch("");
    setSelectedIds(new Set());
    setOpen(false);
  };

  const toggleSelect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  return (
    <div className="relative flex-1" ref={containerRef}>
      <Input 
        placeholder="🔍 Tìm kiếm và chọn sản phẩm..."
        value={search}
        onChange={e => { setSearch(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        className="bg-white dark:bg-zinc-950"
      />
      {open && (
        <div className="absolute z-50 w-[150%] max-w-[90vw] mt-1 bg-white dark:bg-zinc-950 border rounded-md shadow-lg flex flex-col overflow-hidden left-0" style={{ maxHeight: '300px' }}>
          <div className="overflow-y-auto flex-1">
            {filtered.length === 0 ? (
              <div className="p-2 text-sm text-zinc-500 text-center py-4">Không tìm thấy thiết bị nào.</div>
            ) : (
              filtered.map(c => {
                const isSelected = selectedIds.has(c.id);
                return (
                  <div 
                    key={c.id} 
                    className={`p-2 text-sm cursor-pointer border-b dark:border-zinc-800 last:border-0 transition-colors flex items-center gap-3 ${isSelected ? 'bg-primary/10' : 'hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
                    onClick={(e) => toggleSelect(c.id, e)}
                  >
                    <input 
                      type="checkbox" 
                      checked={isSelected}
                      readOnly
                      className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-zinc-900 dark:text-zinc-100">{c.name}</div>
                      <div className="text-xs text-primary font-semibold mt-0.5">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(c.sellingPrice)}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
          {selectedIds.size > 0 && (
            <div className="p-2 border-t bg-zinc-50 dark:bg-zinc-900 flex justify-between items-center shrink-0">
              <span className="text-sm font-medium text-primary">Đã chọn {selectedIds.size} vật tư</span>
              <Button size="sm" onClick={handleAdd}>Thêm vào danh sách</Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default function NewQuotationPage() {
  const router = useRouter();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [catalog, setCatalog] = useState<CatalogItem[]>([]);
  
  const [selectedLead, setSelectedLead] = useState<string>("");
  const [discount, setDiscount] = useState<number>(0);
  const [tax, setTax] = useState<number>(8);
  
  const [sections, setSections] = useState<QSection[]>([
    { id: "sec-1", name: "Hệ thống chung", items: [] }
  ]);

  const [isQuickCreateOpen, setIsQuickCreateOpen] = useState(false);
  const [quickData, setQuickData] = useState({ customerName: "", customerPhone: "", leadTitle: "" });
  const [isQuickCreating, setIsQuickCreating] = useState(false);

  useEffect(() => {
    fetch("/api/leads").then(r => r.json()).then(setLeads);
    fetch("/api/catalog").then(r => r.json()).then(setCatalog);
  }, []);

  const handleQuickCreate = async () => {
    if (!quickData.customerName || !quickData.leadTitle) {
      alert("Vui lòng nhập Tên khách hàng và Tên dự án");
      return;
    }
    
    setIsQuickCreating(true);
    try {
      const res = await fetch("/api/leads/quick", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(quickData)
      });
      if (res.ok) {
        const newLead = await res.json();
        setLeads(prev => [newLead, ...prev]);
        setTimeout(() => {
          setSelectedLead(newLead.id);
        }, 50);
        setIsQuickCreateOpen(false);
        setQuickData({ customerName: "", customerPhone: "", leadTitle: "" });
      }
    } catch (error) {
      console.error(error);
      alert("Có lỗi xảy ra khi tạo nhanh");
    } finally {
      setIsQuickCreating(false);
    }
  };

  const addSection = () => {
    setSections([...sections, { id: `sec-${Date.now()}`, name: "Hạng mục mới", items: [] }]);
  };

  const removeSection = (id: string) => {
    setSections(sections.filter(s => s.id !== id));
  };

  const addItemsToSection = (sectionId: string, catalogItemIds: string[]) => {
    const itemsToAdd = catalogItemIds.map(id => catalog.find(c => c.id === id)).filter(Boolean) as CatalogItem[];
    if (itemsToAdd.length === 0) return;

    setSections(sections.map(s => {
      if (s.id === sectionId) {
        const updatedItems = [...s.items];
        itemsToAdd.forEach(c => {
          const existingIdx = updatedItems.findIndex(i => i.catalogItemId === c.id);
          if (existingIdx >= 0) {
            updatedItems[existingIdx].quantity += 1;
          } else {
            updatedItems.push({
              catalogItemId: c.id,
              name: c.name,
              unit: c.unit,
              quantity: 1,
              unitPrice: c.sellingPrice,
              costPrice: c.costPrice
            });
          }
        });
        return { ...s, items: updatedItems };
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
      const res = await fetch("/api/quotations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadId: selectedLead,
          discount,
          tax,
          sections
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (viewPdf) {
          window.open(`/api/quotations/${data.id}/pdf`, '_blank');
        }
        router.push("/quotations");
      }
    } catch (error) {
      console.error(error);
      alert("Lỗi khi tạo báo giá");
    }
  };

  // Calculations
  const totalAmount = sections.reduce((sum, sec) => 
    sum + sec.items.reduce((s, item) => s + (item.quantity * item.unitPrice), 0)
  , 0);
  
  const totalCost = sections.reduce((sum, sec) => 
    sum + sec.items.reduce((s, item) => s + (item.quantity * item.costPrice), 0)
  , 0);

  const totalDiscountAmount = discount; // assuming fixed amount for now
  const amountAfterDiscount = totalAmount - totalDiscountAmount;
  const taxAmount = amountAfterDiscount * (tax / 100);
  const grandTotal = amountAfterDiscount + taxAmount;
  const profit = totalAmount - totalDiscountAmount - totalCost;
  const profitMargin = totalAmount ? ((profit / totalAmount) * 100).toFixed(2) : 0;

  const formatVND = (num: number) => new Intl.NumberFormat('vi-VN').format(num);

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tạo Báo Giá Mới</h1>
          <p className="text-zinc-500">Trình tạo báo giá tương tác đa hạng mục.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => saveQuotation(true)} size="lg" className="border-primary text-primary hover:bg-primary/5">
            <FileText className="mr-2 h-4 w-4" />
            Lưu & Xem Nhanh
          </Button>
          <Button onClick={() => saveQuotation(false)} size="lg">
            <Save className="mr-2 h-4 w-4" />
            Lưu Báo Giá
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card className="overflow-visible">
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
                  <div className="overflow-x-auto">
                    <div className="min-w-[800px]">
                      <div className="grid grid-cols-[minmax(200px,1fr)_60px_70px_110px_110px_40px] gap-2 text-sm font-semibold text-zinc-500 mb-2 px-2">
                        <div>Mặt hàng / Thiết bị</div>
                        <div className="text-center">ĐVT</div>
                        <div className="text-center">S.Lượng</div>
                        <div className="text-right">Đơn giá</div>
                        <div className="text-right">T.Tiền</div>
                        <div className="col-span-1"></div>
                      </div>
                      
                      <div className="space-y-2">
                    {section.items.map((item, iIdx) => (
                      <div key={iIdx} className="grid grid-cols-[minmax(200px,1fr)_60px_70px_110px_110px_40px] gap-2 items-center py-1.5 border-b border-zinc-200 dark:border-zinc-800 last:border-b-0">
                        <div className="font-medium text-sm">
                          <Input 
                            value={item.name} 
                            onChange={e => updateItem(section.id, iIdx, 'name', e.target.value)}
                            className="h-8 font-medium bg-transparent border-transparent hover:border-input focus:border-input px-1"
                          />
                        </div>
                        <div>
                          <Input 
                            value={item.unit}
                            onChange={e => updateItem(section.id, iIdx, 'unit', e.target.value)}
                            className="h-8 text-center bg-transparent border-transparent hover:border-input focus:border-input px-1"
                          />
                        </div>
                        <div>
                          <Input 
                            type="number" 
                            value={item.quantity} 
                            onChange={e => updateItem(section.id, iIdx, 'quantity', Number(e.target.value))}
                            className="h-8 text-center px-1 bg-transparent hover:border-input focus:border-input border-transparent"
                          />
                        </div>
                        <div>
                          <Input 
                            type="number" 
                            value={item.unitPrice} 
                            onChange={e => updateItem(section.id, iIdx, 'unitPrice', Number(e.target.value))}
                            className="h-8 text-right px-1 bg-transparent hover:border-input focus:border-input border-transparent"
                          />
                        </div>
                        <div className="text-right text-sm font-bold truncate" title={formatVND(item.quantity * item.unitPrice)}>
                          {formatVND(item.quantity * item.unitPrice)}
                        </div>
                        <div className="text-right">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500" onClick={() => removeItem(section.id, iIdx)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                    <ProductSearchBox catalog={catalog} onSelectMultiple={(vals) => addItemsToSection(section.id, vals)} />

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
                <div className="flex items-center justify-between">
                  <Label>Khách hàng / Dự án</Label>
                  <Dialog open={isQuickCreateOpen} onOpenChange={setIsQuickCreateOpen}>
                    <DialogTrigger>
                      <span className="cursor-pointer text-xs text-primary hover:underline font-medium">Tạo mới nhanh</span>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Tạo nhanh Khách hàng / Dự án</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label>Tên khách hàng *</Label>
                          <Input value={quickData.customerName} onChange={e => setQuickData({...quickData, customerName: e.target.value})} placeholder="Vd: Công ty ABC" />
                        </div>
                        <div className="space-y-2">
                          <Label>Số điện thoại</Label>
                          <Input value={quickData.customerPhone} onChange={e => setQuickData({...quickData, customerPhone: e.target.value})} placeholder="Vd: 09..." />
                        </div>
                        <div className="space-y-2">
                          <Label>Tên dự án / Nhu cầu *</Label>
                          <Input value={quickData.leadTitle} onChange={e => setQuickData({...quickData, leadTitle: e.target.value})} placeholder="Vd: Lắp camera văn phòng" />
                        </div>
                        <Button onClick={handleQuickCreate} disabled={isQuickCreating} className="w-full">
                          {isQuickCreating ? "Đang tạo..." : "Tạo & Chọn"}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                <Select onValueChange={(v) => setSelectedLead(v || "")} value={selectedLead}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Chọn Dự án...">
                      {selectedLead && leads.find(l => l.id === selectedLead) 
                        ? `${leads.find(l => l.id === selectedLead)!.title} (${leads.find(l => l.id === selectedLead)!.customer?.name})` 
                        : null}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="w-[90vw] md:w-auto max-w-[500px]">
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
                    <SelectItem value="0">0%</SelectItem>
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
              {tax > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">VAT ({tax}%):</span>
                  <span className="font-semibold">{formatVND(taxAmount)} ₫</span>
                </div>
              )}
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
