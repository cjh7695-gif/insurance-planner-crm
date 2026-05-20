# 보험설계사 개인 CRM MVP

고객관리, 상담기록, 팔로업, 성공 체크리스트, 메시지 템플릿, 간단한 통계를 한 번에 관리하는 Next.js App Router 기반 MVP입니다.

## 현재 구현 범위

- 기본 라우팅과 공통 레이아웃
- mock data 기반 전체 화면
- Supabase 기준 테이블 SQL
- 고객관리 CRUD: mock 또는 Supabase 전환 지원
- 상담기록 CRUD: mock 또는 Supabase 전환 지원
- 상담기록 저장 시 고객의 마지막 연락일, 다음 연락일, 다음 액션 업데이트

체크리스트, 템플릿, 통계, 팔로업 화면은 현재 화면 확인과 일부 local state 동작 중심입니다. Supabase CRUD는 고객관리와 상담기록부터 연결했습니다.

## 실행 방법

```bash
npm install
npm run dev
```

브라우저에서 `http://localhost:3000`을 엽니다.

## 환경변수

`.env.example`을 기준으로 `.env.local`을 만듭니다.

```bash
NEXT_PUBLIC_DATA_MODE=mock
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

mock 모드:

```bash
NEXT_PUBLIC_DATA_MODE=mock
```

Supabase 모드:

```bash
NEXT_PUBLIC_DATA_MODE=supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Supabase 설정

1. Supabase 프로젝트를 만듭니다.
2. SQL Editor에서 [supabase/schema.sql](</C:/Users/cjh76/Documents/Codex/2026-05-20/new-chat/supabase/schema.sql>)을 실행합니다.
3. `.env.local`에 Supabase URL과 anon key를 넣습니다.
4. `NEXT_PUBLIC_DATA_MODE=supabase`로 바꾼 뒤 개발 서버를 재시작합니다.

현재 SQL은 로그인 없는 MVP 연결 테스트를 먼저 할 수 있도록 `user_id`를 준비 필드로 두고 RLS를 강제하지 않습니다. 실제 배포 전에 인증을 붙이고, `schema.sql` 하단의 RLS 가이드처럼 사용자별 정책으로 전환하세요.

## 주요 구조

```text
app/
  page.tsx                 대시보드
  customers/page.tsx       고객관리
  consultations/page.tsx   상담기록
  followups/page.tsx       팔로업
  checklist/page.tsx       성공 체크리스트
  templates/page.tsx       메시지 템플릿
  stats/page.tsx           통계
components/
  app-shell.tsx
  ui/
lib/
  analytics.ts
  constants.ts
  types.ts
  utils.ts
  data/
    app-data-provider.tsx
    mock-data.ts
    supabase-client.ts
    supabase-repository.ts
supabase/
  schema.sql
```

## 다음 단계

- Supabase Auth 로그인 추가
- RLS 활성화와 사용자별 데이터 분리
- 체크리스트, 템플릿, 활동 기록의 Supabase CRUD 확장
- 고객 상세 페이지와 상담 타임라인
- 모바일 화면 세부 QA
