"use client";

import { useMemo, useState } from "react";
import { Edit3, Plus, Search, Trash2, X } from "lucide-react";
import {
  CONSULTATION_STAGES,
  COVERAGE_INTERESTS,
  CUSTOMER_GRADES,
  REFERRAL_POTENTIALS
} from "@/lib/constants";
import { useAppData } from "@/lib/data/app-data-provider";
import type { CoverageInterest, Customer, CustomerInput } from "@/lib/types";
import { formatDate, isBeforeToday, isToday, isWithinDays, truncate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, Input, Select, Textarea } from "@/components/ui/input";

function blankCustomer(): CustomerInput {
  return {
    name: "",
    phone: "",
    birthDate: "",
    job: "",
    familyNote: "",
    grade: "B",
    stage: "신규후보",
    interests: ["암"],
    referralPotential: "보통",
    lastContactDate: "",
    nextContactDate: "",
    nextAction: "",
    memo: ""
  };
}

function customerToInput(customer: Customer): CustomerInput {
  return {
    name: customer.name,
    phone: customer.phone,
    birthDate: customer.birthDate ?? "",
    job: customer.job ?? "",
    familyNote: customer.familyNote ?? "",
    grade: customer.grade,
    stage: customer.stage,
    interests: customer.interests,
    referralPotential: customer.referralPotential,
    lastContactDate: customer.lastContactDate ?? "",
    nextContactDate: customer.nextContactDate ?? "",
    nextAction: customer.nextAction ?? "",
    memo: customer.memo ?? ""
  };
}

export default function CustomersPage() {
  const {
    customers,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    dataMode,
    isLoading,
    dataError,
    reloadData
  } = useAppData();
  const [draft, setDraft] = useState<CustomerInput>(blankCustomer());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [query, setQuery] = useState("");
  const [gradeFilter, setGradeFilter] = useState("전체");
  const [stageFilter, setStageFilter] = useState("전체");
  const [dateFilter, setDateFilter] = useState("전체");
  const [referralFilter, setReferralFilter] = useState("전체");

  const filtered = useMemo(() => {
    return customers.filter((customer) => {
      const searchText = [
        customer.name,
        customer.phone,
        customer.grade,
        customer.stage,
        customer.nextAction,
        customer.memo
      ]
        .join(" ")
        .toLowerCase();
      const matchesQuery = searchText.includes(query.toLowerCase());
      const matchesGrade = gradeFilter === "전체" || customer.grade === gradeFilter;
      const matchesStage = stageFilter === "전체" || customer.stage === stageFilter;
      const matchesReferral =
        referralFilter === "전체" || customer.referralPotential === referralFilter;
      const matchesDate =
        dateFilter === "전체" ||
        (dateFilter === "오늘" && isToday(customer.nextContactDate)) ||
        (dateFilter === "지남" && isBeforeToday(customer.nextContactDate)) ||
        (dateFilter === "7일" && isWithinDays(customer.nextContactDate, 7)) ||
        (dateFilter === "없음" && !customer.nextContactDate);

      return matchesQuery && matchesGrade && matchesStage && matchesReferral && matchesDate;
    });
  }, [customers, dateFilter, gradeFilter, query, referralFilter, stageFilter]);

  function updateDraft<K extends keyof CustomerInput>(key: K, value: CustomerInput[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function toggleInterest(interest: CoverageInterest) {
    setDraft((current) => {
      const exists = current.interests.includes(interest);
      const interests = exists
        ? current.interests.filter((item) => item !== interest)
        : [...current.interests, interest];
      return { ...current, interests: interests.length ? interests : ["기타"] };
    });
  }

  async function submitCustomer(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleaned: CustomerInput = {
      ...draft,
      name: draft.name.trim(),
      phone: draft.phone.trim(),
      nextAction: draft.nextAction?.trim(),
      memo: draft.memo?.trim()
    };

    if (!cleaned.name || !cleaned.phone) return;

    if (editingId) {
      await updateCustomer(editingId, cleaned);
    } else {
      await addCustomer(cleaned);
    }

    setDraft(blankCustomer());
    setEditingId(null);
    setShowForm(false);
  }

  function startEdit(customer: Customer) {
    setDraft(customerToInput(customer));
    setEditingId(customer.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function removeCustomer(customer: Customer) {
    if (window.confirm(`${customer.name} 고객 정보를 삭제할까요?`)) {
      await deleteCustomer(customer.id);
    }
  }

  return (
    <div className="grid gap-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-slate-500">총 {customers.length}명</p>
          <h2 className="text-xl font-semibold text-slate-950">고객 목록</h2>
        </div>
        <Button
          onClick={() => {
            setDraft(blankCustomer());
            setEditingId(null);
            setShowForm((value) => !value);
          }}
        >
          {showForm ? <X size={16} /> : <Plus size={16} />}
          {showForm ? "닫기" : "고객 등록"}
        </Button>
      </div>

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

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? "고객 수정" : "고객 등록"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={submitCustomer} className="grid gap-4">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <Field label="이름">
                  <Input value={draft.name} onChange={(event) => updateDraft("name", event.target.value)} required />
                </Field>
                <Field label="연락처">
                  <Input value={draft.phone} onChange={(event) => updateDraft("phone", event.target.value)} required />
                </Field>
                <Field label="생년월일">
                  <Input type="date" value={draft.birthDate} onChange={(event) => updateDraft("birthDate", event.target.value)} />
                </Field>
                <Field label="직업">
                  <Input value={draft.job} onChange={(event) => updateDraft("job", event.target.value)} />
                </Field>
                <Field label="고객 등급">
                  <Select value={draft.grade} onChange={(event) => updateDraft("grade", event.target.value as CustomerInput["grade"])}>
                    {CUSTOMER_GRADES.map((grade) => (
                      <option key={grade}>{grade}</option>
                    ))}
                  </Select>
                </Field>
                <Field label="상담 단계">
                  <Select value={draft.stage} onChange={(event) => updateDraft("stage", event.target.value as CustomerInput["stage"])}>
                    {CONSULTATION_STAGES.map((stage) => (
                      <option key={stage}>{stage}</option>
                    ))}
                  </Select>
                </Field>
                <Field label="소개 가능성">
                  <Select value={draft.referralPotential} onChange={(event) => updateDraft("referralPotential", event.target.value as CustomerInput["referralPotential"])}>
                    {REFERRAL_POTENTIALS.map((potential) => (
                      <option key={potential}>{potential}</option>
                    ))}
                  </Select>
                </Field>
                <Field label="마지막 연락일">
                  <Input type="date" value={draft.lastContactDate} onChange={(event) => updateDraft("lastContactDate", event.target.value)} />
                </Field>
                <Field label="다음 연락일">
                  <Input type="date" value={draft.nextContactDate} onChange={(event) => updateDraft("nextContactDate", event.target.value)} />
                </Field>
                <Field label="다음 액션" className="xl:col-span-2">
                  <Input value={draft.nextAction} onChange={(event) => updateDraft("nextAction", event.target.value)} />
                </Field>
              </div>

              <div className="grid gap-3">
                <p className="text-sm font-medium text-slate-700">관심 보장</p>
                <div className="flex flex-wrap gap-2">
                  {COVERAGE_INTERESTS.map((interest) => (
                    <label
                      key={interest}
                      className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
                    >
                      <input
                        type="checkbox"
                        checked={draft.interests.includes(interest)}
                        onChange={() => toggleInterest(interest)}
                        className="h-4 w-4 accent-slate-950"
                      />
                      {interest}
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Field label="가족관계 메모">
                  <Textarea value={draft.familyNote} onChange={(event) => updateDraft("familyNote", event.target.value)} />
                </Field>
                <Field label="메모">
                  <Textarea value={draft.memo} onChange={(event) => updateDraft("memo", event.target.value)} />
                </Field>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button type="submit">{editingId ? "수정 저장" : "등록 저장"}</Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setDraft(blankCustomer());
                    setEditingId(null);
                    setShowForm(false);
                  }}
                >
                  취소
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="grid gap-3">
          <div className="grid gap-3 lg:grid-cols-[1.2fr_repeat(4,0.7fr)]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="이름, 연락처, 메모 검색"
                className="pl-9"
              />
            </div>
            <Select value={gradeFilter} onChange={(event) => setGradeFilter(event.target.value)}>
              <option>전체</option>
              {CUSTOMER_GRADES.map((grade) => (
                <option key={grade}>{grade}</option>
              ))}
            </Select>
            <Select value={stageFilter} onChange={(event) => setStageFilter(event.target.value)}>
              <option>전체</option>
              {CONSULTATION_STAGES.map((stage) => (
                <option key={stage}>{stage}</option>
              ))}
            </Select>
            <Select value={dateFilter} onChange={(event) => setDateFilter(event.target.value)}>
              <option>전체</option>
              <option>오늘</option>
              <option>지남</option>
              <option>7일</option>
              <option>없음</option>
            </Select>
            <Select value={referralFilter} onChange={(event) => setReferralFilter(event.target.value)}>
              <option>전체</option>
              {REFERRAL_POTENTIALS.map((potential) => (
                <option key={potential}>{potential}</option>
              ))}
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-3">
        {filtered.map((customer) => (
          <Card key={customer.id}>
            <CardContent className="grid gap-4 lg:grid-cols-[1.1fr_0.8fr_0.8fr_1fr_auto] lg:items-center">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-base font-semibold text-slate-950">{customer.name}</p>
                  <Badge tone={customer.grade === "A" ? "emerald" : customer.grade === "거절" ? "rose" : "slate"}>
                    {customer.grade}
                  </Badge>
                  <Badge tone="sky">{customer.stage}</Badge>
                </div>
                <p className="mt-1 text-sm text-slate-500">{customer.phone}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-400">다음 연락일</p>
                <p className="mt-1 text-sm font-medium text-slate-800">{formatDate(customer.nextContactDate)}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-400">소개 가능성</p>
                <p className="mt-1 text-sm text-slate-700">{customer.referralPotential}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-400">다음 액션</p>
                <p className="mt-1 text-sm text-slate-700">{truncate(customer.nextAction, 54) || "-"}</p>
                <p className="mt-1 text-xs text-slate-400">{truncate(customer.memo, 58)}</p>
              </div>
              <div className="flex gap-2 lg:justify-end">
                <Button size="icon" variant="outline" onClick={() => startEdit(customer)} aria-label="고객 수정">
                  <Edit3 size={16} />
                </Button>
                <Button size="icon" variant="ghost" onClick={() => removeCustomer(customer)} aria-label="고객 삭제">
                  <Trash2 size={16} />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {filtered.length === 0 && (
          <Card>
            <CardContent className="text-sm text-slate-500">조건에 맞는 고객이 없습니다.</CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
