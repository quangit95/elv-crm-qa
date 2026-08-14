"use client";

import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, FileText, FileSpreadsheet, Share2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

type Contract = {
  id: string;
  code: string;
  totalValue: number;
  status: string;
  startDate: string;
  endDate: string;
  createdAt: string;
  lead: {
    title: string;
    customer: { name: string };
  };
};

export default function ContractsPage() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchContracts = () => {
    fetch("/api/contracts")
      .then((res) => res.json())
      .then((data) => {
        setContracts(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchContracts();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xoá hợp đồng này?")) return;
    try {
      const res = await fetch(`/api/contracts/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchContracts();
      } else {
        alert("Có lỗi khi xoá hợp đồng.");
      }
    } catch (error) {
      alert("Lỗi kết nối máy chủ.");
    }
  };

  const handleShare = async (contract: Contract) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Hợp Đồng - ${contract.code}`,
          text: `Gửi bạn Hợp đồng ${contract.code} - dự án ${contract.lead?.title}`,
          url: `${window.location.origin}/api/contracts/${contract.id}/pdf`,
        });
      } catch (err) {
        console.error("Lỗi khi chia sẻ:", err);
      }
    } else {
      alert("Trình duyệt của bạn không hỗ trợ tính năng chia sẻ này.");
    }
  };

  const handleNotImplemented = () => {
    alert("Tính năng xuất Excel cho Hợp đồng đang được phát triển.");
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'DRAFT': return <Badge variant="secondary">Nháp</Badge>;
      case 'SIGNED': return <Badge className="bg-blue-500">Đã Ký</Badge>;
      case 'COMPLETED': return <Badge className="bg-green-500">Hoàn Thành</Badge>;
      case 'CANCELLED': return <Badge variant="destructive">Đã Huỷ</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quản lý Hợp Đồng</h1>
          <p className="text-zinc-500">Tạo và theo dõi tiến độ các hợp đồng dự án.</p>
        </div>
        <Link href="/contracts/new">
          <Button className="w-full md:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Tạo Hợp Đồng Mới
          </Button>
        </Link>
      </div>

      <div className="rounded-md border bg-white dark:bg-zinc-950 dark:border-zinc-800">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mã Hợp Đồng</TableHead>
              <TableHead>Dự Án / Khách Hàng</TableHead>
              <TableHead>Ngày Ký (Bắt đầu)</TableHead>
              <TableHead className="text-right">Giá Trị</TableHead>
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
            ) : contracts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10 text-zinc-500">
                  Chưa có hợp đồng nào.
                </TableCell>
              </TableRow>
            ) : (
              contracts.map((contract) => (
                <TableRow key={contract.id}>
                  <TableCell className="font-medium">
                    <a href={`/api/contracts/${contract.id}/pdf`} target="_blank" rel="noreferrer" className="text-primary hover:underline" title="Xem nhanh PDF">
                      {contract.code}
                    </a>
                  </TableCell>
                  <TableCell>
                    <p className="font-medium">{contract.lead?.title}</p>
                    <p className="text-xs text-zinc-500">{contract.lead?.customer?.name}</p>
                  </TableCell>
                  <TableCell>
                    {contract.startDate ? new Date(contract.startDate).toLocaleDateString("vi-VN") : "---"}
                  </TableCell>
                  <TableCell className="text-right font-bold">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(contract.totalValue)}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(contract.status)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end items-center gap-2">
                      <a href={`/api/contracts/${contract.id}/pdf`} target="_blank" rel="noreferrer">
                        <Button variant="ghost" size="icon" title="Xem PDF">
                          <FileText className="h-4 w-4 text-red-500" />
                        </Button>
                      </a>
                      <a href={`/api/contracts/${contract.id}/word`} target="_blank" rel="noreferrer">
                        <Button variant="ghost" size="icon" title="Xuất Word">
                          <FileText className="h-4 w-4 text-blue-600" />
                        </Button>
                      </a>
                      <Button variant="ghost" size="icon" title="Chia sẻ" onClick={() => handleShare(contract)}>
                        <Share2 className="h-4 w-4 text-blue-600" />
                      </Button>
                      <div className="w-px h-4 bg-zinc-200 mx-1"></div>
                      <Link href={`/contracts/${contract.id}/edit`}>
                        <Button variant="ghost" size="icon" title="Chỉnh sửa">
                          <Pencil className="h-4 w-4 text-blue-500" />
                        </Button>
                      </Link>
                      <Button variant="ghost" size="icon" title="Xoá" onClick={() => handleDelete(contract.id)}>
                        <Trash2 className="h-4 w-4 text-zinc-500 hover:text-red-500" />
                      </Button>
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
