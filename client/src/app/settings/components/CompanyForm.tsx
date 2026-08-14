"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, ImageIcon } from "lucide-react";

export function CompanyForm() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    taxCode: "",
    logo: "",
  });
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    fetchCompany();
  }, []);

  const fetchCompany = async () => {
    try {
      const res = await fetch("http://localhost:3001/api/settings/company");
      if (res.ok) {
        const data = await res.json();
        setFormData({
          name: data.name || "",
          phone: data.phone || "",
          address: data.address || "",
          taxCode: data.taxCode || "",
          logo: data.logo || "",
        });
      }
    } catch (error) {
      console.error("Lỗi khi tải thông tin công ty:", error);
    } finally {
      setLoading(false);
    }
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
      const res = await fetch("http://localhost:3001/api/settings/upload-logo", {
        method: "POST",
        body: uploadData,
      });

      if (res.ok) {
        const data = await res.json();
        // Cập nhật logo url, nối thêm domain nếu backend trả về đường dẫn tương đối
        const logoUrl = data.url.startsWith("/") ? `http://localhost:3001${data.url}` : data.url;
        setFormData((prev) => ({ ...prev, logo: logoUrl }));
        setMessage({ type: "success", text: "Tải logo lên thành công! Hãy nhấn Lưu thay đổi." });
      } else {
        setMessage({ type: "error", text: "Lỗi tải ảnh lên." });
      }
    } catch (error) {
      console.error("Lỗi upload:", error);
      setMessage({ type: "error", text: "Lỗi kết nối khi tải ảnh lên." });
    } finally {
      setUploading(false);
      // Reset input file
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: "", text: "" });

    try {
      const res = await fetch("http://localhost:3001/api/settings/company", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setMessage({ type: "success", text: "Lưu thông tin công ty thành công!" });
      } else {
        setMessage({ type: "error", text: "Có lỗi xảy ra khi lưu." });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Lỗi kết nối máy chủ." });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-4 text-zinc-400">Đang tải dữ liệu...</div>;

  return (
    <div className="max-w-2xl rounded-lg border border-zinc-800 bg-zinc-900 p-6">
      <h2 className="text-xl font-semibold text-white mb-6">Thông tin công ty</h2>
      
      {message.text && (
        <div className={`mb-4 rounded-md p-3 text-sm ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Phần tải logo hiển thị trên cùng */}
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
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
              />
              <Button 
                type="button" 
                variant="outline" 
                className="border-zinc-700 bg-transparent text-zinc-300 hover:bg-zinc-800"
                disabled={uploading}
                onClick={() => fileInputRef.current?.click()}
              >
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
            <Input 
              id="name" name="name" 
              value={formData.name} onChange={handleChange} 
              className="bg-zinc-950 border-zinc-800 text-white" 
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-zinc-300">Số điện thoại</Label>
            <Input 
              id="phone" name="phone" 
              value={formData.phone} onChange={handleChange} 
              className="bg-zinc-950 border-zinc-800 text-white" 
            />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="address" className="text-zinc-300">Địa chỉ</Label>
            <Input 
              id="address" name="address" 
              value={formData.address} onChange={handleChange} 
              className="bg-zinc-950 border-zinc-800 text-white" 
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="taxCode" className="text-zinc-300">Mã số thuế</Label>
            <Input 
              id="taxCode" name="taxCode" 
              value={formData.taxCode} onChange={handleChange} 
              className="bg-zinc-950 border-zinc-800 text-white" 
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="logo" className="text-zinc-300">URL Logo (Link ảnh)</Label>
            <Input 
              id="logo" name="logo" 
              value={formData.logo} onChange={handleChange} 
              className="bg-zinc-950 border-zinc-800 text-white" 
              placeholder="https://example.com/logo.png"
            />
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <Button type="submit" disabled={saving} className="bg-primary hover:bg-primary/90 text-primary-foreground">
            {saving ? "Đang lưu..." : "Lưu thay đổi"}
          </Button>
        </div>
      </form>
    </div>
  );
}
