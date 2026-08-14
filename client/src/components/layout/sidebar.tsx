"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, FolderKanban, FileText, FileSignature, Settings, Boxes, Briefcase, ChevronDown, ChevronRight, Tags, Bookmark, Truck } from "lucide-react";
import { useState, useEffect } from "react";

export function Sidebar() {
  const pathname = usePathname();
  const [catalogOpen, setCatalogOpen] = useState(pathname.startsWith('/catalog'));
  const [contractsOpen, setContractsOpen] = useState(pathname.startsWith('/contracts'));
  const [company, setCompany] = useState<{ name: string; logo: string | null }>({ name: "ELV CRM PRO", logo: null });

  useEffect(() => {
    fetch("/api/settings/company")
      .then(res => res.json())
      .then(data => {
        if (data) setCompany({ name: data.name || "ELV CRM PRO", logo: data.logo || null });
      })
      .catch(err => console.error("Error fetching company info:", err));
  }, []);

  const navItems = [
    { href: "/", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/leads", icon: FolderKanban, label: "Cơ hội (Leads)" },
    { href: "/customers", icon: Users, label: "Khách hàng" },
  ];

  const bottomItems = [
    { href: "/quotations", icon: FileText, label: "Báo giá" },
    { href: "/projects", icon: Briefcase, label: "Dự án & Thi công" },
  ];

  return (
    <div className="flex h-screen w-64 flex-col border-r bg-zinc-950 text-zinc-50">
      <div className="flex h-14 items-center justify-center gap-2 border-b border-zinc-800 px-4">
        {company.logo ? (
          <img src={company.logo} alt={company.name} className="h-10 w-auto object-contain" />
        ) : (
          <span className="text-xl font-bold tracking-tight text-primary">{company.name}</span>
        )}
      </div>



      <div className="flex-1 overflow-y-auto py-4 scrollbar-none">
        <nav className="space-y-1 px-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors hover:bg-zinc-800 hover:text-white ${pathname === item.href ? 'bg-zinc-800 text-white' : 'text-zinc-300'}`}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          ))}

          {/* Catalog Group */}
          <div>
            <button
              onClick={() => setCatalogOpen(!catalogOpen)}
              className={`w-full flex items-center justify-between rounded-md px-3 py-2.5 text-sm font-medium transition-colors hover:bg-zinc-800 hover:text-white ${pathname.startsWith('/catalog') ? 'text-white' : 'text-zinc-300'}`}
            >
              <div className="flex items-center gap-3">
                <Boxes className="h-5 w-5" />
                Vật tư & Nhân công
              </div>
              {catalogOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </button>
            
            {catalogOpen && (
              <div className="ml-9 mt-1 space-y-1 border-l border-zinc-800 pl-2">
                <Link href="/catalog" className={`block rounded-md px-3 py-2 text-sm transition-colors hover:bg-zinc-800 hover:text-white ${pathname === '/catalog' ? 'bg-zinc-800 text-white font-medium' : 'text-zinc-400'}`}>
                  Danh sách Vật tư
                </Link>
                <Link href="/catalog/categories" className={`block rounded-md px-3 py-2 text-sm transition-colors hover:bg-zinc-800 hover:text-white ${pathname === '/catalog/categories' ? 'bg-zinc-800 text-white font-medium' : 'text-zinc-400'}`}>
                  Danh mục
                </Link>
                <Link href="/catalog/brands" className={`block rounded-md px-3 py-2 text-sm transition-colors hover:bg-zinc-800 hover:text-white ${pathname === '/catalog/brands' ? 'bg-zinc-800 text-white font-medium' : 'text-zinc-400'}`}>
                  Thương hiệu
                </Link>
                <Link href="/catalog/suppliers" className={`block rounded-md px-3 py-2 text-sm transition-colors hover:bg-zinc-800 hover:text-white ${pathname === '/catalog/suppliers' ? 'bg-zinc-800 text-white font-medium' : 'text-zinc-400'}`}>
                  Nhà cung cấp
                </Link>
              </div>
            )}
          </div>

          {/* Contracts Group */}
          <div>
            <button
              onClick={() => setContractsOpen(!contractsOpen)}
              className={`w-full flex items-center justify-between rounded-md px-3 py-2.5 text-sm font-medium transition-colors hover:bg-zinc-800 hover:text-white ${pathname.startsWith('/contracts') ? 'text-white' : 'text-zinc-300'}`}
            >
              <div className="flex items-center gap-3">
                <FileSignature className="h-5 w-5" />
                Hợp đồng
              </div>
              {contractsOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </button>
            
            {contractsOpen && (
              <div className="ml-9 mt-1 space-y-1 border-l border-zinc-800 pl-2">
                <Link href="/contracts" className={`block rounded-md px-3 py-2 text-sm transition-colors hover:bg-zinc-800 hover:text-white ${pathname === '/contracts' ? 'bg-zinc-800 text-white font-medium' : 'text-zinc-400'}`}>
                  Danh sách Hợp đồng
                </Link>
                <Link href="/contracts/template" className={`block rounded-md px-3 py-2 text-sm transition-colors hover:bg-zinc-800 hover:text-white ${pathname === '/contracts/template' ? 'bg-zinc-800 text-white font-medium' : 'text-zinc-400'}`}>
                  Điều khoản mẫu
                </Link>
              </div>
            )}
          </div>

          {bottomItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors hover:bg-zinc-800 hover:text-white ${pathname === item.href ? 'bg-zinc-800 text-white' : 'text-zinc-300'}`}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="border-t border-zinc-800 p-4">
        <Link href="/settings" className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-zinc-400 hover:bg-zinc-800 hover:text-white">
          <Settings className="h-5 w-5" />
          Cấu hình
        </Link>
      </div>
    </div>
  );
}
