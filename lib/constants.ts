import type {
  ActivityType,
  ConsultationMethod,
  ConsultationStage,
  CoverageInterest,
  CustomerGrade,
  ReferralPotential,
  RejectionReason,
  TemplateCategory
} from "@/lib/types";

export const CUSTOMER_GRADES: CustomerGrade[] = [
  "A",
  "B",
  "C",
  "기존고객",
  "소개가능",
  "휴면",
  "거절"
];

export const CONSULTATION_STAGES: ConsultationStage[] = [
  "신규후보",
  "첫연락완료",
  "상담예정",
  "보장분석중",
  "제안완료",
  "청약완료",
  "보류",
  "거절",
  "유지관리"
];

export const COVERAGE_INTERESTS: CoverageInterest[] = [
  "암",
  "뇌",
  "심장",
  "실손",
  "운전자",
  "종합",
  "기타"
];

export const REFERRAL_POTENTIALS: ReferralPotential[] = ["높음", "보통", "낮음"];

export const CONSULTATION_METHODS: ConsultationMethod[] = ["대면", "전화", "카톡", "줌", "기타"];

export const REJECTION_REASONS: RejectionReason[] = [
  "보험료부담",
  "배우자상의",
  "필요성부족",
  "기존보험있음",
  "바쁨",
  "신뢰부족",
  "건강고지",
  "기타"
];

export const TEMPLATE_CATEGORIES: TemplateCategory[] = [
  "첫 상담 제안",
  "보장분석 제안",
  "상담 전 안내",
  "상담 후 감사",
  "청약 후 감사",
  "보류 고객 재연락",
  "소개 요청",
  "생일 축하",
  "보험료 부담 고객 대응",
  "배우자 상의 고객 대응"
];

export const ACTIVITY_LABELS: Record<ActivityType, string> = {
  new_contact: "신규 연락",
  existing_contact: "기존 고객 연락",
  consultation: "상담",
  coverage_proposal: "보장분석 제안",
  application_completed: "청약 완료",
  referral_request: "소개 요청",
  followup_done: "팔로업 완료",
  checklist_done: "체크리스트 완료"
};
