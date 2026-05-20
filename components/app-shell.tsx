"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  CalendarCheck,
  CheckSquare,
  ClipboardList,
  LayoutDashboard,
  MessageSquareText,
  ShieldCheck,
  Users
} from "lucide-react";
import { useAppData } from "@/lib/data/app-data-provider";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "대시보드", icon: LayoutDashboard },
  { href: "/customers", label: "고객관리", icon: Users },
  { href: "/consultations", label: "상담기록", icon: ClipboardList },
  { href: "/followups", label: "팔로업", icon: CalendarCheck },
  { href: "/checklist", label: "체크리스트", icon: CheckSquare },
  { href: "/templates", label: "템플릿", icon: MessageSquareText },
  { href: "/stats", label: "통계", icon: BarChart3 }
];

function pageTitle(pathname: string) {
  return navItems.find((item) => item.href === pathname)?.label ?? "대시보드";
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { dataMode } = useAppData();
  const modeLabel = dataMode === "supabase" ? "Supabase 모드" : "Mock 데이터 모드";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-slate-200 bg-white px-4 py-5 lg:block">
        <Link href="/" className="flex items-center gap-3 px-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-md bg-slate-950 text-white shadow-sm">
            <ShieldCheck size={22} />
          </span>
          <span>
            <span className="block text-sm font-semibold text-slate-950">보험 CRM</span>
            <span className="block text-xs text-slate-500">오늘 연락과 상담 관리</span>
          </span>
        </Link>

        <nav className="mt-8 grid gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex h-11 items-center gap-3 rounded-md px-3 text-sm font-medium transition",
                  active
                    ? "bg-slate-950 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                )}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
          <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-4 sm:px-6 lg:px-8">
            <div>
              <p className="text-xs font-medium text-slate-500">보험설계사 개인 업무관리</p>
              <h1 className="text-lg font-semibold text-slate-950">{pageTitle(pathname)}</h1>
            </div>
            <div className="hidden rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-600 sm:block">
              {modeLabel}
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-[1440px] px-4 pb-24 pt-5 sm:px-6 lg:px-8 lg:pb-10">{children}</main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white lg:hidden">
        <div className="scrollbar-none flex overflow-x-auto px-2 py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex min-w-20 flex-1 flex-col items-center gap-1 rounded-md px-2 py-2 text-xs font-medium",
                  active ? "bg-slate-950 text-white" : "text-slate-500"
                )}
              >
                <Icon size={18} />
                <span className="whitespace-nowrap">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
