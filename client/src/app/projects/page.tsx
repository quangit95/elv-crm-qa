"use client";

import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Plus, Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from "next/link";

type Project = {
  id: string;
  name: string;
  status: string;
  startDate: string;
  endDate: string;
  customer: { name: string };
};

type Customer = {
  id: string;
  name: string;
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", customerId: "", startDate: "", endDate: "" });

  const fetchProjects = () => {
    fetch("/api/projects")
      .then((res) => res.json())
      .then((data) => {
        setProjects(data);
        setLoading(false);
      });
  };

  const fetchCustomers = () => {
    fetch("/api/customers")
      .then(res => res.json())
      .then(data => setCustomers(data));
  };

  useEffect(() => {
    fetchProjects();
    fetchCustomers();
  }, []);

  const handleOpenAdd = () => {
    setFormData({ name: "", customerId: "", startDate: "", endDate: "" });
    setOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name) return alert("Vui lòng nhập tên dự án");
    
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setOpen(false);
        fetchProjects();
      } else {
        alert("Lỗi khi tạo dự án");
      }
    } catch (error) {
      alert("Lỗi kết nối máy chủ");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dự án & Thi công</h1>
          <p className="text-zinc-500">Quản lý tiến độ thi công và thanh toán của các dự án.</p>
        </div>
        <Button onClick={handleOpenAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Tạo Dự Án
        </Button>
      </div>

      <div className="rounded-md border bg-white dark:bg-zinc-950 dark:border-zinc-800">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tên Dự Án</TableHead>
              <TableHead>Khách Hàng</TableHead>
              <TableHead>Ngày Bắt Đầu</TableHead>
              <TableHead>Ngày Kết Thúc</TableHead>
              <TableHead>Trạng Thái</TableHead>
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
            ) : projects.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10 text-zinc-500">
                  Chưa có dự án nào.
                </TableCell>
              </TableRow>
            ) : (
              projects.map((proj) => (
                <TableRow key={proj.id}>
                  <TableCell className="font-medium">{proj.name}</TableCell>
                  <TableCell>{proj.customer?.name}</TableCell>
                  <TableCell>{proj.startDate ? new Date(proj.startDate).toLocaleDateString("vi-VN") : "-"}</TableCell>
                  <TableCell>{proj.endDate ? new Date(proj.endDate).toLocaleDateString("vi-VN") : "-"}</TableCell>
                  <TableCell>
                    <Badge variant={proj.status === 'COMPLETED' ? 'default' : 'secondary'}>{proj.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm">Chi tiết</Button>
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
            <DialogTitle>Tạo dự án mới</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Tên dự án (*)</Label>
              <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="VD: Thi công hệ thống camera Toà nhà A" />
            </div>
            <div className="space-y-2">
              <Label>Khách hàng</Label>
              <Select value={formData.customerId} onValueChange={v => setFormData({...formData, customerId: v})}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn khách hàng" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Ngày bắt đầu</Label>
                <Input type="date" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Ngày kết thúc</Label>
                <Input type="date" value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Huỷ</Button>
            <Button onClick={handleSave}>Tạo dự án</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
