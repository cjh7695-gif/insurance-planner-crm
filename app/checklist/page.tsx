"use client";

import { useMemo, useState } from "react";
import { Check, Link2 } from "lucide-react";
import { checklistProgress, checklistRangeRate, getWeekRange } from "@/lib/analytics";
import { useAppData } from "@/lib/data/app-data-provider";
import type { ChecklistItem } from "@/lib/types";
import { today } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Select } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";

export default function ChecklistPage() {
  const { customers, checklistItems, checklistLogs, upsertChecklistLog } = useAppData();
  const todayValue = today();
  const [date, setDate] = useState(todayValue);
  const week = getWeekRange();
  const progress = checklistProgress(checklistItems, checklistLogs, date);
  const weeklyRate = checklistRangeRate(checklistItems, checklistLogs, week.start, week.end);

  const logsByItem = useMemo(
    () =>
      new Map(
        checklistLogs
          .filter((log) => log.date === date)
          .map((log) => [log.itemId, log])
      ),
    [checklistLogs, date]
  );

  function updateItem(
    item: ChecklistItem,
    patch: {
      completed?: boolean;
      count?: number;
      customerId?: string;
      note?: string;
    }
  ) {
    const current = logsByItem.get(item.id);
    const count = patch.count ?? current?.count ?? 0;
    const completed =
      patch.completed ??
      current?.completed ??
      Boolean(item.targetCount && count >= item.targetCount);

    void upsertChecklistLog({
      itemId: item.id,
      date,
      completed,
      count,
      customerId: patch.customerId ?? current?.customerId,
      note: patch.note ?? current?.note
    });
  }

  return (
    <div className="grid gap-5">
      <section className="grid gap-4 xl:grid-cols-[1fr_320px]">
        <Card>
          <CardHeader className="grid gap-3 sm:grid-cols-[1fr_260px] sm:items-center">
            <div>
              <CardTitle>오늘 체크리스트</CardTitle>
              <p className="mt-1 text-sm text-slate-500">
                {date === todayValue ? "오늘" : date} · {progress.done}/{progress.total} 완료
              </p>
            </div>
            <div className="flex gap-2">
              <Input type="date" value={date} onChange={(event) => setDate(event.target.value)} />
              <Button
                size="sm"
                variant={date === todayValue ? "secondary" : "outline"}
                onClick={() => setDate(todayValue)}
              >
                오늘
              </Button>
            </div>
          </CardHeader>
          <CardContent className="grid gap-3">
            {checklistItems
              .slice()
              .sort((a, b) => a.sortOrder - b.sortOrder)
              .map((item) => {
                const log = logsByItem.get(item.id);
                const completed = Boolean(log?.completed);

                return (
                  <div
                    key={item.id}
                    className="grid gap-3 rounded-md border border-slate-100 p-3 lg:grid-cols-[1fr_120px_220px_auto] lg:items-center"
                  >
                    <label className="flex cursor-pointer items-center gap-3">
                      <input
                        type="checkbox"
                        checked={completed}
                        onChange={(event) => updateItem(item, { completed: event.target.checked })}
                        className="h-5 w-5 accent-slate-950"
                      />
                      <span>
                        <span className="block font-medium text-slate-950">{item.title}</span>
                        <span className="text-xs text-slate-400">
                          목표 {item.targetCount ?? 1}
                          {item.unit ?? "회"}
                        </span>
                      </span>
                    </label>

                    <Input
                      type="number"
                      min={0}
                      value={log?.count ?? 0}
                      onChange={(event) =>
                        updateItem(item, {
                          count: Number(event.target.value),
                          completed: item.targetCount ? Number(event.target.value) >= item.targetCount : completed
                        })
                      }
                    />

                    <Select
                      value={log?.customerId ?? ""}
                      onChange={(event) => updateItem(item, { customerId: event.target.value || undefined })}
                    >
                      <option value="">고객 연결 없음</option>
                      {customers.map((customer) => (
                        <option key={customer.id} value={customer.id}>
                          {customer.name}
                        </option>
                      ))}
                    </Select>

                    <Badge tone={completed ? "emerald" : "slate"}>
                      {completed ? "완료" : "대기"}
                    </Badge>
                  </div>
                );
              })}
          </CardContent>
        </Card>

        <div className="grid gap-4">
          <Card>
            <CardHeader>
              <CardTitle>일간 진행률</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between">
                <p className="text-4xl font-semibold text-slate-950">{progress.value}%</p>
                <Check className="text-emerald-500" size={34} />
              </div>
              <Progress value={progress.value} className="mt-4" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>주간 달성률</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-semibold text-slate-950">{weeklyRate}%</p>
              <Progress value={weeklyRate} className="mt-4" />
              <p className="mt-3 text-sm text-slate-500">
                {week.start} ~ {week.end}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>고객 연결 기록</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2">
              {checklistLogs
                .filter((log) => log.date === date && log.customerId)
                .map((log) => {
                  const item = checklistItems.find((candidate) => candidate.id === log.itemId);
                  const customer = customers.find((candidate) => candidate.id === log.customerId);
                  return (
                    <div key={log.id} className="flex items-center gap-2 rounded-md bg-slate-50 p-2 text-sm">
                      <Link2 size={15} className="text-slate-400" />
                      <span className="text-slate-700">
                        {item?.title} · {customer?.name}
                      </span>
                    </div>
                  );
                })}
              {checklistLogs.filter((log) => log.date === date && log.customerId).length === 0 && (
                <p className="text-sm text-slate-500">연결된 고객 기록이 없습니다.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
