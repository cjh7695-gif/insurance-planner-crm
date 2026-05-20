"use client";

import { useEffect, useMemo, useState } from "react";
import { Clipboard, Edit3, Plus, Trash2, X } from "lucide-react";
import { TEMPLATE_CATEGORIES } from "@/lib/constants";
import { useAppData } from "@/lib/data/app-data-provider";
import type { MessageTemplate, TemplateInput } from "@/lib/types";
import { formatDate, formatLongDate, today } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, Input, Select, Textarea } from "@/components/ui/input";

function blankTemplate(): TemplateInput {
  return {
    title: "",
    category: "첫 상담 제안",
    content: "",
    isActive: true
  };
}

function templateToInput(template: MessageTemplate): TemplateInput {
  return {
    title: template.title,
    category: template.category,
    content: template.content,
    isActive: template.isActive
  };
}

export default function TemplatesPage() {
  const { customers, templates, addTemplate, updateTemplate, deleteTemplate } = useAppData();
  const [draft, setDraft] = useState<TemplateInput>(blankTemplate());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [category, setCategory] = useState("전체");
  const [selectedCustomerId, setSelectedCustomerId] = useState(customers[0]?.id ?? "");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filtered = useMemo(
    () => templates.filter((template) => category === "전체" || template.category === category),
    [category, templates]
  );
  const selectedCustomer = customers.find((customer) => customer.id === selectedCustomerId);

  useEffect(() => {
    if (!selectedCustomerId && customers[0]) {
      setSelectedCustomerId(customers[0].id);
    }
  }, [customers, selectedCustomerId]);

  function updateDraft<K extends keyof TemplateInput>(key: K, value: TemplateInput[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function renderContent(content: string) {
    const variables: Record<string, string> = {
      고객명: selectedCustomer?.name ?? "[고객명]",
      연락처: selectedCustomer?.phone ?? "[연락처]",
      직업: selectedCustomer?.job || "[직업]",
      고객등급: selectedCustomer?.grade ?? "[고객등급]",
      상담단계: selectedCustomer?.stage ?? "[상담단계]",
      관심보장: selectedCustomer?.interests.join(", ") || "[관심보장]",
      소개가능성: selectedCustomer?.referralPotential ?? "[소개가능성]",
      마지막연락일: selectedCustomer?.lastContactDate
        ? formatLongDate(selectedCustomer.lastContactDate)
        : "[마지막연락일]",
      다음연락일: selectedCustomer?.nextContactDate
        ? formatLongDate(selectedCustomer.nextContactDate)
        : "[다음연락일]",
      다음액션: selectedCustomer?.nextAction || "[다음액션]",
      메모: selectedCustomer?.memo || "[메모]",
      오늘: formatLongDate(today())
    };

    return content.replace(/\[([^\]]+)\]/g, (match, key: string) => variables[key] ?? match);
  }

  async function copyTemplate(template: MessageTemplate) {
    const content = renderContent(template.content);
    try {
      await navigator.clipboard.writeText(content);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = content;
      textarea.setAttribute("readonly", "true");
      textarea.style.position = "fixed";
      textarea.style.left = "-9999px";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }
    setCopiedId(template.id);
    window.setTimeout(() => setCopiedId(null), 1400);
  }

  function submitTemplate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft.title.trim() || !draft.content.trim()) return;

    const cleaned = {
      ...draft,
      title: draft.title.trim(),
      content: draft.content.trim()
    };

    if (editingId) {
      updateTemplate(editingId, cleaned);
    } else {
      addTemplate(cleaned);
    }

    setDraft(blankTemplate());
    setEditingId(null);
    setShowForm(false);
  }

  function startEdit(template: MessageTemplate) {
    setDraft(templateToInput(template));
    setEditingId(template.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function removeTemplate(template: MessageTemplate) {
    if (window.confirm(`${template.title} 템플릿을 삭제할까요?`)) {
      deleteTemplate(template.id);
    }
  }

  return (
    <div className="grid gap-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-slate-500">총 {templates.length}개</p>
          <h2 className="text-xl font-semibold text-slate-950">메시지 템플릿</h2>
        </div>
        <Button
          onClick={() => {
            setDraft(blankTemplate());
            setEditingId(null);
            setShowForm((value) => !value);
          }}
        >
          {showForm ? <X size={16} /> : <Plus size={16} />}
          {showForm ? "닫기" : "템플릿 추가"}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? "템플릿 수정" : "템플릿 추가"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={submitTemplate} className="grid gap-4">
              <div className="grid gap-4 md:grid-cols-[1fr_260px_160px]">
                <Field label="제목">
                  <Input value={draft.title} onChange={(event) => updateDraft("title", event.target.value)} required />
                </Field>
                <Field label="카테고리">
                  <Select value={draft.category} onChange={(event) => updateDraft("category", event.target.value as TemplateInput["category"])}>
                    {TEMPLATE_CATEGORIES.map((item) => (
                      <option key={item}>{item}</option>
                    ))}
                  </Select>
                </Field>
                <label className="flex items-end gap-2 pb-2 text-sm font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={draft.isActive}
                    onChange={(event) => updateDraft("isActive", event.target.checked)}
                    className="h-4 w-4 accent-slate-950"
                  />
                  사용
                </label>
              </div>
              <Field label="내용">
                <Textarea value={draft.content} onChange={(event) => updateDraft("content", event.target.value)} required />
              </Field>
              <div className="flex flex-wrap gap-2">
                <Button type="submit">{editingId ? "수정 저장" : "추가 저장"}</Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setDraft(blankTemplate());
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
        <CardContent className="grid gap-3 md:grid-cols-[1fr_260px]">
          <Select value={category} onChange={(event) => setCategory(event.target.value)}>
            <option>전체</option>
            {TEMPLATE_CATEGORIES.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </Select>
          <Select value={selectedCustomerId} onChange={(event) => setSelectedCustomerId(event.target.value)}>
            <option value="">변수 미리보기 고객</option>
            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.name}
              </option>
            ))}
          </Select>
        </CardContent>
      </Card>

      <div className="grid gap-3 xl:grid-cols-2">
        {filtered.map((template) => (
          <Card key={template.id}>
            <CardContent className="grid gap-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-slate-950">{template.title}</p>
                    <Badge tone="sky">{template.category}</Badge>
                    <Badge tone={template.isActive ? "emerald" : "slate"}>
                      {template.isActive ? "사용" : "미사용"}
                    </Badge>
                  </div>
                  <p className="mt-1 text-xs text-slate-400">수정 {formatDate(template.updatedAt.slice(0, 10))}</p>
                </div>
                <div className="flex gap-2">
                  <Button size="icon" variant="outline" onClick={() => startEdit(template)} aria-label="템플릿 수정">
                    <Edit3 size={16} />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => removeTemplate(template)} aria-label="템플릿 삭제">
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>

              <div className="whitespace-pre-line rounded-md bg-slate-50 p-3 text-sm leading-6 text-slate-700">
                {renderContent(template.content)}
              </div>

              <Button variant="secondary" onClick={() => copyTemplate(template)}>
                <Clipboard size={16} />
                {copiedId === template.id ? "복사됨" : "복사"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
