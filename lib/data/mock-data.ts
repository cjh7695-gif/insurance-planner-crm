import { addDays, today } from "@/lib/utils";
import type {
  Activity,
  ChecklistItem,
  ChecklistLog,
  Consultation,
  Customer,
  MessageTemplate
} from "@/lib/types";

const now = () => new Date().toISOString();

export const mockCustomers: Customer[] = [
  {
    id: "cust-1",
    name: "김민지",
    phone: "010-1234-5678",
    birthDate: "1987-04-12",
    job: "마케팅 매니저",
    familyNote: "배우자, 자녀 1명",
    grade: "A",
    stage: "보장분석중",
    interests: ["암", "실손", "종합"],
    referralPotential: "높음",
    lastContactDate: addDays(-2),
    nextContactDate: today(),
    nextAction: "보장분석 자료 정리 후 카톡 발송",
    memo: "실손 갱신 보험료 상승에 민감함. 가족 전체 보장 균형에 관심.",
    createdAt: now(),
    updatedAt: now()
  },
  {
    id: "cust-2",
    name: "박준호",
    phone: "010-2345-6789",
    birthDate: "1982-09-03",
    job: "자영업",
    familyNote: "부모님 병력 걱정",
    grade: "소개가능",
    stage: "상담예정",
    interests: ["뇌", "심장", "운전자"],
    referralPotential: "높음",
    lastContactDate: addDays(-5),
    nextContactDate: today(),
    nextAction: "저녁 7시 전화 상담",
    memo: "친구 사업자 모임 소개 가능성 있음.",
    createdAt: now(),
    updatedAt: now()
  },
  {
    id: "cust-3",
    name: "이서연",
    phone: "010-3456-7890",
    birthDate: "1991-01-19",
    job: "간호사",
    familyNote: "미혼",
    grade: "B",
    stage: "보류",
    interests: ["암", "기타"],
    referralPotential: "보통",
    lastContactDate: addDays(-12),
    nextContactDate: addDays(-1),
    nextAction: "보험료 부담 완화 플랜으로 재연락",
    memo: "필요성은 공감하나 월 납입 여력 확인 필요.",
    createdAt: now(),
    updatedAt: now()
  },
  {
    id: "cust-4",
    name: "최현우",
    phone: "010-4567-8901",
    birthDate: "1978-11-24",
    job: "회사원",
    familyNote: "배우자, 자녀 2명",
    grade: "기존고객",
    stage: "청약완료",
    interests: ["종합", "운전자"],
    referralPotential: "보통",
    lastContactDate: addDays(-7),
    nextContactDate: addDays(2),
    nextAction: "청약 후 감사 메시지와 관리 일정 안내",
    memo: "가족 보장 리모델링 완료. 2주 뒤 증권 전달 확인.",
    createdAt: now(),
    updatedAt: now()
  },
  {
    id: "cust-5",
    name: "정다은",
    phone: "010-5678-9012",
    birthDate: "1994-06-02",
    job: "프리랜서 디자이너",
    familyNote: "반려가족 중심",
    grade: "C",
    stage: "첫연락완료",
    interests: ["실손", "암"],
    referralPotential: "낮음",
    lastContactDate: addDays(-3),
    nextContactDate: addDays(5),
    nextAction: "첫 상담 가능 시간 확인",
    memo: "카톡 선호. 긴 설명보다 핵심 요약 선호.",
    createdAt: now(),
    updatedAt: now()
  }
];

export const mockConsultations: Consultation[] = [
  {
    id: "consult-1",
    customerId: "cust-1",
    consultationDate: addDays(-2),
    method: "전화",
    summary: "기존 실손과 암 진단비 보장 범위를 확인하고 부족한 부분을 정리하기로 함.",
    needs: "갱신 보험료 부담 완화, 가족력 대비",
    keyQuote: "가족까지 생각하면 빠진 보장이 있는지 알고 싶어요.",
    familyHistoryNote: "부친 심혈관 질환 이력 언급",
    currentInsurance: "실손, 암 일부 가입",
    budget: "월 12만원 내외",
    rejectionReason: "",
    proposalDirection: "암/심장 중심 보장분석 자료",
    nextAction: "보장분석 자료 발송",
    nextContactDate: today(),
    review: "숫자보다 공백 보장을 먼저 설명하면 반응이 좋음.",
    createdAt: now()
  },
  {
    id: "consult-2",
    customerId: "cust-3",
    consultationDate: addDays(-12),
    method: "카톡",
    summary: "월 보험료가 부담된다는 의견. 필수 보장만 추린 안을 원함.",
    needs: "낮은 보험료, 핵심 보장",
    keyQuote: "당장 큰 금액은 어렵고 꼭 필요한 것만 보고 싶어요.",
    familyHistoryNote: "",
    currentInsurance: "회사 단체보험만 보유",
    budget: "월 5만원 이하",
    rejectionReason: "보험료부담",
    proposalDirection: "소액 필수 보장안",
    nextAction: "부담 낮춘 플랜 제안",
    nextContactDate: addDays(-1),
    review: "선택지를 많이 주기보다 1안/2안으로 정리 필요.",
    createdAt: now()
  }
];

export const mockChecklistItems: ChecklistItem[] = [
  { id: "check-1", title: "신규 연락 5명", targetCount: 5, unit: "명", sortOrder: 1, isDefault: true },
  { id: "check-2", title: "기존 고객 안부 3명", targetCount: 3, unit: "명", sortOrder: 2, isDefault: true },
  { id: "check-3", title: "보장분석 제안 2명", targetCount: 2, unit: "명", sortOrder: 3, isDefault: true },
  { id: "check-4", title: "상담 1건 이상", targetCount: 1, unit: "건", sortOrder: 4, isDefault: true },
  { id: "check-5", title: "소개 요청 1회", targetCount: 1, unit: "회", sortOrder: 5, isDefault: true },
  { id: "check-6", title: "상담 복기 1건", targetCount: 1, unit: "건", sortOrder: 6, isDefault: true },
  { id: "check-7", title: "보험 공부 30분", targetCount: 30, unit: "분", sortOrder: 7, isDefault: true },
  { id: "check-8", title: "내일 할 일 정리", targetCount: 1, unit: "회", sortOrder: 8, isDefault: true }
];

export const mockChecklistLogs: ChecklistLog[] = [
  {
    id: "log-1",
    itemId: "check-1",
    date: today(),
    completed: true,
    count: 5,
    createdAt: now(),
    updatedAt: now()
  },
  {
    id: "log-2",
    itemId: "check-3",
    date: today(),
    completed: true,
    count: 2,
    customerId: "cust-1",
    createdAt: now(),
    updatedAt: now()
  },
  {
    id: "log-3",
    itemId: "check-4",
    date: today(),
    completed: false,
    count: 0,
    createdAt: now(),
    updatedAt: now()
  }
];

export const mockTemplates: MessageTemplate[] = [
  {
    id: "tpl-1",
    title: "첫 상담 제안",
    category: "첫 상담 제안",
    content:
      "[고객명]님, 안녕하세요. 지난번 말씀 나눈 보장 상황을 간단히 점검해보면 좋을 것 같아 연락드렸습니다. 편하신 시간에 20분 정도 통화 가능하실까요?",
    isActive: true,
    createdAt: now(),
    updatedAt: now()
  },
  {
    id: "tpl-2",
    title: "보장분석 자료 발송",
    category: "보장분석 제안",
    content:
      "[고객명]님, 말씀해주신 [관심보장] 부분 중심으로 현재 보장과 보완 포인트를 정리해봤습니다. 확인하시고 궁금한 점 편하게 남겨주세요.",
    isActive: true,
    createdAt: now(),
    updatedAt: now()
  },
  {
    id: "tpl-3",
    title: "상담 후 감사",
    category: "상담 후 감사",
    content:
      "[고객명]님, 오늘 시간 내주셔서 감사합니다. 말씀해주신 내용 기준으로 무리 없는 방향부터 정리해서 다시 안내드리겠습니다.",
    isActive: true,
    createdAt: now(),
    updatedAt: now()
  },
  {
    id: "tpl-4",
    title: "소개 요청",
    category: "소개 요청",
    content:
      "[고객명]님, 주변에 보험을 정리해보고 싶지만 어디서부터 봐야 할지 모르는 분이 계시면 편하게 소개 부탁드립니다. 부담 없는 점검부터 도와드리겠습니다.",
    isActive: true,
    createdAt: now(),
    updatedAt: now()
  }
];

export const mockActivities: Activity[] = [
  {
    id: "act-1",
    customerId: "cust-1",
    activityDate: today(),
    type: "coverage_proposal",
    title: "보장분석 제안",
    note: "암/심장 중심 정리",
    createdAt: now()
  },
  {
    id: "act-2",
    customerId: "cust-2",
    activityDate: today(),
    type: "new_contact",
    title: "신규 연락",
    note: "전화 상담 예약",
    createdAt: now()
  },
  {
    id: "act-3",
    customerId: "cust-4",
    activityDate: addDays(-3),
    type: "application_completed",
    title: "청약 완료",
    note: "증권 전달 예정",
    createdAt: now()
  },
  {
    id: "act-4",
    customerId: "cust-3",
    activityDate: addDays(-5),
    type: "consultation",
    title: "카톡 상담",
    note: "보험료 부담",
    createdAt: now()
  }
];
