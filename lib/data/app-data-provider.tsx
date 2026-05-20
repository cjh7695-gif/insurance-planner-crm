"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";
import { addDays, today } from "@/lib/utils";
import { dataMode, isSupabaseConfigured } from "@/lib/data/supabase-client";
import {
  createRemoteActivity,
  createRemoteConsultation,
  createRemoteCustomer,
  deleteRemoteConsultation,
  deleteRemoteCustomer,
  fetchRemoteSnapshot,
  updateRemoteCustomer,
  upsertRemoteChecklistLog
} from "@/lib/data/supabase-repository";
import {
  mockActivities,
  mockChecklistItems,
  mockChecklistLogs,
  mockConsultations,
  mockCustomers,
  mockTemplates
} from "@/lib/data/mock-data";
import type {
  Activity,
  ActivityType,
  ChecklistItem,
  ChecklistLog,
  Consultation,
  ConsultationInput,
  Customer,
  CustomerInput,
  MessageTemplate,
  TemplateInput
} from "@/lib/types";

interface AppState {
  customers: Customer[];
  consultations: Consultation[];
  checklistItems: ChecklistItem[];
  checklistLogs: ChecklistLog[];
  templates: MessageTemplate[];
  activities: Activity[];
}

interface ChecklistLogInput {
  itemId: string;
  date: string;
  completed: boolean;
  count?: number;
  customerId?: string;
  note?: string;
}

interface AppDataContextValue extends AppState {
  dataMode: "mock" | "supabase";
  isLoading: boolean;
  dataError: string | null;
  reloadData: () => Promise<void>;
  addCustomer: (input: CustomerInput) => Promise<void>;
  updateCustomer: (id: string, patch: Partial<CustomerInput>) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;
  addConsultation: (input: ConsultationInput) => Promise<void>;
  deleteConsultation: (id: string) => Promise<void>;
  upsertChecklistLog: (input: ChecklistLogInput) => Promise<void>;
  addTemplate: (input: TemplateInput) => Promise<void>;
  updateTemplate: (id: string, patch: Partial<TemplateInput>) => Promise<void>;
  deleteTemplate: (id: string) => Promise<void>;
  addActivity: (input: Omit<Activity, "id" | "createdAt">) => Promise<void>;
  completeContact: (customerId: string) => Promise<void>;
  rescheduleCustomer: (
    customerId: string,
    nextContactDate: string,
    nextAction?: string
  ) => Promise<void>;
  resetMockData: () => void;
}

const STORAGE_KEY = "insurance-planner-crm-state";
const STORAGE_VERSION = 2;

const initialState: AppState = {
  customers: mockCustomers,
  consultations: mockConsultations,
  checklistItems: mockChecklistItems,
  checklistLogs: mockChecklistLogs,
  templates: mockTemplates,
  activities: mockActivities
};

const remoteInitialState: AppState = {
  customers: [],
  consultations: [],
  checklistItems: mockChecklistItems,
  checklistLogs: [],
  templates: mockTemplates,
  activities: []
};

const AppDataContext = createContext<AppDataContextValue | null>(null);

function createId(prefix: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function timestamp() {
  return new Date().toISOString();
}

function activityTypeFromChecklist(title?: string): ActivityType {
  if (!title) return "checklist_done";
  if (title.includes("신규 연락")) return "new_contact";
  if (title.includes("기존 고객")) return "existing_contact";
  if (title.includes("보장분석")) return "coverage_proposal";
  if (title.includes("상담 1건")) return "consultation";
  if (title.includes("소개 요청")) return "referral_request";
  return "checklist_done";
}

function saveState(state: AppState) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      version: STORAGE_VERSION,
      state
    })
  );
}

function loadState() {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as { version?: number; state?: AppState };
    if (parsed.version !== STORAGE_VERSION || !parsed.state) {
      return null;
    }

    return parsed.state;
  } catch {
    return null;
  }
}

function isRemoteMode() {
  return dataMode === "supabase";
}

export function AppDataProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(
    isRemoteMode() ? remoteInitialState : initialState
  );
  const [hydrated, setHydrated] = useState(false);
  const [isLoading, setIsLoading] = useState(isRemoteMode());
  const [dataError, setDataError] = useState<string | null>(null);

  const reloadData = useCallback(async () => {
    if (!isRemoteMode()) return;
    if (!isSupabaseConfigured) {
      setDataError("Supabase 환경변수가 설정되지 않았습니다.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setDataError(null);
    try {
      const snapshot = await fetchRemoteSnapshot();
      setState(snapshot);
    } catch (error) {
      setDataError(error instanceof Error ? error.message : "Supabase 데이터를 불러오지 못했습니다.");
    } finally {
      setIsLoading(false);
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (isRemoteMode()) {
      void reloadData();
      return;
    }

    const stored = loadState();
    if (stored) {
      setState(stored);
    }
    setHydrated(true);
    setIsLoading(false);
  }, [reloadData]);

  useEffect(() => {
    if (!hydrated || isRemoteMode()) return;
    saveState(state);
  }, [hydrated, state]);

  const addActivity = useCallback(async (input: Omit<Activity, "id" | "createdAt">) => {
    setDataError(null);

    if (isRemoteMode()) {
      try {
        const activity = await createRemoteActivity(input);
        setState((current) => ({
          ...current,
          activities: [activity, ...current.activities]
        }));
      } catch (error) {
        setDataError(error instanceof Error ? error.message : "활동 기록을 저장하지 못했습니다.");
      }
      return;
    }

    setState((current) => ({
      ...current,
      activities: [
        {
          id: createId("act"),
          createdAt: timestamp(),
          ...input
        },
        ...current.activities
      ]
    }));
  }, []);

  const addCustomer = useCallback(async (input: CustomerInput) => {
    setDataError(null);

    if (isRemoteMode()) {
      try {
        const customer = await createRemoteCustomer(input);
        setState((current) => ({
          ...current,
          customers: [customer, ...current.customers],
          activities: [
            {
              id: createId("act"),
              customerId: customer.id,
              activityDate: customer.createdAt.slice(0, 10),
              type: "new_contact",
              title: "신규 고객 등록",
              note: customer.nextAction,
              createdAt: customer.createdAt
            },
            ...current.activities
          ]
        }));
      } catch (error) {
        setDataError(error instanceof Error ? error.message : "고객을 저장하지 못했습니다.");
      }
      return;
    }

    const createdAt = timestamp();
    const customer: Customer = {
      id: createId("cust"),
      createdAt,
      updatedAt: createdAt,
      ...input
    };

    setState((current) => ({
      ...current,
      customers: [customer, ...current.customers],
      activities: [
        {
          id: createId("act"),
          customerId: customer.id,
          activityDate: customer.createdAt.slice(0, 10),
          type: "new_contact",
          title: "신규 고객 등록",
          note: customer.nextAction,
          createdAt
        },
        ...current.activities
      ]
    }));
  }, []);

  const updateCustomer = useCallback(async (id: string, patch: Partial<CustomerInput>) => {
    setDataError(null);

    if (isRemoteMode()) {
      try {
        const customer = await updateRemoteCustomer(id, patch);
        setState((current) => ({
          ...current,
          customers: current.customers.map((candidate) =>
            candidate.id === id ? customer : candidate
          )
        }));
      } catch (error) {
        setDataError(error instanceof Error ? error.message : "고객 정보를 수정하지 못했습니다.");
      }
      return;
    }

    setState((current) => ({
      ...current,
      customers: current.customers.map((customer) =>
        customer.id === id
          ? {
              ...customer,
              ...patch,
              updatedAt: timestamp()
            }
          : customer
      )
    }));
  }, []);

  const deleteCustomer = useCallback(async (id: string) => {
    setDataError(null);

    if (isRemoteMode()) {
      try {
        await deleteRemoteCustomer(id);
      } catch (error) {
        setDataError(error instanceof Error ? error.message : "고객을 삭제하지 못했습니다.");
        return;
      }
    }

    setState((current) => ({
      ...current,
      customers: current.customers.filter((customer) => customer.id !== id),
      consultations: current.consultations.filter((consultation) => consultation.customerId !== id),
      activities: current.activities.filter((activity) => activity.customerId !== id),
      checklistLogs: current.checklistLogs.filter((log) => log.customerId !== id)
    }));
  }, []);

  const addConsultation = useCallback(async (input: ConsultationInput) => {
    setDataError(null);

    if (isRemoteMode()) {
      try {
        const { consultation, updatedCustomer } = await createRemoteConsultation(input);
        setState((current) => ({
          ...current,
          consultations: [consultation, ...current.consultations],
          customers: current.customers.map((customer) =>
            customer.id === updatedCustomer.id ? updatedCustomer : customer
          ),
          activities: [
            {
              id: createId("act"),
              customerId: input.customerId,
              activityDate: input.consultationDate,
              type: "consultation",
              title: `${input.method} 상담`,
              note: input.summary,
              createdAt: consultation.createdAt
            },
            ...current.activities
          ]
        }));
      } catch (error) {
        setDataError(error instanceof Error ? error.message : "상담기록을 저장하지 못했습니다.");
      }
      return;
    }

    const createdAt = timestamp();
    const consultation: Consultation = {
      id: createId("consult"),
      createdAt,
      ...input
    };

    setState((current) => ({
      ...current,
      consultations: [consultation, ...current.consultations],
      customers: current.customers.map((customer) =>
        customer.id === input.customerId
          ? {
              ...customer,
              lastContactDate: input.consultationDate,
              nextContactDate: input.nextContactDate || customer.nextContactDate,
              nextAction: input.nextAction || customer.nextAction,
              stage:
                customer.stage === "신규후보" || customer.stage === "첫연락완료"
                  ? "상담예정"
                  : customer.stage,
              updatedAt: createdAt
            }
          : customer
      ),
      activities: [
        {
          id: createId("act"),
          customerId: input.customerId,
          activityDate: input.consultationDate,
          type: "consultation",
          title: `${input.method} 상담`,
          note: input.summary,
          createdAt
        },
        ...current.activities
      ]
    }));
  }, []);

  const deleteConsultation = useCallback(async (id: string) => {
    setDataError(null);

    if (isRemoteMode()) {
      try {
        await deleteRemoteConsultation(id);
      } catch (error) {
        setDataError(error instanceof Error ? error.message : "상담기록을 삭제하지 못했습니다.");
        return;
      }
    }

    setState((current) => ({
      ...current,
      consultations: current.consultations.filter((consultation) => consultation.id !== id)
    }));
  }, []);

  const upsertChecklistLog = useCallback(async (input: ChecklistLogInput) => {
    const now = timestamp();
    const item = state.checklistItems.find((candidate) => candidate.id === input.itemId);

    if (isRemoteMode()) {
      try {
        const { log, activity } = await upsertRemoteChecklistLog({
          ...input,
          itemTitle: item?.title
        });

        setState((current) => {
          const exists = current.checklistLogs.some((candidate) => candidate.id === log.id);
          return {
            ...current,
            checklistLogs: exists
              ? current.checklistLogs.map((candidate) =>
                  candidate.id === log.id ? log : candidate
                )
              : [log, ...current.checklistLogs],
            activities: activity ? [activity, ...current.activities] : current.activities
          };
        });
      } catch (error) {
        setDataError(error instanceof Error ? error.message : "체크리스트를 저장하지 못했습니다.");
      }
      return;
    }

    setState((current) => {
      const exists = current.checklistLogs.find(
        (log) => log.itemId === input.itemId && log.date === input.date
      );
      const nextLogs = exists
        ? current.checklistLogs.map((log) =>
            log.id === exists.id
              ? {
                  ...log,
                  ...input,
                  updatedAt: now
                }
              : log
          )
        : [
            {
              id: createId("log"),
              createdAt: now,
              updatedAt: now,
              ...input
            },
            ...current.checklistLogs
          ];

      const nextActivities =
        input.completed && !exists?.completed
          ? [
              {
                id: createId("act"),
                customerId: input.customerId,
                activityDate: input.date,
                type: activityTypeFromChecklist(item?.title),
                title: item?.title ?? "체크리스트 완료",
                note: input.note,
                createdAt: now
              },
              ...current.activities
            ]
          : current.activities;

      return {
        ...current,
        checklistLogs: nextLogs,
        activities: nextActivities
      };
    });
  }, [state.checklistItems]);

  const addTemplate = useCallback(async (input: TemplateInput) => {
    const createdAt = timestamp();
    setState((current) => ({
      ...current,
      templates: [
        {
          id: createId("tpl"),
          createdAt,
          updatedAt: createdAt,
          ...input
        },
        ...current.templates
      ]
    }));
  }, []);

  const updateTemplate = useCallback(async (id: string, patch: Partial<TemplateInput>) => {
    setState((current) => ({
      ...current,
      templates: current.templates.map((template) =>
        template.id === id
          ? {
              ...template,
              ...patch,
              updatedAt: timestamp()
            }
          : template
      )
    }));
  }, []);

  const deleteTemplate = useCallback(async (id: string) => {
    setState((current) => ({
      ...current,
      templates: current.templates.filter((template) => template.id !== id)
    }));
  }, []);

  const completeContact = useCallback(async (customerId: string) => {
    const date = today();
    const nextDate = addDays(7);
    const now = timestamp();

    if (isRemoteMode()) {
      try {
        const customer = await updateRemoteCustomer(customerId, {
          lastContactDate: date,
          nextContactDate: nextDate,
          nextAction: "다음 주 안부 연락"
        });
        const activity = await createRemoteActivity({
          customerId,
          activityDate: date,
          type: "followup_done",
          title: "연락 완료",
          note: "빠른 액션으로 처리"
        });
        setState((current) => ({
          ...current,
          customers: current.customers.map((candidate) =>
            candidate.id === customerId ? customer : candidate
          ),
          activities: [activity, ...current.activities]
        }));
      } catch (error) {
        setDataError(error instanceof Error ? error.message : "연락 완료 처리에 실패했습니다.");
      }
      return;
    }

    setState((current) => ({
      ...current,
      customers: current.customers.map((customer) =>
        customer.id === customerId
          ? {
              ...customer,
              lastContactDate: date,
              nextContactDate: nextDate,
              nextAction: "다음 주 안부 연락",
              updatedAt: now
            }
          : customer
      ),
      activities: [
        {
          id: createId("act"),
          customerId,
          activityDate: date,
          type: "followup_done",
          title: "연락 완료",
          note: "빠른 액션으로 처리",
          createdAt: now
        },
        ...current.activities
      ]
    }));
  }, []);

  const rescheduleCustomer = useCallback(
    async (customerId: string, nextContactDate: string, nextAction?: string) => {
      if (isRemoteMode()) {
        try {
          const customer = await updateRemoteCustomer(customerId, {
            nextContactDate,
            nextAction
          });
          setState((current) => ({
            ...current,
            customers: current.customers.map((candidate) =>
              candidate.id === customerId ? customer : candidate
            )
          }));
        } catch (error) {
          setDataError(error instanceof Error ? error.message : "다음 연락일 변경에 실패했습니다.");
        }
        return;
      }

      setState((current) => ({
        ...current,
        customers: current.customers.map((customer) =>
          customer.id === customerId
            ? {
                ...customer,
                nextContactDate,
                nextAction: nextAction || customer.nextAction,
                updatedAt: timestamp()
              }
            : customer
        )
      }));
    },
    []
  );

  const resetMockData = useCallback(() => {
    if (isRemoteMode()) return;
    window.localStorage.removeItem(STORAGE_KEY);
    setState(initialState);
  }, []);

  const value = useMemo<AppDataContextValue>(
    () => ({
      ...state,
      dataMode,
      isLoading,
      dataError,
      reloadData,
      addCustomer,
      updateCustomer,
      deleteCustomer,
      addConsultation,
      deleteConsultation,
      upsertChecklistLog,
      addTemplate,
      updateTemplate,
      deleteTemplate,
      addActivity,
      completeContact,
      rescheduleCustomer,
      resetMockData
    }),
    [
      state,
      isLoading,
      dataError,
      reloadData,
      addCustomer,
      updateCustomer,
      deleteCustomer,
      addConsultation,
      deleteConsultation,
      upsertChecklistLog,
      addTemplate,
      updateTemplate,
      deleteTemplate,
      addActivity,
      completeContact,
      rescheduleCustomer,
      resetMockData
    ]
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  const context = useContext(AppDataContext);
  if (!context) {
    throw new Error("useAppData must be used inside AppDataProvider");
  }

  return context;
}
