"use client";

import Link from "next/link";
import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  CheckSquare,
  ClipboardList,
  MessageSquareText,
  Phone,
  TrendingUp
} from "lucide-react";
import { activitySummary, checklistProgress, getWeekRange } from "@/lib/analytics";
import { useAppData } from "@/lib/data/app-data-provider";
import { getFollowupGroups, getPendingChecklistItems } from "@/lib/workflow";
import { formatDate, today, truncate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export default function DashboardPage() {
  const {
    customers,
    checklistItems,
    checklistLogs,
    activities,
    completeContact
  } = useAppData();
  const day = today();
  const week = getWeekRange();
  const progress = checklistProgress(checklistItems, checklistLogs, day);
  const followups = getFollowupGroups(customers, day);
  const overdueContacts = followups.overdueContacts;
  const todayContacts = followups.todayContacts;
  const pendingChecklist = getPendingChecklistItems(checklistItems, checklistLogs, day);
  const weeklySummary = activitySummary(activities, week.start, week.end);
  const dueContactsCount = overdueContacts.length + todayContacts.length;
  const weeklyActivityCount = weeklySummary.reduce((sum, item) => sum + item.count, 0);
  const firstAction =
    overdueContacts[0]?.nextAction ||
    todayContacts[0]?.nextAction ||
    pendingChecklist[0]?.title ||
    "오늘 기록을 정리하세요.";

  return (
    <div className="grid gap-5">
      <section className="grid gap-3 md:grid-cols-4">
        <Card>
          <CardContent>
            <p className="text-sm font-medium text-slate-500">오늘 처리할 연락</p>
            <p className="mt-2 text-3xl font-semibold tracking-normal text-slate-950">
              {dueContactsCount}
            </p>
            <p className="mt-1 text-xs text-slate-400">지연 {overdueContacts.length} · 오늘 {todayContacts.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-sm font-medium text-slate-500">체크리스트</p>
            <p className="mt-2 text-3xl font-semibold tracking-normal text-slate-950">
              {progress.value}%
            </p>
            <p className="mt-1 text-xs text-slate-400">{progress.done}/{progress.total} 완료</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-sm font-medium text-slate-500">남은 활동</p>
            <p className="mt-2 text-3xl font-semibold tracking-normal text-slate-950">
              {pendingChecklist.length}
            </p>
            <p className="mt-1 text-xs text-slate-400">오늘 기준 미완료</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-sm font-medium text-slate-500">이번 주 활동</p>
            <p className="mt-2 text-3xl font-semibold tracking-normal text-slate-950">
              {weeklyActivityCount}
            </p>
            <p className="mt-1 text-xs text-slate-400">{formatDate(week.start)}부터</p>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.45fr_0.75fr]">
        <div className="grid gap-4">
          <Card className="border-slate-300">
            <CardHeader className="grid gap-3 md:grid-cols-[1fr_auto] md:items-center">
              <div>
                <CardTitle>오늘 먼저 연락할 고객</CardTitle>
                <p className="mt-1 text-sm text-slate-500">
                  {formatDate(day)} 기준으로 지연 연락을 가장 위에 보여줍니다.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge tone={overdueContacts.length ? "rose" : "slate"}>
                  지연 {overdueContacts.length}
                </Badge>
                <Badge tone="sky">오늘 연락 {todayContacts.length}</Badge>
                <Badge tone="emerald">체크 {progress.done}/{progress.total}</Badge>
              </div>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="rounded-md bg-slate-950 p-4 text-white">
                <p className="text-xs font-semibold text-slate-300">
                  지금 할 일
                </p>
                <p className="mt-2 text-lg font-semibold leading-7">{firstAction}</p>
              </div>

              <div className="grid gap-3">
                {overdueContacts.slice(0, 4).map((customer) => (
                  <div
                    key={customer.id}
                    className="grid gap-3 rounded-md border border-rose-100 bg-rose-50/60 p-4 md:grid-cols-[40px_1fr_auto] md:items-center"
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-md bg-rose-100 text-rose-700">
                      <AlertTriangle size={18} />
                    </span>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-slate-950">{customer.name}</p>
                        <Badge tone="rose">지난 연락일</Badge>
                        <Badge>{formatDate(customer.nextContactDate)}</Badge>
                      </div>
                      <p className="mt-1 text-sm text-slate-700">
                        {truncate(customer.nextAction, 84) || "다음 액션을 정해 연락하세요."}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2 md:justify-end">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => void completeContact(customer.id)}
                      >
                        <Phone size={15} />
                        연락 완료
                      </Button>
                      <Link
                        href="/consultations"
                        className="inline-flex h-8 items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-xs font-medium text-slate-800"
                      >
                        <ClipboardList size={15} />
                        기록
                      </Link>
                    </div>
                  </div>
                ))}

                {todayContacts.slice(0, 5).map((customer) => (
                  <div
                    key={customer.id}
                    className="grid gap-3 rounded-md border border-slate-200 bg-white p-4 md:grid-cols-[40px_1fr_auto] md:items-center"
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-md bg-sky-100 text-sky-700">
                      <Phone size={18} />
                    </span>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-slate-950">{customer.name}</p>
                        <Badge tone="sky">오늘 연락</Badge>
                        <Badge>{customer.stage}</Badge>
                      </div>
                      <p className="mt-1 text-sm text-slate-700">
                        {truncate(customer.nextAction, 84) || "연락 후 다음 액션을 남기세요."}
                      </p>
                      <p className="mt-1 text-xs text-slate-400">{customer.phone}</p>
                    </div>
                    <div className="flex flex-wrap gap-2 md:justify-end">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => void completeContact(customer.id)}
                      >
                        <Phone size={15} />
                        연락 완료
                      </Button>
                      <Link
                        href="/templates"
                        className="inline-flex h-8 items-center justify-center gap-2 rounded-md bg-slate-100 px-3 text-xs font-medium text-slate-700"
                      >
                        <MessageSquareText size={15} />
                        템플릿
                      </Link>
                    </div>
                  </div>
                ))}

                {overdueContacts.length === 0 && todayContacts.length === 0 && (
                  <div className="rounded-md bg-slate-50 p-4 text-sm text-slate-500">
                    오늘 예정된 고객 연락은 없습니다. 체크리스트 활동부터 진행하세요.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-3">
              <div>
                <CardTitle>오늘 남은 활동</CardTitle>
                <p className="mt-1 text-sm text-slate-500">
                  완료하지 않은 성공 체크리스트입니다.
                </p>
              </div>
              <Badge tone="emerald">{pendingChecklist.length}개 남음</Badge>
            </CardHeader>
            <CardContent className="grid gap-3">
              {pendingChecklist.slice(0, 6).map((item) => (
                <Link
                  key={item.id}
                  href="/checklist"
                  className="flex items-center justify-between gap-3 rounded-md border border-slate-100 p-3 text-sm transition hover:bg-slate-50"
                >
                  <span className="flex items-center gap-3">
                    <CheckSquare size={18} className="text-slate-400" />
                    <span className="font-medium text-slate-800">{item.title}</span>
                  </span>
                  <span className="text-xs text-slate-400">
                    목표 {item.targetCount ?? 1}
                    {item.unit ?? "회"}
                  </span>
                </Link>
              ))}
              {pendingChecklist.length === 0 && (
                <div className="rounded-md bg-emerald-50 p-4 text-sm text-emerald-800">
                  오늘 체크리스트를 모두 완료했습니다.
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4">
          <Card>
            <CardHeader>
              <CardTitle>오늘 실행률</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between gap-3">
                <div>
                  <p className="text-3xl font-semibold text-slate-950">{progress.value}%</p>
                  <p className="text-sm text-slate-500">
                    {progress.done}/{progress.total} 완료
                  </p>
                </div>
                <CheckCircle2 className="text-emerald-500" size={34} />
              </div>
              <Progress value={progress.value} className="mt-4" />
              <Link
                href="/checklist"
                className="mt-4 inline-flex h-9 items-center justify-center rounded-md bg-slate-950 px-3 text-sm font-medium text-white"
              >
                체크리스트 열기
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>이번 주 활동</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3">
              {weeklySummary.map((item) => (
                <div key={item.type} className="rounded-md bg-slate-50 p-3">
                  <p className="text-xs font-medium text-slate-500">{item.label}</p>
                  <p className="mt-1 text-2xl font-semibold text-slate-950">{item.count}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>파이프라인 주의</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 text-sm">
              <div className="flex items-center gap-3">
                <CalendarClock className="text-sky-500" size={18} />
                <span>{customers.filter((customer) => customer.stage === "상담예정").length}건 상담 예정</span>
              </div>
              <div className="flex items-center gap-3">
                <TrendingUp className="text-emerald-500" size={18} />
                <span>{customers.filter((customer) => customer.stage === "보장분석중").length}건 분석 진행</span>
              </div>
              <div className="flex items-center gap-3">
                <AlertTriangle className="text-amber-500" size={18} />
                <span>{customers.filter((customer) => customer.stage === "보류").length}건 보류 관리</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
