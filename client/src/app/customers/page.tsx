"use client";

import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, RotateCcw } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Customer = {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  type: string;
  createdAt: string;
};

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewTab, setViewTab] = useState<'active' | 'inactive'>('active');

  // Dialog states
  const [open, setOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [formData, setFormData] = useState<Partial<Customer>>({ name: "", phone: "", email: "", address: "", type: "B2C" });

  const fetchCustomers = () => {
    fetch(`/api/customers?status=${viewTab}`)
      .then((res) => res.json())
      .then((data) => {
        setCustomers(data);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchCustomers();
  }, [viewTab]);

  const handleOpenAdd = () => {
    setFormData({ name: "", phone: "", email: "", address: "", type: "B2C" });
    setIsEdit(false);
    setOpen(true);
  };

  const handleOpenEdit = (customer: Customer) => {
    setFormData({ ...customer });
    setIsEdit(true);
    setOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name) return alert("Vui lòng nhập tên khách hàng");
    
    try {
      const url = isEdit ? `/api/customers/${formData.id}` : "/api/customers";
      const method = isEdit ? "PUT" : "POST";
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        setOpen(false);
        fetchCustomers();
      } else {
        alert("Lỗi khi lưu khách hàng");
      }
    } catch (error) {
      alert("Lỗi kết nối máy chủ");
    }
  };

  const handleArchive = async (id: string) => {
    if (!confirm("Khách hàng này sẽ được chuyển vào danh sách không sử dụng?")) return;
    try {
      const res = await fetch(`/api/customers/${id}`, { method: "DELETE" });
      if (res.ok) fetchCustomers();
    } catch (error) {
      alert("Lỗi kết nối máy chủ");
    }
  };

  const handleRestore = async (id: string) => {
    try {
      const res = await fetch(`/api/customers/${id}/restore`, { method: "PATCH" });
      if (res.ok) fetchCustomers();
    } catch (error) {
      alert("Lỗi kết nối máy chủ");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Khách Hàng</h1>
          <p className="text-zinc-500">Quản lý thông tin khách hàng của hệ thống.</p>
        </div>
        <Button onClick={handleOpenAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Thêm Khách Hàng
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <Button variant={viewTab === 'active' ? 'default' : 'outline'} onClick={() => setViewTab('active')}>Đang sử dụng</Button>
        <Button variant={viewTab === 'inactive' ? 'default' : 'outline'} onClick={() => setViewTab('inactive')}>Không sử dụng</Button>
      </div>

      <div className="rounded-md border bg-white dark:bg-zinc-950 dark:border-zinc-800">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tên Khách Hàng</TableHead>
              <TableHead>Số điện thoại</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Địa chỉ</TableHead>
              <TableHead>Loại</TableHead>
              <TableHead className="text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10 text-zinc-500">
                  Đang tải dữ liệu...
                </TableCell>
              </TableRow>
            ) : customers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10 text-zinc-500">
                  Chưa có khách hàng nào.
                </TableCell>
              </TableRow>
            ) : (
              customers.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell>{c.phone || "-"}</TableCell>
                  <TableCell>{c.email || "-"}</TableCell>
                  <TableCell>{c.address || "-"}</TableCell>
                  <TableCell>{c.type}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" title="Chỉnh sửa" onClick={() => handleOpenEdit(c)}>
                        <Pencil className="h-4 w-4 text-blue-500" />
                      </Button>
                      {viewTab === 'active' ? (
                        <Button variant="ghost" size="icon" title="Ẩn" onClick={() => handleArchive(c.id)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      ) : (
                        <Button variant="ghost" size="icon" title="Khôi phục" onClick={() => handleRestore(c.id)}>
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

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEdit ? "Chỉnh sửa khách hàng" : "Thêm khách hàng mới"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Tên khách hàng (*)</Label>
              <Input value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Nguyễn Văn A / Công ty XYZ" />
            </div>
            <div className="space-y-2">
              <Label>Số điện thoại</Label>
              <Input value={formData.phone || ''} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="09xxxx" />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={formData.email || ''} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="email@example.com" />
            </div>
            <div className="space-y-2">
              <Label>Địa chỉ</Label>
              <Input value={formData.address || ''} onChange={e => setFormData({...formData, address: e.target.value})} placeholder="Số nhà, đường..." />
            </div>
            <div className="space-y-2">
              <Label>Phân loại</Label>
              <Select value={formData.type || undefined} onValueChange={v => setFormData({...formData, type: v || undefined})}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn loại khách hàng" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="B2C">Cá nhân (B2C)</SelectItem>
                  <SelectItem value="B2B">Doanh nghiệp (B2B)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Huỷ</Button>
            <Button onClick={handleSave}>Lưu thông tin</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
