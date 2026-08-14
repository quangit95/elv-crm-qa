"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FolderKanban, Users, FileText, CheckCircle2 } from "lucide-react";

type DashboardData = {
  totalLeads: number;
  newCustomers: number;
  pendingQuotations: { count: number, value: number };
  completedProjectsCount: number;
  recentQuotations: Array<{
    id: string;
    code: string;
    grandTotal: number;
    lead?: {
      title: string;
      customer?: { name: string }
    }
  }>;
  activeProjects: Array<{
    id: string;
    name: string;
    status: string;
    customer?: { name: string }
  }>;
};

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard")
      .then(res => res.json())
      .then(json => {
        if (json.error) {
          console.error(json.error);
          setData(null);
        } else {
          setData(json);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setData(null);
        setLoading(false);
      });
  }, []);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-zinc-500">Đang tải dữ liệu tổng quan...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-red-500">Không thể tải dữ liệu. Vui lòng kiểm tra kết nối mạng hoặc thử lại sau.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-zinc-500">Tổng quan tình hình kinh doanh Điện Nhẹ.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng Cơ Hội (Leads)</CardTitle>
            <FolderKanban className="h-4 w-4 text-zinc-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalLeads}</div>
            <p className="text-xs text-zinc-500">Tổng quan hệ thống</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Khách Hàng</CardTitle>
            <Users className="h-4 w-4 text-zinc-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.newCustomers}</div>
            <p className="text-xs text-zinc-500">Đã đăng ký</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Báo Giá Đang Chờ</CardTitle>
            <FileText className="h-4 w-4 text-zinc-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.pendingQuotations.count}</div>
            <p className="text-xs text-zinc-500">Tổng giá trị: {formatCurrency(data.pendingQuotations.value)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dự Án Hoàn Thành</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-zinc-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.completedProjectsCount}</div>
            <p className="text-xs text-zinc-500">Tổng toàn thời gian</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Báo giá gần đây</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {data.recentQuotations.length === 0 ? (
                <p className="text-sm text-zinc-500">Chưa có báo giá nào.</p>
              ) : (
                data.recentQuotations.map((qt) => (
                  <div key={qt.id} className="flex items-center gap-4">
                    <div className="flex-1 min-w-0 space-y-1">
                      <p className="text-sm font-medium leading-none truncate">
                        <a href={`/api/quotations/${qt.id}/pdf`} target="_blank" rel="noreferrer" className="text-primary hover:underline" title="Xem nhanh báo giá">
                          {qt.code}
                        </a> - {qt.lead?.title || 'Không rõ'}
                      </p>
                      <p className="text-sm text-zinc-500 truncate">Khách hàng: {qt.lead?.customer?.name || 'Không rõ'}</p>
                    </div>
                    <div className="font-medium text-primary whitespace-nowrap">{formatCurrency(qt.grandTotal)}</div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Dự án đang thi công</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {data.activeProjects.length === 0 ? (
                <p className="text-sm text-zinc-500">Chưa có dự án nào đang chạy.</p>
              ) : (
                data.activeProjects.map((proj) => (
                  <div key={proj.id} className="flex flex-col space-y-1">
                    <div className="flex items-center justify-between gap-4">
                      <p className="text-sm font-medium leading-none truncate">{proj.name}</p>
                      <p className="text-sm font-medium text-primary whitespace-nowrap">{proj.status}</p>
                    </div>
                    <div className="h-2 w-full rounded-full bg-zinc-100 dark:bg-zinc-800">
                      <div className="h-2 rounded-full bg-primary" style={{ width: "50%" }}></div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
