create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade default auth.uid(),
  name text not null,
  phone text not null,
  birth_date date,
  job text,
  family_note text,
  grade text not null default 'B' check (grade in ('A', 'B', 'C', '기존고객', '소개가능', '휴면', '거절')),
  stage text not null default '신규후보' check (stage in ('신규후보', '첫연락완료', '상담예정', '보장분석중', '제안완료', '청약완료', '보류', '거절', '유지관리')),
  interests text[] not null default '{}',
  referral_potential text not null default '보통' check (referral_potential in ('높음', '보통', '낮음')),
  last_contact_date date,
  next_contact_date date,
  next_action text,
  memo text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.consultations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade default auth.uid(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  consultation_date date not null default current_date,
  method text not null default '전화' check (method in ('대면', '전화', '카톡', '줌', '기타')),
  summary text not null,
  needs text,
  key_quote text,
  family_history_note text,
  current_insurance text,
  budget text,
  rejection_reason text check (
    rejection_reason is null
    or rejection_reason in ('보험료부담', '배우자상의', '필요성부족', '기존보험있음', '바쁨', '신뢰부족', '건강고지', '기타')
  ),
  proposal_direction text,
  next_action text,
  next_contact_date date,
  review text,
  created_at timestamptz not null default now()
);

create table if not exists public.checklist_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade default auth.uid(),
  title text not null,
  target_count integer,
  unit text,
  sort_order integer not null default 0,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.checklist_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade default auth.uid(),
  item_id uuid not null references public.checklist_items(id) on delete cascade,
  customer_id uuid references public.customers(id) on delete set null,
  date date not null default current_date,
  completed boolean not null default false,
  count integer not null default 0,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, item_id, date)
);

create table if not exists public.message_templates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade default auth.uid(),
  title text not null,
  category text not null check (category in (
    '첫 상담 제안',
    '보장분석 제안',
    '상담 전 안내',
    '상담 후 감사',
    '청약 후 감사',
    '보류 고객 재연락',
    '소개 요청',
    '생일 축하',
    '보험료 부담 고객 대응',
    '배우자 상의 고객 대응'
  )),
  content text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.activities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade default auth.uid(),
  customer_id uuid references public.customers(id) on delete set null,
  activity_date date not null default current_date,
  type text not null check (type in (
    'new_contact',
    'existing_contact',
    'consultation',
    'coverage_proposal',
    'application_completed',
    'referral_request',
    'followup_done',
    'checklist_done'
  )),
  title text not null,
  note text,
  created_at timestamptz not null default now()
);

drop trigger if exists customers_set_updated_at on public.customers;
create trigger customers_set_updated_at
before update on public.customers
for each row execute function public.set_updated_at();

drop trigger if exists checklist_items_set_updated_at on public.checklist_items;
create trigger checklist_items_set_updated_at
before update on public.checklist_items
for each row execute function public.set_updated_at();

drop trigger if exists checklist_logs_set_updated_at on public.checklist_logs;
create trigger checklist_logs_set_updated_at
before update on public.checklist_logs
for each row execute function public.set_updated_at();

drop trigger if exists message_templates_set_updated_at on public.message_templates;
create trigger message_templates_set_updated_at
before update on public.message_templates
for each row execute function public.set_updated_at();

create index if not exists customers_next_contact_idx on public.customers(next_contact_date);
create index if not exists customers_grade_stage_idx on public.customers(grade, stage);
create index if not exists consultations_customer_date_idx on public.consultations(customer_id, consultation_date desc);
create index if not exists checklist_logs_date_idx on public.checklist_logs(date desc);
create index if not exists checklist_logs_item_date_idx on public.checklist_logs(item_id, date desc);
create index if not exists activities_date_type_idx on public.activities(activity_date desc, type);

insert into public.checklist_items (id, user_id, title, target_count, unit, sort_order, is_default)
values
  ('00000000-0000-4000-8000-000000000101', null, '신규 연락 5명', 5, '명', 1, true),
  ('00000000-0000-4000-8000-000000000102', null, '기존 고객 안부 3명', 3, '명', 2, true),
  ('00000000-0000-4000-8000-000000000103', null, '보장분석 제안 2명', 2, '명', 3, true),
  ('00000000-0000-4000-8000-000000000104', null, '상담 1건 이상', 1, '건', 4, true),
  ('00000000-0000-4000-8000-000000000105', null, '소개 요청 1회', 1, '회', 5, true),
  ('00000000-0000-4000-8000-000000000106', null, '상담 복기 1건', 1, '건', 6, true),
  ('00000000-0000-4000-8000-000000000107', null, '보험 공부 30분', 30, '분', 7, true),
  ('00000000-0000-4000-8000-000000000108', null, '내일 할 일 정리', 1, '회', 8, true)
on conflict (id) do nothing;

insert into public.message_templates (id, user_id, title, category, content, is_active)
values
  ('00000000-0000-4000-8000-000000000201', null, '첫 상담 제안', '첫 상담 제안', '[고객명]님, 안녕하세요. 지난번 말씀 나눈 보장 상황을 간단히 점검해보면 좋을 것 같아 연락드렸습니다. 편하신 시간에 20분 정도 통화 가능하실까요?', true),
  ('00000000-0000-4000-8000-000000000202', null, '보장분석 자료 발송', '보장분석 제안', '[고객명]님, 말씀해주신 [관심보장] 부분 중심으로 현재 보장과 보완 포인트를 정리해봤습니다. 확인하시고 궁금한 점 편하게 남겨주세요.', true),
  ('00000000-0000-4000-8000-000000000203', null, '상담 후 감사', '상담 후 감사', '[고객명]님, 오늘 시간 내주셔서 감사합니다. 말씀해주신 내용 기준으로 무리 없는 방향부터 정리해서 다시 안내드리겠습니다.', true),
  ('00000000-0000-4000-8000-000000000204', null, '소개 요청', '소개 요청', '[고객명]님, 주변에 보험을 정리해보고 싶지만 어디서부터 봐야 할지 모르는 분이 계시면 편하게 소개 부탁드립니다. 부담 없는 점검부터 도와드리겠습니다.', true)
on conflict (id) do nothing;

comment on table public.customers is '보험설계사용 고객관리 테이블. 주민번호, 계좌번호, 상세 병력 등 민감정보 저장 금지.';
comment on table public.consultations is '고객 상담기록 테이블. 상세 병력 대신 상담에 필요한 최소 메모만 저장.';

-- Production RLS guide:
-- 인증을 붙이는 2차 버전에서는 아래 흐름으로 전환하세요.
-- 1. 기존 익명 테스트 데이터를 사용자 계정에 매핑합니다.
-- 2. user_id를 not null로 변경합니다.
-- 3. 각 테이블에 row level security를 enable하고 auth.uid() = user_id 정책을 적용합니다.
--
-- 예:
-- alter table public.customers enable row level security;
-- create policy "customers_crud_own" on public.customers
-- for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
