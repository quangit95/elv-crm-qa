"use client";

import React, { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, FileText, FileSpreadsheet, Share2, CheckCircle, XCircle, RotateCcw, Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

type Quotation = {
  id: string;
  code: string;
  grandTotal: number;
  status: string;
  createdAt: string;
  lead: {
    title: string;
    customer: { name: string };
  };
};

export default function QuotationsPage() {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewTab, setViewTab] = useState<'ALL' | 'ACCEPTED' | 'REJECTED'>('ALL');
  const [archiveTab, setArchiveTab] = useState<'active' | 'inactive'>('active');

  const fetchQuotations = () => {
    fetch(`/api/quotations?status=${archiveTab}`)
      .then((res) => res.json())
      .then((data) => {
        setQuotations(data);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchQuotations();
  }, [archiveTab]);

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/quotations/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        fetchQuotations();
      } else {
        alert("Có lỗi khi cập nhật trạng thái.");
      }
    } catch (error) {
      alert("Lỗi kết nối máy chủ.");
    }
  };

  const handleArchive = async (id: string) => {
    if (!confirm("Báo giá này sẽ bị ẩn khỏi danh sách chính?")) return;
    try {
      const res = await fetch(`/api/quotations/${id}`, { method: "DELETE" });
      if (res.ok) fetchQuotations();
    } catch (error) {
      alert("Lỗi kết nối máy chủ.");
    }
  };

  const handleRestore = async (id: string) => {
    try {
      const res = await fetch(`/api/quotations/${id}/restore`, { method: "PATCH" });
      if (res.ok) fetchQuotations();
    } catch (error) {
      alert("Lỗi kết nối máy chủ.");
    }
  };

  const handleShare = async (qt: Quotation) => {
    if (navigator.share) {
      try {
        const response = await fetch(`/api/quotations/${qt.id}/pdf`);
        const blob = await response.blob();
        const file = new File([blob], `Quotation-${qt.code}.pdf`, { type: "application/pdf" });

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: `Báo giá ${qt.code}`,
            text: `Gửi bạn báo giá ${qt.code}`,
          });
        } else {
          await navigator.share({
            title: `Báo giá ${qt.code}`,
            text: `Gửi bạn báo giá ${qt.code}`,
            url: `/api/quotations/${qt.id}/pdf`
          });
        }
      } catch (error) {
        console.error("Lỗi chia sẻ:", error);
      }
    } else {
      alert("Trình duyệt hoặc thiết bị của bạn không hỗ trợ tính năng chia sẻ (Web Share API).");
    }
  };

  const filteredQuotations = quotations.filter(qt => {
    if (viewTab === 'ALL') return true;
    return qt.status === viewTab;
  });

  return (
    <div className="space-y-6 pb-24">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Báo Giá</h1>
          <p className="text-zinc-500">Quản lý và tạo các báo giá chuyên nghiệp.</p>
        </div>
        <Link href="/quotations/new">
          <Button className="w-full md:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Tạo Báo Giá
          </Button>
        </Link>
      </div>


      <div className="rounded-md border bg-white dark:bg-zinc-950 dark:border-zinc-800">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Báo Giá / Dự Án</TableHead>
              <TableHead>Ngày Tạo</TableHead>
              <TableHead className="text-right">Tổng Tiền</TableHead>
              <TableHead>Trạng Thái</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-10 text-zinc-500">
                  Đang tải dữ liệu...
                </TableCell>
              </TableRow>
            ) : filteredQuotations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-10 text-zinc-500">
                  Chưa có báo giá nào.
                </TableCell>
              </TableRow>
            ) : (
              filteredQuotations.map((qt) => (
                <React.Fragment key={qt.id}>
                  <TableRow className="border-b-0">
                    <TableCell className="pb-1">
                      <div className="mb-1">
                        <a href={`/api/quotations/${qt.id}/pdf`} target="_blank" rel="noreferrer" className="text-primary hover:underline font-bold text-base" title="Xem nhanh báo giá">
                          {qt.code}
                        </a>
                      </div>
                      <p className="font-medium text-sm">{qt.lead?.title}</p>
                      <p className="text-xs text-zinc-500">{qt.lead?.customer?.name}</p>
                    </TableCell>
                    <TableCell className="pb-1">{new Date(qt.createdAt).toLocaleDateString("vi-VN")}</TableCell>
                    <TableCell className="text-right font-bold text-primary pb-1">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(qt.grandTotal)}
                    </TableCell>
                    <TableCell className="pb-1">
                      <Badge variant={
                        qt.status === 'ACCEPTED' ? 'default' : 
                        qt.status === 'REJECTED' ? 'destructive' : 
                        'secondary'
                      }>
                        {qt.status === 'ACCEPTED' ? 'ĐÃ CHỐT' : qt.status === 'REJECTED' ? 'ĐÃ HUỶ' : 'NHÁP'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                  <TableRow className="bg-zinc-50/30 hover:bg-zinc-50/30">
                    <TableCell colSpan={4} className="pt-2 pb-4">
                      <div className="flex items-center gap-2 flex-wrap">
                        <a href={`/api/quotations/${qt.id}/pdf`} target="_blank" rel="noreferrer" title="Tải PDF">
                          <Button variant="ghost" size="icon" className="h-8 w-8 bg-zinc-100 hover:bg-zinc-200"><FileText className="h-4 w-4 text-red-500" /></Button>
                        </a>
                        <a href={`/api/quotations/${qt.id}/excel`} target="_blank" rel="noreferrer" title="Tải Excel">
                          <Button variant="ghost" size="icon" className="h-8 w-8 bg-zinc-100 hover:bg-zinc-200"><FileSpreadsheet className="h-4 w-4 text-green-600" /></Button>
                        </a>
                        <Link href={`/quotations/${qt.id}/delivery-note`} target="_blank">
                          <Button variant="ghost" size="icon" className="h-8 w-8 bg-zinc-100 hover:bg-zinc-200" title="In phiếu xuất kho bán hàng"><Package className="h-4 w-4 text-orange-600" /></Button>
                        </Link>
                        {/* Tạm ẩn nút chia sẻ theo yêu cầu
                        <Button variant="ghost" size="icon" className="h-8 w-8 bg-zinc-100 hover:bg-zinc-200" title="Chia sẻ" onClick={() => handleShare(qt)}>
                          <Share2 className="h-4 w-4 text-blue-600" />
                        </Button>
                        <div className="w-px h-4 bg-zinc-200 mx-1"></div>
                        */}
                        <Link href={`/quotations/${qt.id}/edit`}>
                          <Button variant="ghost" size="icon" className="h-8 w-8 bg-zinc-100 hover:bg-zinc-200" title="Chỉnh sửa">
                            <Pencil className="h-4 w-4 text-blue-500" />
                          </Button>
                        </Link>
                        {qt.status !== 'ACCEPTED' && qt.status !== 'REJECTED' && (
                          <>
                            <div className="w-px h-4 bg-zinc-200 mx-1"></div>
                            <Button variant="ghost" size="icon" className="h-8 w-8 bg-zinc-100 hover:bg-zinc-200" title="Chốt báo giá" onClick={() => handleUpdateStatus(qt.id, 'ACCEPTED')}>
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 bg-zinc-100 hover:bg-zinc-200" title="Huỷ báo giá" onClick={() => handleUpdateStatus(qt.id, 'REJECTED')}>
                              <XCircle className="h-4 w-4 text-orange-500" />
                            </Button>
                          </>
                        )}
                        
                        <div className="w-px h-4 bg-zinc-200 mx-1"></div>
                        {archiveTab === 'active' ? (
                          <Button variant="ghost" size="icon" className="h-8 w-8 bg-zinc-100 hover:bg-zinc-200" title="Ẩn báo giá" onClick={() => handleArchive(qt.id)}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        ) : (
                          <Button variant="ghost" size="icon" className="h-8 w-8 bg-zinc-100 hover:bg-zinc-200" title="Khôi phục" onClick={() => handleRestore(qt.id)}>
                            <RotateCcw className="h-4 w-4 text-green-500" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                </React.Fragment>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur border-t p-3 md:p-4 z-10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap hide-scrollbar max-w-7xl mx-auto">
          <Button size="sm" variant={viewTab === 'ALL' ? 'default' : 'outline'} onClick={() => setViewTab('ALL')}>Tất cả</Button>
          <Button size="sm" variant={viewTab === 'ACCEPTED' ? 'default' : 'outline'} onClick={() => setViewTab('ACCEPTED')}>Đã chốt / Đã làm</Button>
          <Button size="sm" variant={viewTab === 'REJECTED' ? 'default' : 'outline'} onClick={() => setViewTab('REJECTED')}>Đã huỷ</Button>
          <div className="w-px h-6 bg-zinc-300 shrink-0 mx-1"></div>
          <Button size="sm" variant={archiveTab === 'active' ? 'default' : 'outline'} onClick={() => setArchiveTab('active')}>Đang hiển thị</Button>
          <Button size="sm" variant={archiveTab === 'inactive' ? 'default' : 'outline'} onClick={() => setArchiveTab('inactive')}>Đã ẩn</Button>
        </div>
      </div>
    </div>
  );
}
