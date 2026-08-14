"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

type Lead = {
  id: string;
  title: string;
  status: string;
  notes: string;
  customer: { name: string };
};

const STATUSES = [
  { id: "NEW", label: "Mới" },
  { id: "SURVEYED", label: "Đã khảo sát" },
  { id: "QUOTED", label: "Đã báo giá" },
  { id: "NEGOTIATING", label: "Thương lượng" },
  { id: "WON", label: "Trúng thầu" },
];

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/leads")
      .then((res) => res.json())
      .then((data) => {
        setLeads(data);
        setLoading(false);
      });
  }, []);

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Phễu Bán Hàng (Leads)</h1>
          <p className="text-zinc-500">Quản lý cơ hội và dự án sắp tới.</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Thêm Cơ Hội
        </Button>
      </div>

      <div className="flex flex-1 gap-4 overflow-x-auto pb-4">
        {STATUSES.map((status) => {
          const colLeads = leads.filter((l) => l.status === status.id);
          return (
            <div key={status.id} className="flex h-full w-80 min-w-80 flex-col rounded-lg bg-zinc-100 p-4 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-semibold text-sm uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                  {status.label}
                </h3>
                <Badge variant="secondary" className="bg-white dark:bg-zinc-800">
                  {colLeads.length}
                </Badge>
              </div>
              <div className="flex flex-1 flex-col gap-3 overflow-y-auto">
                {colLeads.map((lead) => (
                  <Card key={lead.id} className="cursor-pointer hover:border-primary transition-colors shadow-sm">
                    <CardHeader className="p-4 pb-2">
                      <CardTitle className="text-base">{lead.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0 text-sm text-zinc-500">
                      <p>{lead.customer?.name}</p>
                    </CardContent>
                  </Card>
                ))}
                {!loading && colLeads.length === 0 && (
                  <div className="flex h-24 items-center justify-center rounded-md border border-dashed border-zinc-300 dark:border-zinc-700">
                    <span className="text-sm text-zinc-500">Không có dữ liệu</span>
                  </div>
                )}
                {loading && (
                  <div className="h-24 animate-pulse rounded-md bg-zinc-200 dark:bg-zinc-800" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
