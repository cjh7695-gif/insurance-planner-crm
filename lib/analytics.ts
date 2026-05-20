import { ACTIVITY_LABELS } from "@/lib/constants";
import { percent, today, toDateInputValue } from "@/lib/utils";
import type {
  Activity,
  ActivityType,
  ChecklistItem,
  ChecklistLog,
  Consultation,
  Customer
} from "@/lib/types";

export function getWeekRange() {
  const now = new Date(`${today()}T00:00:00`);
  const day = (now.getDay() + 6) % 7;
  const start = new Date(now);
  start.setDate(now.getDate() - day);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);

  return {
    start: toDateInputValue(start),
    end: toDateInputValue(end)
  };
}

export function getMonthRange() {
  const now = new Date(`${today()}T00:00:00`);
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  return {
    start: toDateInputValue(start),
    end: toDateInputValue(end)
  };
}

export function inRange(value: string | undefined, start: string, end: string) {
  return Boolean(value && value >= start && value <= end);
}

export function countActivities(
  activities: Activity[],
  type: ActivityType,
  start: string,
  end: string
) {
  return activities.filter((activity) => activity.type === type && inRange(activity.activityDate, start, end)).length;
}

export function activitySummary(activities: Activity[], start: string, end: string) {
  const types: ActivityType[] = [
    "new_contact",
    "consultation",
    "coverage_proposal",
    "application_completed",
    "referral_request"
  ];

  return types.map((type) => ({
    type,
    label: ACTIVITY_LABELS[type],
    count: countActivities(activities, type, start, end)
  }));
}

export function checklistProgress(
  items: ChecklistItem[],
  logs: ChecklistLog[],
  date = today()
) {
  const dayLogs = logs.filter((log) => log.date === date);
  const done = items.filter((item) =>
    dayLogs.some((log) => log.itemId === item.id && log.completed)
  ).length;

  return {
    done,
    total: items.length,
    value: percent(done, items.length)
  };
}

export function checklistRangeRate(
  items: ChecklistItem[],
  logs: ChecklistLog[],
  start: string,
  end: string
) {
  const startDate = new Date(`${start}T00:00:00`);
  const todayDate = new Date(`${today()}T00:00:00`);
  const endDate = new Date(`${end}T00:00:00`);
  const cappedEnd = endDate > todayDate ? todayDate : endDate;
  const dayCount = Math.max(
    1,
    Math.floor((cappedEnd.getTime() - startDate.getTime()) / 86_400_000) + 1
  );
  const completedKeys = new Set(
    logs
      .filter((log) => log.completed && inRange(log.date, start, end))
      .map((log) => `${log.date}:${log.itemId}`)
  );
  const completed = completedKeys.size;
  const total = Math.max(1, items.length * dayCount);

  return percent(completed, total);
}

export function countCustomersCreated(customers: Customer[], start: string, end: string) {
  return customers.filter((customer) => inRange(customer.createdAt.slice(0, 10), start, end)).length;
}

export function countConsultations(consultations: Consultation[], start: string, end: string) {
  return consultations.filter((consultation) =>
    inRange(consultation.consultationDate, start, end)
  ).length;
}
