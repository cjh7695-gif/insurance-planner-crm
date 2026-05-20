"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  AlertTriangle,
  CalendarDays,
  CalendarRange,
  CheckCircle2,
  MessageSquareText,
  NotebookPen,
  Phone
} from "lucide-react";
import { getWeekRange } from "@/lib/analytics";
import { useAppData } from "@/lib/data/app-data-provider";
import { getFollowupGroups } from "@/lib/workflow";
import type { Customer } from "@/lib/types";
import { formatDate, today, truncate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

function FollowupSection({
  title,
  description,
  tone,
  customers,
  renderActions
}: {
  title: string;
  description: string;
  tone: "sky" | "rose" | "emerald" | "amber" | "slate";
  customers: Customer[];
  renderActions: (customer: Customer) => React.ReactNode;
}) {
  const toneClass = {
    sky: "border-l-sky-400",
    rose: "border-l-rose-400",
    emerald: "border-l-emerald-400",
    amber: "border-l-amber-400",
    slate: "border-l-slate-400"
  }[tone];

  return (
    <Card className={`overflow-hidden border-l-4 ${toneClass}`}>
      <CardHeader className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
        <div>
          <CardTitle>{title}</CardTitle>
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        </div>
        <Badge tone={tone} className="w-fit">
          {customers.length}명
        </Badge>
      </CardHeader>
      <CardContent className="grid gap-3">
        {customers.map((customer) => (
          <div
            key={customer.id}
            className="grid min-w-0 gap-4 rounded-md border border-slate-200 bg-white p-4 lg:grid-cols-[minmax(0,1fr)_minmax(280px,420px)] lg:items-center"
          >
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-semibold text-slate-950">{customer.name}</p>
                <Badge>{customer.grade}</Badge>
                <Badge tone="sky">{customer.stage}</Badge>
              </div>
              <p className="mt-2 text-sm font-medium text-slate-700">
                {truncate(customer.nextAction, 90) || "다음 액션이 없습니다."}
              </p>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400">
                <span>{customer.phone}</span>
                <span>다음 연락일 {formatDate(customer.nextContactDate)}</span>
              </div>
            </div>
            {renderActions(customer)}
          </div>
        ))}
        {customers.length === 0 && (
          <div className="rounded-md bg-slate-50 p-4 text-sm text-slate-500">
            해당 고객이 없습니다.
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function FollowupsPage() {
  const { customers, completeContact, rescheduleCustomer } = useAppData();
  const [dates, setDates] = useState<Record<string, string>>({});
  const day = today();
  const week = getWeekRange();

  const groups = useMemo(() => getFollowupGroups(customers, day), [customers, day]);

  function actionPanel(customer: Customer) {
    const date = dates[customer.id] ?? customer.nextContactDate ?? day;

    return (
      <div className="grid min-w-0 gap-2 sm:grid-cols-2">
        <Button
          size="sm"
          variant="secondary"
          className="w-full"
          onClick={() => void completeContact(customer.id)}
        >
          <Phone size={15} />
          연락 완료
        </Button>
        <Link
          href="/consultations"
          className="inline-flex h-8 w-full items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-xs font-medium text-slate-800"
        >
          <NotebookPen size={15} />
          상담기록 추가
        </Link>
        <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] gap-2 sm:col-span-2">
          <Input
            type="date"
            value={date}
            onChange={(event) =>
              setDates((current) => ({
                ...current,
                [customer.id]: event.target.value
              }))
            }
            className="h-8"
          />
          <Button
            size="sm"
            variant="outline"
            onClick={() => void rescheduleCustomer(customer.id, date, customer.nextAction)}
          >
            <CalendarDays size={15} />
            변경
          </Button>
        </div>
        <Link
          href="/templates"
          className="inline-flex h-8 w-full items-center justify-center gap-2 rounded-md bg-slate-100 px-3 text-xs font-medium text-slate-700 sm:col-span-2"
        >
          <MessageSquareText size={15} />
          메시지 템플릿 보기
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-5">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardContent className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-slate-500">오늘 연락</p>
              <p className="mt-2 text-3xl font-semibold text-slate-950">
                {groups.todayContacts.length}
              </p>
            </div>
            <Phone className="text-sky-500" size={24} />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-slate-500">지난 연락일</p>
              <p className="mt-2 text-3xl font-semibold text-rose-700">
                {groups.overdueContacts.length}
              </p>
            </div>
            <AlertTriangle className="text-rose-500" size={24} />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-slate-500">이번 주 예정</p>
              <p className="mt-2 text-3xl font-semibold text-emerald-700">
                {groups.weekContacts.length}
              </p>
              <p className="mt-1 text-xs text-slate-400">
                {formatDate(day)} ~ {formatDate(week.end)}
              </p>
            </div>
            <CalendarRange className="text-emerald-500" size={24} />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-slate-500">청약 후 관리</p>
              <p className="mt-2 text-3xl font-semibold text-amber-700">
                {groups.applicationCare.length}
              </p>
            </div>
            <CheckCircle2 className="text-amber-500" size={24} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-5">
        <FollowupSection
          title="오늘 연락해야 할 고객"
          description="오늘 날짜로 잡힌 연락만 모았습니다."
          tone="sky"
          customers={groups.todayContacts}
          renderActions={actionPanel}
        />
        <FollowupSection
          title="지난 연락일 고객"
          description="연락 예정일이 지난 고객입니다. 가장 먼저 처리하세요."
          tone="rose"
          customers={groups.overdueContacts}
          renderActions={actionPanel}
        />
        <FollowupSection
          title="이번 주 연락 예정 고객"
          description="오늘 이후 이번 주 안에 연락할 고객입니다."
          tone="emerald"
          customers={groups.weekContacts}
          renderActions={actionPanel}
        />
        <FollowupSection
          title="청약완료 후 관리 필요한 고객"
          description="청약 이후 감사 메시지와 관리 일정을 챙길 고객입니다."
          tone="amber"
          customers={groups.applicationCare}
          renderActions={actionPanel}
        />
      </div>
    </div>
  );
}
