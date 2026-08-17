"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, ImageIcon, Plus, Trash2, Edit, CheckCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

type Company = {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  taxCode: string;
  logo: string;
  representative: string;
  isActive: boolean;
};

export function CompanyForm() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: "", text: "" });

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const defaultFormData = {
    name: "",
    phone: "",
    email: "",
    address: "",
    taxCode: "",
    logo: "",
    representative: "",
  };
  const [formData, setFormData] = useState(defaultFormData);

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const res = await fetch("/api/settings/companies");
      if (res.ok) {
        const data = await res.json();
        setCompanies(data);
      }
    } catch (error) {
      console.error("Lỗi khi tải danh sách công ty:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (company?: Company) => {
    if (company) {
      setEditingId(company.id);
      setFormData({
        name: company.name || "",
        phone: company.phone || "",
        email: company.email || "",
        address: company.address || "",
        taxCode: company.taxCode || "",
        logo: company.logo || "",
        representative: company.representative || "",
      });
    } else {
      setEditingId(null);
      setFormData(defaultFormData);
    }
    setIsDialogOpen(true);
    setMessage({ type: "", text: "" });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const uploadData = new FormData();
    uploadData.append("logo", file);

    try {
      const res = await fetch("/api/settings/upload-logo", {
        method: "POST",
        body: uploadData,
      });

      if (res.ok) {
        const data = await res.json();
        setFormData((prev) => ({ ...prev, logo: data.url }));
        setMessage({ type: "success", text: "Tải logo lên thành công!" });
      } else {
        setMessage({ type: "error", text: "Lỗi tải ảnh lên." });
      }
    } catch (error) {
      console.error("Lỗi upload:", error);
      setMessage({ type: "error", text: "Lỗi kết nối khi tải ảnh lên." });
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: "", text: "" });

    const url = editingId ? `/api/settings/companies/${editingId}` : "/api/settings/companies";
    const method = editingId ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        await fetchCompanies();
        setIsDialogOpen(false);
      } else {
        setMessage({ type: "error", text: "Có lỗi xảy ra khi lưu." });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Lỗi kết nối máy chủ." });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xoá công ty này?")) return;
    
    try {
      const res = await fetch(`/api/settings/companies/${id}`, { method: "DELETE" });
      if (res.ok) {
        await fetchCompanies();
      } else {
        const data = await res.json();
        alert(data.error || "Có lỗi xảy ra khi xoá.");
      }
    } catch (error) {
      alert("Lỗi kết nối máy chủ.");
    }
  };

  const handleActivate = async (id: string) => {
    try {
      const res = await fetch(`/api/settings/companies/${id}/activate`, { method: "POST" });
      if (res.ok) {
        await fetchCompanies();
      } else {
        alert("Có lỗi xảy ra khi kích hoạt.");
      }
    } catch (error) {
      alert("Lỗi kết nối máy chủ.");
    }
  };

  if (loading) return <div className="p-4 text-zinc-400">Đang tải dữ liệu...</div>;

  return (
    <div className="max-w-4xl rounded-lg border border-zinc-800 bg-zinc-900 p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-white">Quản lý các công ty</h2>
        <Button onClick={() => handleOpenDialog()} className="bg-primary hover:bg-primary/90">
          <Plus className="mr-2 h-4 w-4" />
          Thêm công ty
        </Button>
      </div>

      <div className="space-y-4">
        {companies.length === 0 ? (
          <div className="text-center p-8 text-zinc-500 border border-dashed border-zinc-800 rounded-lg">
            Chưa có công ty nào được lưu.
          </div>
        ) : (
          companies.map(company => (
            <div key={company.id} className={`flex items-center justify-between p-4 rounded-lg border ${company.isActive ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-zinc-800 bg-zinc-950'}`}>
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center overflow-hidden rounded-md border border-zinc-700 bg-zinc-900">
                  {company.logo ? (
                    <img src={company.logo} alt="Logo" className="h-full w-full object-contain" />
                  ) : (
                    <ImageIcon className="h-6 w-6 text-zinc-600" />
                  )}
                </div>
                <div>
                  <h3 className="font-medium text-white flex items-center gap-2">
                    {company.name}
                    {company.isActive && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        Đang hoạt động (in mặc định)
                      </span>
                    )}
                  </h3>
                  <div className="text-sm text-zinc-400 mt-1 flex gap-4">
                    <span>{company.phone}</span>
                    <span>{company.email}</span>
                  </div>
                  <div className="text-sm text-zinc-500 mt-0.5 line-clamp-1">{company.address}</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {!company.isActive && (
                  <Button variant="outline" size="sm" className="border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300" onClick={() => handleActivate(company.id)}>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Sử dụng
                  </Button>
                )}
                <Button variant="outline" size="sm" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800" onClick={() => handleOpenDialog(company)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" className="border-red-500/50 text-red-400 hover:bg-red-500/10 hover:text-red-300" onClick={() => handleDelete(company.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingId ? "Sửa thông tin công ty" : "Thêm công ty mới"}</DialogTitle>
          </DialogHeader>
          
          {message.text && (
            <div className={`mb-4 rounded-md p-3 text-sm ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="flex items-start gap-6 border-b border-zinc-800 pb-6 mb-2">
              <div className="flex h-24 w-24 flex-shrink-0 items-center justify-center overflow-hidden rounded-md border border-zinc-700 bg-zinc-950">
                {formData.logo ? (
                  <img src={formData.logo} alt="Logo" className="h-full w-full object-contain" />
                ) : (
                  <ImageIcon className="h-8 w-8 text-zinc-600" />
                )}
              </div>
              <div className="space-y-3 flex-1">
                <Label className="text-zinc-300">Logo công ty</Label>
                <div className="flex items-center gap-3">
                  <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
                  <Button type="button" variant="outline" className="border-zinc-700 bg-transparent text-zinc-300 hover:bg-zinc-800" disabled={uploading} onClick={() => fileInputRef.current?.click()}>
                    <Upload className="mr-2 h-4 w-4" />
                    {uploading ? "Đang tải lên..." : "Tải ảnh từ thiết bị"}
                  </Button>
                </div>
                <p className="text-xs text-zinc-500">Hoặc điền trực tiếp link ảnh bên dưới.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-zinc-300">Tên công ty</Label>
                <Input id="name" name="name" value={formData.name} onChange={handleChange} className="bg-zinc-950 border-zinc-800 text-white" required />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-zinc-300">Số điện thoại</Label>
                <Input id="phone" name="phone" value={formData.phone} onChange={handleChange} className="bg-zinc-950 border-zinc-800 text-white" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-zinc-300">Email</Label>
                <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} className="bg-zinc-950 border-zinc-800 text-white" />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="address" className="text-zinc-300">Địa chỉ</Label>
                <Input id="address" name="address" value={formData.address} onChange={handleChange} className="bg-zinc-950 border-zinc-800 text-white" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="taxCode" className="text-zinc-300">Mã số thuế</Label>
                <Input id="taxCode" name="taxCode" value={formData.taxCode} onChange={handleChange} className="bg-zinc-950 border-zinc-800 text-white" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="representative" className="text-zinc-300">Người đại diện</Label>
                <Input id="representative" name="representative" value={formData.representative} onChange={handleChange} className="bg-zinc-950 border-zinc-800 text-white" />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="logo" className="text-zinc-300">URL Logo (Link ảnh)</Label>
                <Input id="logo" name="logo" value={formData.logo} onChange={handleChange} className="bg-zinc-950 border-zinc-800 text-white" placeholder="https://example.com/logo.png" />
              </div>
            </div>

            <div className="pt-4 flex justify-end gap-2">
              <Button type="button" variant="outline" className="border-zinc-700 text-zinc-300" onClick={() => setIsDialogOpen(false)}>Hủy</Button>
              <Button type="submit" disabled={saving} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                {saving ? "Đang lưu..." : "Lưu thay đổi"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
