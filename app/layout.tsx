import type { Metadata } from "next";
import "./globals.css";
import { AppShell } from "@/components/app-shell";
import { AppDataProvider } from "@/lib/data/app-data-provider";

export const metadata: Metadata = {
  title: "보험설계사 개인 CRM",
  description: "고객관리, 상담기록, 팔로업, 체크리스트를 한 번에 관리하는 MVP"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <AppDataProvider>
          <AppShell>{children}</AppShell>
        </AppDataProvider>
      </body>
    </html>
  );
}
