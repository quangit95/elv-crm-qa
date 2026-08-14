"use client";

import React, { useEffect, useState, useRef } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Search, Pencil, Trash2, RotateCcw, Upload, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

type CatalogItem = {
  id: string;
  categoryId: string | null;
  category?: { name: string };
  brandId: string | null;
  brand?: { name: string };
  supplierId: string | null;
  supplier?: { name: string };
  model: string | null;
  name: string;
  description: string | null;
  costPrice: number;
  sellingPrice: number;
  unit: string;
  warranty: number | null;
  image?: string | null;
};

export default function CatalogPage() {
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [categories, setCategories] = useState<{id: string, name: string}[]>([]);
  const [brands, setBrands] = useState<{id: string, name: string}[]>([]);
  const [suppliers, setSuppliers] = useState<{id: string, name: string}[]>([]);

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [viewTab, setViewTab] = useState<'active' | 'inactive'>('active');
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    model: "",
    categoryId: "",
    brandId: "",
    supplierId: "",
    costPrice: 0,
    sellingPrice: 0,
    unit: "Cái",
    warranty: 12,
    image: ""
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [itemsRes, catRes, brandRes, supRes] = await Promise.all([
        fetch(`/api/catalog?status=${viewTab}`),
        fetch(`/api/categories`),
        fetch(`/api/brands`),
        fetch(`/api/suppliers`)
      ]);
      setItems(await itemsRes.json());
      setCategories(await catRes.json());
      setBrands(await brandRes.json());
      setSuppliers(await supRes.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [viewTab]);

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({ name: "", description: "", model: "", categoryId: "", brandId: "", supplierId: "", costPrice: 0, sellingPrice: 0, unit: "Cái", warranty: 12, image: "" });
    setOpen(true);
  };

  const handleOpenEdit = (item: CatalogItem) => {
    setEditingId(item.id);
    setFormData({
      name: item.name,
      description: item.description || "",
      model: item.model || "",
      categoryId: item.categoryId || "",
      brandId: item.brandId || "",
      supplierId: item.supplierId || "",
      costPrice: item.costPrice,
      sellingPrice: item.sellingPrice,
      unit: item.unit,
      warranty: item.warranty || 0,
      image: item.image || ""
    });
    setOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingId ? `/api/catalog/${editingId}` : "/api/catalog";
      const method = editingId ? "PUT" : "POST";
      
      const payload = {
        ...formData,
        categoryId: formData.categoryId || null,
        brandId: formData.brandId || null,
        supplierId: formData.supplierId || null,
        image: formData.image || null
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setOpen(false);
        fetchData();
      } else {
        alert("Có lỗi xảy ra khi lưu vật tư.");
      }
    } catch (error) {
      alert("Lỗi kết nối máy chủ.");
    }
  };

  const handleArchive = async (id: string) => {
    if (!confirm("Xóa vật tư này (chuyển vào danh sách không sử dụng)?")) return;
    try {
      const res = await fetch(`/api/catalog/${id}`, { method: "DELETE" });
      if (res.ok) fetchData();
    } catch (error) {
      alert("Lỗi kết nối máy chủ.");
    }
  };

  const handleRestore = async (id: string) => {
    try {
      const res = await fetch(`/api/catalog/${id}/restore`, { method: "PATCH" });
      if (res.ok) fetchData();
    } catch (error) {
      alert("Lỗi kết nối máy chủ.");
    }
  };

  const filteredItems = items.filter(
    (item) => item.name.toLowerCase().includes(search.toLowerCase()) || 
              item.model?.toLowerCase().includes(search.toLowerCase()) ||
              item.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Vật tư & Nhân công</h1>
          <p className="text-zinc-500">Quản lý danh mục thiết bị, cáp và đơn giá nhân công.</p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => alert('Tính năng import đang cập nhật cho cấu trúc mới')}>
            <Upload className="mr-2 h-4 w-4" />
            Nhập từ Excel
          </Button>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger render={<Button onClick={handleOpenAdd} />}>
              <Plus className="mr-2 h-4 w-4" />
              Thêm Vật Tư
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>{editingId ? "Cập Nhật Vật Tư" : "Thêm Vật Tư / Nhân Công Mới"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Tên vật tư (*)</Label>
                  <Input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                
                <div className="space-y-2">
                  <Label>Mô tả</Label>
                  <Textarea rows={2} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Mã / Model</Label>
                    <Input value={formData.model} onChange={e => setFormData({...formData, model: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>Danh mục (*)</Label>
                    <select required className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={formData.categoryId} onChange={e => setFormData({...formData, categoryId: e.target.value})}>
                      <option value="">-- Chọn --</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Thương hiệu</Label>
                    <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={formData.brandId} onChange={e => setFormData({...formData, brandId: e.target.value})}>
                      <option value="">-- Trống --</option>
                      {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Nhà cung cấp</Label>
                    <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={formData.supplierId} onChange={e => setFormData({...formData, supplierId: e.target.value})}>
                      <option value="">-- Trống --</option>
                      {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Giá vốn (*)</Label>
                    <Input type="number" required value={formData.costPrice} onChange={e => setFormData({...formData, costPrice: Number(e.target.value)})} />
                  </div>
                  <div className="space-y-2">
                    <Label>Giá bán niêm yết (*)</Label>
                    <Input type="number" required value={formData.sellingPrice} onChange={e => setFormData({...formData, sellingPrice: Number(e.target.value)})} />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Đơn vị tính</Label>
                    <Input value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>Bảo hành (Tháng)</Label>
                    <Input type="number" value={formData.warranty} onChange={e => setFormData({...formData, warranty: Number(e.target.value)})} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Hình ảnh sản phẩm</Label>
                  <div className="flex items-center gap-4">
                    {formData.image && (
                      <img src={formData.image} alt="Preview" className="w-16 h-16 object-cover rounded border" />
                    )}
                    <Input type="file" accept="image/*" onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const uploadData = new FormData();
                      uploadData.append('image', file);
                      try {
                        const res = await fetch('/api/catalog/upload-image', {
                          method: 'POST',
                          body: uploadData
                        });
                        const data = await res.json();
                        if (data.url) {
                          setFormData({...formData, image: data.url});
                        }
                      } catch (error) {
                        alert("Lỗi khi tải ảnh lên");
                      }
                    }} />
                  </div>
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>Hủy</Button>
                  <Button type="submit">Lưu lại</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex gap-2">
          <Button variant={viewTab === 'active' ? 'default' : 'outline'} onClick={() => setViewTab('active')}>Đang sử dụng</Button>
          <Button variant={viewTab === 'inactive' ? 'default' : 'outline'} onClick={() => setViewTab('inactive')}>Không sử dụng</Button>
        </div>
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-500" />
          <Input placeholder="Tìm kiếm theo tên, mã..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="rounded-md border bg-white dark:bg-zinc-950 dark:border-zinc-800">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mã/Model</TableHead>
              <TableHead>Tên Vật Tư</TableHead>
              <TableHead>Thương Hiệu</TableHead>
              <TableHead>Danh Mục</TableHead>
              <TableHead className="text-right">Giá Vốn</TableHead>
              <TableHead className="text-right">Giá Bán</TableHead>
              <TableHead>ĐVT</TableHead>
              <TableHead className="text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-10 text-zinc-500">Đang tải dữ liệu...</TableCell>
              </TableRow>
            ) : filteredItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-10 text-zinc-500">Không tìm thấy vật tư nào</TableCell>
              </TableRow>
            ) : (
              filteredItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">
                    <span className="cursor-pointer text-primary hover:underline" onClick={() => handleOpenEdit(item)}>
                      {item.model || "N/A"}
                    </span>
                  </TableCell>
                  <TableCell>
                    {item.description ? (
                      <Tooltip>
                        <TooltipTrigger render={<div className="font-medium cursor-help underline decoration-dashed underline-offset-4" />} >
                          {item.name}
                        </TooltipTrigger>
                        <TooltipContent><p className="max-w-xs whitespace-pre-wrap">{item.description}</p></TooltipContent>
                      </Tooltip>
                    ) : (
                      <div className="font-medium">{item.name}</div>
                    )}
                  </TableCell>
                  <TableCell>{item.brand?.name ? <Badge variant="outline">{item.brand.name}</Badge> : "-"}</TableCell>
                  <TableCell>{item.category?.name || "-"}</TableCell>
                  <TableCell className="text-right text-red-500 font-medium">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.costPrice)}
                  </TableCell>
                  <TableCell className="text-right text-primary font-medium">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.sellingPrice)}
                  </TableCell>
                  <TableCell>{item.unit}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(item)}>
                        <Pencil className="h-4 w-4 text-blue-500" />
                      </Button>
                      {viewTab === 'active' ? (
                        <Button variant="ghost" size="icon" onClick={() => handleArchive(item.id)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      ) : (
                        <Button variant="ghost" size="icon" onClick={() => handleRestore(item.id)}>
                          <RotateCcw className="h-4 w-4 text-green-500" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
