import { getSupabaseClient } from "@/lib/data/supabase-client";
import type {
  Activity,
  ChecklistItem,
  ChecklistLog,
  Consultation,
  ConsultationInput,
  Customer,
  CustomerInput,
  MessageTemplate
} from "@/lib/types";

export interface RemoteSnapshot {
  customers: Customer[];
  consultations: Consultation[];
  checklistItems: ChecklistItem[];
  checklistLogs: ChecklistLog[];
  templates: MessageTemplate[];
  activities: Activity[];
}

type DbRow = Record<string, unknown>;
type CustomerPayload = {
  name?: string;
  phone?: string;
  birth_date?: string | null;
  job?: string | null;
  family_note?: string | null;
  grade?: string;
  stage?: string;
  interests?: string[];
  referral_potential?: string;
  last_contact_date?: string | null;
  next_contact_date?: string | null;
  next_action?: string | null;
  memo?: string | null;
};

type ConsultationPayload = {
  customer_id: string;
  consultation_date: string;
  method: string;
  summary: string;
  needs?: string | null;
  key_quote?: string | null;
  family_history_note?: string | null;
  current_insurance?: string | null;
  budget?: string | null;
  rejection_reason?: string | null;
  proposal_direction?: string | null;
  next_action?: string | null;
  next_contact_date?: string | null;
  review?: string | null;
};

export interface RemoteChecklistLogInput {
  itemId: string;
  date: string;
  completed: boolean;
  count?: number;
  customerId?: string;
  note?: string;
  itemTitle?: string;
}

function nullable(value?: string | null) {
  return value?.trim() ? value.trim() : null;
}

function text(value: unknown) {
  return typeof value === "string" ? value : "";
}

function numberValue(value: unknown) {
  return typeof value === "number" ? value : undefined;
}

function booleanValue(value: unknown) {
  return typeof value === "boolean" ? value : false;
}

function stringArray(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function toCustomerPayload(input: Partial<CustomerInput>): CustomerPayload {
  const payload: CustomerPayload = {};

  if (input.name !== undefined) payload.name = input.name.trim();
  if (input.phone !== undefined) payload.phone = input.phone.trim();
  if (input.birthDate !== undefined) payload.birth_date = nullable(input.birthDate);
  if (input.job !== undefined) payload.job = nullable(input.job);
  if (input.familyNote !== undefined) payload.family_note = nullable(input.familyNote);
  if (input.grade !== undefined) payload.grade = input.grade;
  if (input.stage !== undefined) payload.stage = input.stage;
  if (input.interests !== undefined) payload.interests = input.interests;
  if (input.referralPotential !== undefined) {
    payload.referral_potential = input.referralPotential;
  }
  if (input.lastContactDate !== undefined) {
    payload.last_contact_date = nullable(input.lastContactDate);
  }
  if (input.nextContactDate !== undefined) {
    payload.next_contact_date = nullable(input.nextContactDate);
  }
  if (input.nextAction !== undefined) payload.next_action = nullable(input.nextAction);
  if (input.memo !== undefined) payload.memo = nullable(input.memo);

  return payload;
}

function toConsultationPayload(input: ConsultationInput): ConsultationPayload {
  return {
    customer_id: input.customerId,
    consultation_date: input.consultationDate,
    method: input.method,
    summary: input.summary.trim(),
    needs: nullable(input.needs),
    key_quote: nullable(input.keyQuote),
    family_history_note: nullable(input.familyHistoryNote),
    current_insurance: nullable(input.currentInsurance),
    budget: nullable(input.budget),
    rejection_reason: nullable(input.rejectionReason),
    proposal_direction: nullable(input.proposalDirection),
    next_action: nullable(input.nextAction),
    next_contact_date: nullable(input.nextContactDate),
    review: nullable(input.review)
  };
}

function mapCustomer(row: DbRow): Customer {
  return {
    id: text(row.id),
    name: text(row.name),
    phone: text(row.phone),
    birthDate: text(row.birth_date),
    job: text(row.job),
    familyNote: text(row.family_note),
    grade: text(row.grade) as Customer["grade"],
    stage: text(row.stage) as Customer["stage"],
    interests: stringArray(row.interests) as Customer["interests"],
    referralPotential: text(row.referral_potential) as Customer["referralPotential"],
    lastContactDate: text(row.last_contact_date),
    nextContactDate: text(row.next_contact_date),
    nextAction: text(row.next_action),
    memo: text(row.memo),
    createdAt: text(row.created_at),
    updatedAt: text(row.updated_at)
  };
}

function mapConsultation(row: DbRow): Consultation {
  return {
    id: text(row.id),
    customerId: text(row.customer_id),
    consultationDate: text(row.consultation_date),
    method: text(row.method) as Consultation["method"],
    summary: text(row.summary),
    needs: text(row.needs),
    keyQuote: text(row.key_quote),
    familyHistoryNote: text(row.family_history_note),
    currentInsurance: text(row.current_insurance),
    budget: text(row.budget),
    rejectionReason: text(row.rejection_reason) as Consultation["rejectionReason"],
    proposalDirection: text(row.proposal_direction),
    nextAction: text(row.next_action),
    nextContactDate: text(row.next_contact_date),
    review: text(row.review),
    createdAt: text(row.created_at)
  };
}

function mapChecklistItem(row: DbRow): ChecklistItem {
  return {
    id: text(row.id),
    title: text(row.title),
    targetCount: numberValue(row.target_count),
    unit: text(row.unit),
    sortOrder: numberValue(row.sort_order) ?? 0,
    isDefault: booleanValue(row.is_default)
  };
}

function mapChecklistLog(row: DbRow): ChecklistLog {
  return {
    id: text(row.id),
    itemId: text(row.item_id),
    date: text(row.date),
    completed: booleanValue(row.completed),
    count: numberValue(row.count),
    customerId: text(row.customer_id),
    note: text(row.note),
    createdAt: text(row.created_at),
    updatedAt: text(row.updated_at)
  };
}

function mapTemplate(row: DbRow): MessageTemplate {
  return {
    id: text(row.id),
    title: text(row.title),
    category: text(row.category) as MessageTemplate["category"],
    content: text(row.content),
    isActive: booleanValue(row.is_active),
    createdAt: text(row.created_at),
    updatedAt: text(row.updated_at)
  };
}

function mapActivity(row: DbRow): Activity {
  return {
    id: text(row.id),
    customerId: text(row.customer_id),
    activityDate: text(row.activity_date),
    type: text(row.type) as Activity["type"],
    title: text(row.title),
    note: text(row.note),
    createdAt: text(row.created_at)
  };
}

function throwIfError(error: { message: string } | null) {
  if (error) throw new Error(error.message);
}

export async function fetchRemoteSnapshot(): Promise<RemoteSnapshot> {
  const supabase = getSupabaseClient();
  const [
    customers,
    consultations,
    checklistItems,
    checklistLogs,
    templates,
    activities
  ] = await Promise.all([
    supabase.from("customers").select("*").order("updated_at", { ascending: false }),
    supabase.from("consultations").select("*").order("consultation_date", { ascending: false }),
    supabase.from("checklist_items").select("*").order("sort_order", { ascending: true }),
    supabase.from("checklist_logs").select("*").order("date", { ascending: false }),
    supabase.from("message_templates").select("*").order("updated_at", { ascending: false }),
    supabase.from("activities").select("*").order("activity_date", { ascending: false })
  ]);

  [
    customers.error,
    consultations.error,
    checklistItems.error,
    checklistLogs.error,
    templates.error,
    activities.error
  ].forEach(throwIfError);

  return {
    customers: (customers.data ?? []).map(mapCustomer),
    consultations: (consultations.data ?? []).map(mapConsultation),
    checklistItems: (checklistItems.data ?? []).map(mapChecklistItem),
    checklistLogs: (checklistLogs.data ?? []).map(mapChecklistLog),
    templates: (templates.data ?? []).map(mapTemplate),
    activities: (activities.data ?? []).map(mapActivity)
  };
}

export async function createRemoteCustomer(input: CustomerInput) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("customers")
    .insert(toCustomerPayload(input))
    .select("*")
    .single();

  throwIfError(error);

  const customer = mapCustomer(data as DbRow);

  await supabase.from("activities").insert({
    customer_id: customer.id,
    activity_date: customer.createdAt.slice(0, 10),
    type: "new_contact",
    title: "신규 고객 등록",
    note: customer.nextAction || null
  });

  return customer;
}

export async function updateRemoteCustomer(id: string, patch: Partial<CustomerInput>) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("customers")
    .update(toCustomerPayload(patch))
    .eq("id", id)
    .select("*")
    .single();

  throwIfError(error);
  return mapCustomer(data as DbRow);
}

export async function deleteRemoteCustomer(id: string) {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from("customers").delete().eq("id", id);
  throwIfError(error);
}

export async function createRemoteConsultation(input: ConsultationInput) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("consultations")
    .insert(toConsultationPayload(input))
    .select("*")
    .single();

  throwIfError(error);
  const consultation = mapConsultation(data as DbRow);

  const customerPatch: CustomerPayload = {
    last_contact_date: input.consultationDate
  };

  if (input.nextContactDate) customerPatch.next_contact_date = input.nextContactDate;
  if (input.nextAction) customerPatch.next_action = input.nextAction;

  const { data: customerData, error: customerError } = await supabase
    .from("customers")
    .update(customerPatch)
    .eq("id", input.customerId)
    .select("*")
    .single();

  throwIfError(customerError);

  await supabase.from("activities").insert({
    customer_id: input.customerId,
    activity_date: input.consultationDate,
    type: "consultation",
    title: `${input.method} 상담`,
    note: input.summary
  });

  return {
    consultation,
    updatedCustomer: mapCustomer(customerData as DbRow)
  };
}

export async function deleteRemoteConsultation(id: string) {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from("consultations").delete().eq("id", id);
  throwIfError(error);
}

export async function createRemoteActivity(input: Omit<Activity, "id" | "createdAt">) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("activities")
    .insert({
      customer_id: input.customerId || null,
      activity_date: input.activityDate,
      type: input.type,
      title: input.title,
      note: nullable(input.note)
    })
    .select("*")
    .single();

  throwIfError(error);
  return mapActivity(data as DbRow);
}

export async function upsertRemoteChecklistLog(input: RemoteChecklistLogInput) {
  const supabase = getSupabaseClient();
  const { data: existingRows, error: existingError } = await supabase
    .from("checklist_logs")
    .select("*")
    .eq("item_id", input.itemId)
    .eq("date", input.date)
    .order("updated_at", { ascending: false })
    .limit(1);

  throwIfError(existingError);
  const existing = existingRows?.[0] ?? null;

  const payload = {
    item_id: input.itemId,
    date: input.date,
    completed: input.completed,
    count: input.count ?? 0,
    customer_id: input.customerId || null,
    note: nullable(input.note)
  };

  const result = existing
    ? await supabase
        .from("checklist_logs")
        .update(payload)
        .eq("id", text((existing as DbRow).id))
        .select("*")
        .single()
    : await supabase
        .from("checklist_logs")
        .insert(payload)
        .select("*")
        .single();

  throwIfError(result.error);

  let activity: Activity | undefined;
  const wasCompleted = existing ? Boolean((existing as DbRow).completed) : false;

  if (input.completed && !wasCompleted) {
    const { data, error } = await supabase
      .from("activities")
      .insert({
        customer_id: input.customerId || null,
        activity_date: input.date,
        type: "checklist_done",
        title: input.itemTitle ?? "체크리스트 완료",
        note: nullable(input.note)
      })
      .select("*")
      .single();

    throwIfError(error);
    activity = mapActivity(data as DbRow);
  }

  return {
    log: mapChecklistLog(result.data as DbRow),
    activity
  };
}
