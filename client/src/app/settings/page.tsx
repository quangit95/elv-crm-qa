"use client";

import { useState } from "react";
import { CompanyForm } from "./components/CompanyForm";
import { AccountForm } from "./components/AccountForm";
import { Building2, UserCircle } from "lucide-react";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<"company" | "account">("company");

  return (
    <div className="flex h-full flex-col">
      <div className="flex-none border-b border-zinc-800 bg-zinc-950/50 p-6">
        <h1 className="text-2xl font-bold tracking-tight text-white">Cấu hình hệ thống</h1>
        <p className="text-sm text-zinc-400 mt-1">
          Quản lý thông tin công ty và cài đặt tài khoản của bạn.
        </p>
      </div>

      <div className="flex flex-1 flex-col gap-6 p-6 lg:flex-row">
        {/* Sidebar Tabs */}
        <aside className="w-full lg:w-64 flex-none">
          <nav className="flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1">
            <button
              onClick={() => setActiveTab("company")}
              className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                activeTab === "company"
                  ? "bg-zinc-800 text-white"
                  : "text-zinc-400 hover:bg-zinc-800/50 hover:text-white"
              }`}
            >
              <Building2 className="h-4 w-4" />
              Thông tin công ty
            </button>
            <button
              onClick={() => setActiveTab("account")}
              className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                activeTab === "account"
                  ? "bg-zinc-800 text-white"
                  : "text-zinc-400 hover:bg-zinc-800/50 hover:text-white"
              }`}
            >
              <UserCircle className="h-4 w-4" />
              Tài khoản & Bảo mật
            </button>
          </nav>
        </aside>

        {/* Content Area */}
        <div className="flex-1">
          {activeTab === "company" && <CompanyForm />}
          {activeTab === "account" && <AccountForm />}
        </div>
      </div>
    </div>
  );
}
