import { getWeekRange } from "@/lib/analytics";
import { today } from "@/lib/utils";
import type { ChecklistItem, ChecklistLog, Customer } from "@/lib/types";

export interface FollowupGroups {
  todayContacts: Customer[];
  overdueContacts: Customer[];
  weekContacts: Customer[];
  applicationCare: Customer[];
}

export type TodayWorkTask =
  | {
      id: string;
      kind: "overdue" | "today-contact";
      customer: Customer;
      title: string;
      action: string;
      date?: string;
    }
  | {
      id: string;
      kind: "checklist";
      checklistItem: ChecklistItem;
      title: string;
      action: string;
    };

function byNextContactDate(a: Customer, b: Customer) {
  const left = a.nextContactDate ?? "9999-12-31";
  const right = b.nextContactDate ?? "9999-12-31";
  return left.localeCompare(right) || a.name.localeCompare(b.name, "ko");
}

export function getFollowupGroups(customers: Customer[], date = today()): FollowupGroups {
  const week = getWeekRange();
  const byDate = [...customers].sort(byNextContactDate);

  return {
    overdueContacts: byDate.filter(
      (customer) => Boolean(customer.nextContactDate) && customer.nextContactDate! < date
    ),
    todayContacts: byDate.filter((customer) => customer.nextContactDate === date),
    weekContacts: byDate.filter(
      (customer) =>
        Boolean(customer.nextContactDate) &&
        customer.nextContactDate! > date &&
        customer.nextContactDate! <= week.end
    ),
    applicationCare: byDate.filter((customer) => customer.stage === "청약완료")
  };
}

export function getPendingChecklistItems(
  checklistItems: ChecklistItem[],
  checklistLogs: ChecklistLog[],
  date = today()
) {
  const dayLogs = checklistLogs.filter((log) => log.date === date);

  return checklistItems
    .slice()
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .filter(
      (item) => !dayLogs.some((log) => log.itemId === item.id && log.completed)
    );
}

export function getTodayWorkQueue(
  customers: Customer[],
  checklistItems: ChecklistItem[],
  checklistLogs: ChecklistLog[],
  date = today()
): TodayWorkTask[] {
  const groups = getFollowupGroups(customers, date);
  const pendingChecklist = getPendingChecklistItems(checklistItems, checklistLogs, date);

  return [
    ...groups.overdueContacts.map((customer) => ({
      id: `overdue-${customer.id}`,
      kind: "overdue" as const,
      customer,
      title: `${customer.name} 연락 지연`,
      action: customer.nextAction || "연락 후 다음 액션을 남기세요.",
      date: customer.nextContactDate
    })),
    ...groups.todayContacts.map((customer) => ({
      id: `today-${customer.id}`,
      kind: "today-contact" as const,
      customer,
      title: `${customer.name} 연락`,
      action: customer.nextAction || "연락 후 다음 액션을 남기세요.",
      date: customer.nextContactDate
    })),
    ...pendingChecklist.map((item) => ({
      id: `checklist-${item.id}`,
      kind: "checklist" as const,
      checklistItem: item,
      title: item.title,
      action: `목표 ${item.targetCount ?? 1}${item.unit ?? "회"}`
    }))
  ];
}
