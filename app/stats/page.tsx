"use client";

import { useMemo, useState } from "react";
import { BarChart3, CalendarRange } from "lucide-react";
import {
  checklistRangeRate,
  countActivities,
  countConsultations,
  countCustomersCreated,
  getMonthRange,
  getWeekRange
} from "@/lib/analytics";
import { useAppData } from "@/lib/data/app-data-provider";
import { ACTIVITY_LABELS } from "@/lib/constants";
import type { ActivityType } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const activityTypes: ActivityType[] = [
  "new_contact",
  "coverage_proposal",
  "application_completed",
  "referral_request"
];

export default function StatsPage() {
  const {
    customers,
    consultations,
    activities,
    checklistItems,
    checklistLogs
  } = useAppData();
  const [period, setPeriod] = useState<"week" | "month">("week");
  const range = period === "week" ? getWeekRange() : getMonthRange();

  const stats = useMemo(() => {
    const newCustomers = countCustomersCreated(customers, range.start, range.end);
    const consultationCount = countConsultations(consultations, range.start, range.end);
    const checklistRate = checklistRangeRate(checklistItems, checklistLogs, range.start, range.end);
    const activitiesByType = activityTypes.map((type) => ({
      type,
      label: ACTIVITY_LABELS[type],
      count: countActivities(activities, type, range.start, range.end)
    }));
    const max = Math.max(1, newCustomers, consultationCount, ...activitiesByType.map((item) => item.count));

    return {
      newCustomers,
      consultationCount,
      checklistRate,
      activitiesByType,
      max
    };
  }, [activities, checklistItems, checklistLogs, consultations, customers, range.end, range.start]);

  const metricCards = [
    { label: "신규 등록 고객 수", value: stats.newCustomers, tone: "sky" as const },
    { label: "상담기록 수", value: stats.consultationCount, tone: "emerald" as const },
    {
      label: "신규 연락 수",
      value: stats.activitiesByType.find((item) => item.type === "new_contact")?.count ?? 0,
      tone: "amber" as const
    },
    {
      label: "보장분석 제안 수",
      value: stats.activitiesByType.find((item) => item.type === "coverage_proposal")?.count ?? 0,
      tone: "violet" as const
    },
    {
      label: "청약완료 고객 수",
      value: stats.activitiesByType.find((item) => item.type === "application_completed")?.count ?? 0,
      tone: "emerald" as const
    },
    {
      label: "소개 요청 수",
      value: stats.activitiesByType.find((item) => item.type === "referral_request")?.count ?? 0,
      tone: "sky" as const
    }
  ];

  return (
    <div className="grid gap-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-slate-500">
            {range.start} ~ {range.end}
          </p>
          <h2 className="text-xl font-semibold text-slate-950">활동 통계</h2>
        </div>
        <div className="flex rounded-md border border-slate-200 bg-white p-1">
          <Button
            size="sm"
            variant={period === "week" ? "primary" : "ghost"}
            onClick={() => setPeriod("week")}
          >
            이번 주
          </Button>
          <Button
            size="sm"
            variant={period === "month" ? "primary" : "ghost"}
            onClick={() => setPeriod("month")}
          >
            이번 달
          </Button>
        </div>
      </div>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {metricCards.map((metric) => (
          <Card key={metric.label}>
            <CardContent>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-slate-500">{metric.label}</p>
                  <p className="mt-2 text-3xl font-semibold text-slate-950">{metric.value}</p>
                </div>
                <Badge tone={metric.tone}>{period === "week" ? "주간" : "월간"}</Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr_360px]">
        <Card>
          <CardHeader>
            <CardTitle>활동별 흐름</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            {[
              { label: "상담기록", count: stats.consultationCount },
              ...stats.activitiesByType.map((item) => ({ label: item.label, count: item.count }))
            ].map((item) => (
              <div key={item.label} className="grid gap-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-700">{item.label}</span>
                  <span className="text-slate-500">{item.count}</span>
                </div>
                <div className="h-3 overflow-hidden rounded bg-slate-100">
                  <div
                    className="h-full rounded bg-sky-500"
                    style={{ width: `${Math.round((item.count / stats.max) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="grid gap-4">
          <Card>
            <CardHeader>
              <CardTitle>체크리스트 달성률</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between gap-3">
                <p className="text-4xl font-semibold text-slate-950">{stats.checklistRate}%</p>
                <BarChart3 className="text-emerald-500" size={34} />
              </div>
              <Progress value={stats.checklistRate} className="mt-4" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>관리 기준</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 text-sm text-slate-700">
              <div className="flex items-center gap-2">
                <CalendarRange size={17} className="text-slate-400" />
                <span>{period === "week" ? "이번 주" : "이번 달"} 기준 집계</span>
              </div>
              <div className="rounded-md bg-slate-50 p-3">
                고객 개인정보는 최소 필드만 저장하고 민감정보는 기록하지 않는 구조입니다.
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
