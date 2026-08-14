"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AccountForm() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    fetchAccount();
  }, []);

  const fetchAccount = async () => {
    try {
      const res = await fetch("http://localhost:3001/api/settings/account");
      if (res.ok) {
        const data = await res.json();
        setFormData((prev) => ({ ...prev, email: data.email || "" }));
      }
    } catch (error) {
      console.error("Lỗi khi tải thông tin tài khoản:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      setMessage({ type: "error", text: "Mật khẩu xác nhận không khớp." });
      return;
    }

    setSaving(true);
    setMessage({ type: "", text: "" });

    try {
      const res = await fetch("http://localhost:3001/api/settings/account", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ type: "success", text: "Cập nhật tài khoản thành công!" });
        setFormData((prev) => ({ ...prev, currentPassword: "", newPassword: "", confirmPassword: "" }));
      } else {
        setMessage({ type: "error", text: data.error || "Có lỗi xảy ra khi cập nhật." });
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
      <h2 className="text-xl font-semibold text-white mb-6">Tài khoản & Bảo mật</h2>
      
      {message.text && (
        <div className={`mb-4 rounded-md p-3 text-sm ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-zinc-300">Tên đăng nhập (Email)</Label>
          <Input 
            id="email" name="email" type="email"
            value={formData.email} onChange={handleChange} 
            className="bg-zinc-950 border-zinc-800 text-white" 
            required
          />
        </div>

        <div className="pt-2 border-t border-zinc-800 mt-4">
          <h3 className="text-sm font-medium text-zinc-400 mb-4 mt-2">Đổi mật khẩu</h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword" className="text-zinc-300">Mật khẩu hiện tại</Label>
              <Input 
                id="currentPassword" name="currentPassword" type="password"
                value={formData.currentPassword} onChange={handleChange} 
                className="bg-zinc-950 border-zinc-800 text-white" 
                required
              />
            </div>
            
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="newPassword" className="text-zinc-300">Mật khẩu mới</Label>
                <Input 
                  id="newPassword" name="newPassword" type="password"
                  value={formData.newPassword} onChange={handleChange} 
                  className="bg-zinc-950 border-zinc-800 text-white" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-zinc-300">Xác nhận mật khẩu mới</Label>
                <Input 
                  id="confirmPassword" name="confirmPassword" type="password"
                  value={formData.confirmPassword} onChange={handleChange} 
                  className="bg-zinc-950 border-zinc-800 text-white" 
                />
              </div>
            </div>
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
