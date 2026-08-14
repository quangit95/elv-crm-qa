"use client";

import { Bell, Search, User, Menu, LayoutDashboard, FolderKanban, Users, Boxes, FileText, Settings, Briefcase, ChevronDown, ChevronRight, FileSignature } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";

export function Topbar() {
  const pathname = usePathname();
  const [catalogOpen, setCatalogOpen] = useState(pathname.startsWith('/catalog'));
  const [contractsOpen, setContractsOpen] = useState(pathname.startsWith('/contracts'));

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
    <header className="flex h-14 items-center justify-between border-b bg-white px-4 dark:bg-zinc-950 dark:border-zinc-800">
      <div className="flex items-center gap-2 lg:hidden">
        <Sheet>
          <SheetTrigger className="flex h-9 w-9 items-center justify-center rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0 bg-zinc-950 text-zinc-50 border-r-zinc-800">
            <div className="flex h-14 items-center border-b border-zinc-800 px-4">
              <span className="text-lg font-bold tracking-tight text-primary">ELV CRM PRO</span>
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
          </SheetContent>
        </Sheet>
      </div>

      <div className="flex w-full max-w-sm items-center space-x-2 ml-2 md:ml-0">
        <Search className="h-4 w-4 text-zinc-500" />
        <Input 
          type="search" 
          placeholder="Tìm kiếm..." 
          className="h-8 border-none bg-transparent shadow-none focus-visible:ring-0" 
        />
      </div>
      <div className="flex items-center space-x-2 md:space-x-4">
        <Button variant="ghost" size="icon" className="text-zinc-500 hidden sm:flex">
          <Bell className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" className="rounded-full bg-zinc-100 dark:bg-zinc-800">
          <User className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
}
