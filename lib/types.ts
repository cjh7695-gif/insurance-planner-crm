export type CustomerGrade =
  | "A"
  | "B"
  | "C"
  | "기존고객"
  | "소개가능"
  | "휴면"
  | "거절";

export type ConsultationStage =
  | "신규후보"
  | "첫연락완료"
  | "상담예정"
  | "보장분석중"
  | "제안완료"
  | "청약완료"
  | "보류"
  | "거절"
  | "유지관리";

export type CoverageInterest =
  | "암"
  | "뇌"
  | "심장"
  | "실손"
  | "운전자"
  | "종합"
  | "기타";

export type ReferralPotential = "높음" | "보통" | "낮음";

export type ConsultationMethod = "대면" | "전화" | "카톡" | "줌" | "기타";

export type RejectionReason =
  | "보험료부담"
  | "배우자상의"
  | "필요성부족"
  | "기존보험있음"
  | "바쁨"
  | "신뢰부족"
  | "건강고지"
  | "기타";

export type TemplateCategory =
  | "첫 상담 제안"
  | "보장분석 제안"
  | "상담 전 안내"
  | "상담 후 감사"
  | "청약 후 감사"
  | "보류 고객 재연락"
  | "소개 요청"
  | "생일 축하"
  | "보험료 부담 고객 대응"
  | "배우자 상의 고객 대응";

export type ActivityType =
  | "new_contact"
  | "existing_contact"
  | "consultation"
  | "coverage_proposal"
  | "application_completed"
  | "referral_request"
  | "followup_done"
  | "checklist_done";

export interface Customer {
  id: string;
  name: string;
  phone: string;
  birthDate?: string;
  job?: string;
  familyNote?: string;
  grade: CustomerGrade;
  stage: ConsultationStage;
  interests: CoverageInterest[];
  referralPotential: ReferralPotential;
  lastContactDate?: string;
  nextContactDate?: string;
  nextAction?: string;
  memo?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Consultation {
  id: string;
  customerId: string;
  consultationDate: string;
  method: ConsultationMethod;
  summary: string;
  needs?: string;
  keyQuote?: string;
  familyHistoryNote?: string;
  currentInsurance?: string;
  budget?: string;
  rejectionReason?: RejectionReason | "";
  proposalDirection?: string;
  nextAction?: string;
  nextContactDate?: string;
  review?: string;
  createdAt: string;
}

export interface ChecklistItem {
  id: string;
  title: string;
  targetCount?: number;
  unit?: string;
  sortOrder: number;
  isDefault: boolean;
}

export interface ChecklistLog {
  id: string;
  itemId: string;
  date: string;
  completed: boolean;
  count?: number;
  customerId?: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MessageTemplate {
  id: string;
  title: string;
  category: TemplateCategory;
  content: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Activity {
  id: string;
  customerId?: string;
  activityDate: string;
  type: ActivityType;
  title: string;
  note?: string;
  createdAt: string;
}

export type CustomerInput = Omit<Customer, "id" | "createdAt" | "updatedAt">;
export type ConsultationInput = Omit<Consultation, "id" | "createdAt">;
export type TemplateInput = Omit<MessageTemplate, "id" | "createdAt" | "updatedAt">;
