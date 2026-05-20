"use client";

import { useEffect, useMemo, useState } from "react";
import { ClipboardPlus, Trash2 } from "lucide-react";
import { CONSULTATION_METHODS, REJECTION_REASONS } from "@/lib/constants";
import { useAppData } from "@/lib/data/app-data-provider";
import type { Consultation, ConsultationInput } from "@/lib/types";
import { formatLongDate, today, truncate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, Input, Select, Textarea } from "@/components/ui/input";

function blankConsultation(customerId = ""): ConsultationInput {
  return {
    customerId,
    consultationDate: today(),
    method: "전화",
    summary: "",
    needs: "",
    keyQuote: "",
    familyHistoryNote: "",
    currentInsurance: "",
    budget: "",
    rejectionReason: "",
    proposalDirection: "",
    nextAction: "",
    nextContactDate: "",
    review: ""
  };
}

export default function ConsultationsPage() {
  const {
    customers,
    consultations,
    addConsultation,
    deleteConsultation,
    dataMode,
    isLoading,
    dataError,
    reloadData
  } = useAppData();
  const [draft, setDraft] = useState<ConsultationInput>(blankConsultation(customers[0]?.id));
  const [filterCustomerId, setFilterCustomerId] = useState("전체");

  useEffect(() => {
    if (!draft.customerId && customers[0]) {
      setDraft((current) => ({ ...current, customerId: customers[0].id }));
    }
  }, [customers, draft.customerId]);

  const customerMap = useMemo(
    () => new Map(customers.map((customer) => [customer.id, customer])),
    [customers]
  );

  const visibleConsultations = useMemo(() => {
    return consultations.filter(
      (consultation) => filterCustomerId === "전체" || consultation.customerId === filterCustomerId
    );
  }, [consultations, filterCustomerId]);

  function updateDraft<K extends keyof ConsultationInput>(key: K, value: ConsultationInput[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  async function submitConsultation(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft.customerId || !draft.summary.trim()) return;

    await addConsultation({
      ...draft,
      summary: draft.summary.trim(),
      needs: draft.needs?.trim(),
      keyQuote: draft.keyQuote?.trim(),
      nextAction: draft.nextAction?.trim(),
      proposalDirection: draft.proposalDirection?.trim(),
      review: draft.review?.trim()
    });
    setDraft(blankConsultation(draft.customerId));
  }

  async function removeConsultation(consultation: Consultation) {
    const customer = customerMap.get(consultation.customerId);
    if (window.confirm(`${customer?.name ?? "고객"} 상담기록을 삭제할까요?`)) {
      await deleteConsultation(consultation.id);
    }
  }

  return (
    <div className="grid gap-5">
      {(dataError || isLoading) && (
        <Card>
          <CardContent className="flex flex-col gap-3 text-sm sm:flex-row sm:items-center sm:justify-between">
            <span className={dataError ? "text-rose-700" : "text-slate-600"}>
              {isLoading
                ? "Supabase 데이터를 불러오는 중입니다."
                : dataError}
            </span>
            {dataMode === "supabase" && (
              <Button size="sm" variant="outline" onClick={() => void reloadData()}>
                다시 불러오기
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>상담기록 추가</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={submitConsultation} className="grid gap-4">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <Field label="고객">
                <Select value={draft.customerId} onChange={(event) => updateDraft("customerId", event.target.value)}>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="상담일">
                <Input type="date" value={draft.consultationDate} onChange={(event) => updateDraft("consultationDate", event.target.value)} />
              </Field>
              <Field label="상담 방식">
                <Select value={draft.method} onChange={(event) => updateDraft("method", event.target.value as ConsultationInput["method"])}>
                  {CONSULTATION_METHODS.map((method) => (
                    <option key={method}>{method}</option>
                  ))}
                </Select>
              </Field>
              <Field label="예산">
                <Input value={draft.budget} onChange={(event) => updateDraft("budget", event.target.value)} placeholder="예: 월 10만원" />
              </Field>
              <Field label="거절 사유">
                <Select value={draft.rejectionReason} onChange={(event) => updateDraft("rejectionReason", event.target.value as ConsultationInput["rejectionReason"])}>
                  <option value="">없음</option>
                  {REJECTION_REASONS.map((reason) => (
                    <option key={reason}>{reason}</option>
                  ))}
                </Select>
              </Field>
              <Field label="다음 연락일">
                <Input type="date" value={draft.nextContactDate} onChange={(event) => updateDraft("nextContactDate", event.target.value)} />
              </Field>
              <Field label="다음 액션" className="xl:col-span-2">
                <Input value={draft.nextAction} onChange={(event) => updateDraft("nextAction", event.target.value)} />
              </Field>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <Field label="상담 내용 요약">
                <Textarea value={draft.summary} onChange={(event) => updateDraft("summary", event.target.value)} required />
              </Field>
              <Field label="고객 니즈">
                <Textarea value={draft.needs} onChange={(event) => updateDraft("needs", event.target.value)} />
              </Field>
              <Field label="고객 핵심 발언">
                <Textarea value={draft.keyQuote} onChange={(event) => updateDraft("keyQuote", event.target.value)} />
              </Field>
              <Field label="가족력 메모">
                <Textarea value={draft.familyHistoryNote} onChange={(event) => updateDraft("familyHistoryNote", event.target.value)} />
              </Field>
              <Field label="현재 보험 상태">
                <Textarea value={draft.currentInsurance} onChange={(event) => updateDraft("currentInsurance", event.target.value)} />
              </Field>
              <Field label="다음 제안 방향">
                <Textarea value={draft.proposalDirection} onChange={(event) => updateDraft("proposalDirection", event.target.value)} />
              </Field>
              <Field label="상담 복기" className="lg:col-span-2">
                <Textarea value={draft.review} onChange={(event) => updateDraft("review", event.target.value)} />
              </Field>
            </div>

            <div>
              <Button type="submit">
                <ClipboardPlus size={16} />
                상담기록 저장
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="grid gap-3 md:grid-cols-[1fr_260px] md:items-center">
          <div>
            <CardTitle>상담기록 목록</CardTitle>
            <p className="mt-1 text-sm text-slate-500">총 {visibleConsultations.length}건</p>
          </div>
          <Select value={filterCustomerId} onChange={(event) => setFilterCustomerId(event.target.value)}>
            <option>전체</option>
            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.name}
              </option>
            ))}
          </Select>
        </CardHeader>
        <CardContent className="grid gap-3">
          {visibleConsultations.map((consultation) => {
            const customer = customerMap.get(consultation.customerId);
            return (
              <div key={consultation.id} className="rounded-md border border-slate-100 p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-slate-950">{customer?.name ?? "삭제된 고객"}</p>
                      <Badge tone="sky">{consultation.method}</Badge>
                      {consultation.rejectionReason && <Badge tone="amber">{consultation.rejectionReason}</Badge>}
                    </div>
                    <p className="mt-1 text-sm text-slate-500">{formatLongDate(consultation.consultationDate)}</p>
                  </div>
                  <Button size="icon" variant="ghost" onClick={() => removeConsultation(consultation)} aria-label="상담기록 삭제">
                    <Trash2 size={16} />
                  </Button>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-700">{consultation.summary}</p>
                <div className="mt-3 grid gap-2 text-sm md:grid-cols-3">
                  <div className="rounded-md bg-slate-50 p-3">
                    <p className="text-xs font-medium text-slate-400">고객 니즈</p>
                    <p className="mt-1 text-slate-700">{truncate(consultation.needs, 64) || "-"}</p>
                  </div>
                  <div className="rounded-md bg-slate-50 p-3">
                    <p className="text-xs font-medium text-slate-400">다음 액션</p>
                    <p className="mt-1 text-slate-700">{consultation.nextAction || "-"}</p>
                  </div>
                  <div className="rounded-md bg-slate-50 p-3">
                    <p className="text-xs font-medium text-slate-400">다음 연락일</p>
                    <p className="mt-1 text-slate-700">{formatLongDate(consultation.nextContactDate)}</p>
                  </div>
                </div>
              </div>
            );
          })}

          {visibleConsultations.length === 0 && (
            <div className="rounded-md bg-slate-50 p-4 text-sm text-slate-500">상담기록이 없습니다.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
