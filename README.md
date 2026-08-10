# DailyQuest

> 할 일 관리 웹 앱 — Next.js + Spring Boot 풀스택 프로젝트

[![Tech](https://img.shields.io/badge/Frontend-Next.js%2016-black)](https://nextjs.org/)
[![Tech](https://img.shields.io/badge/Backend-Spring%20Boot%203.5-green)](https://spring.io/projects/spring-boot)
[![Tech](https://img.shields.io/badge/DB-PostgreSQL%2015-blue)](https://www.postgresql.org/)

---

## 목차

1. [프로젝트 소개](#1-프로젝트-소개)
2. [기술 스택](#2-기술-스택)
3. [요구사항과 구현](#3-요구사항과-구현)
4. [시스템 아키텍처](#4-시스템-아키텍처)
5. [주요 기술적 결정](#5-주요-기술적-결정)
6. [API 엔드포인트](#6-api-엔드포인트)
7. [데이터베이스 스키마](#7-데이터베이스-스키마)
8. [로컬 실행 방법](#8-로컬-실행-방법)

---

## 1. 프로젝트 소개

DailyQuest는 개인 생산성 향상을 위한 할 일 관리 앱입니다.  
단순한 CRUD를 넘어 **반복 태스크 자동 생성**, **마감 시간 기반 브라우저 알림**, **비밀번호 재설정 메일 발송** 등 실서비스 수준의 기능을 목표로 구현했습니다.

**주요 특징**
- 태스크에 마감 시간(dueTime)과 개별 알림 오프셋을 설정하면 브라우저 알림이 자동 발송됩니다.
- 반복 태스크(일/주/월)를 완료하면 다음 주기 태스크가 자동 생성됩니다.
- 비밀번호 재설정은 SHA-256 해싱된 일회용 토큰을 메일로 발송하는 방식으로 구현했습니다.
- 서버사이드 검색/필터/정렬/페이지네이션으로 대용량 데이터에도 대응 가능한 구조입니다.

---

## 2. 기술 스택

### Frontend
| 항목 | 기술 |
|------|------|
| 프레임워크 | Next.js 16 (App Router), React 19 |
| 언어 | TypeScript |
| 서버 상태 | TanStack React Query v5 |
| 클라이언트 상태 | Zustand |
| 스타일 | Tailwind CSS |
| 다국어 | i18next (한국어 / 영어) |
| 테스트 | Vitest + Testing Library |

### Backend
| 항목 | 기술 |
|------|------|
| 프레임워크 | Spring Boot 3.5.9 |
| 언어 | Java 17 |
| ORM | Spring Data JPA (Hibernate) |
| 인증 | Spring Security + JWT (jjwt) |
| DB 마이그레이션 | Flyway |
| API 문서 | Springdoc OpenAPI (Swagger UI) |
| 메일 | Spring Mail + Mailpit (로컬) |

### Infra
| 항목 | 기술 |
|------|------|
| DB | PostgreSQL 15 |
| 컨테이너 | Docker Compose |
| 로컬 메일 서버 | Mailpit |

---

## 3. 요구사항과 구현

### 3-1. 할 일 관리

**요구사항**  
태스크를 생성/수정/삭제하고, 우선순위·마감일·프로젝트별로 분류하고 싶다.

**구현**
- `Task` 엔티티: 제목, 설명, 우선순위(HIGH/MEDIUM/LOW), 마감일, 마감 시간, 프로젝트 연결, 완료 여부, 완료 시각
- 서버사이드 검색/필터/정렬/페이지네이션 (`Specification` + `Pageable`)
- 우선순위 정렬 시 문자열 알파벳 정렬 문제를 `@Formula`(CASE 식)로 해결하여 HIGH → MEDIUM → LOW 의미론적 순서 보장

---

### 3-2. 반복 태스크

**요구사항**  
매일 아침 운동처럼 주기적으로 반복되는 태스크를 자동으로 생성하고 싶다.

**구현**
- `RecurrenceType`: DAILY / WEEKLY / MONTHLY
- 반복 태스크 완료 시 `recurrenceInterval` + `recurrenceType` 기준으로 다음 마감일을 계산해 자식 태스크 자동 생성
- `parent_task_id`로 원본-반복본 계보 추적 가능
- `recurrenceEndDate`로 반복 종료 시점 지정

---

### 3-3. 마감 알림 / 리마인더

**요구사항**  
태스크 마감 시간 N분 전에 알림을 받고 싶다. 태스크마다 알림 시점을 다르게 설정하고 싶다.

**구현**
- 태스크별 `reminderOffsets` (분 단위 복수 설정 가능, 예: [60, 15])
- 설정 없으면 사용자 글로벌 설정(Zustand) 사용
- `useTaskReminder` 훅에서 30초 간격으로 체크, 브라우저 Notification API 발송
- 중복 발송 방지: `sentRemindersRef`(Set)로 당일 발송 이력 관리, 자정마다 초기화
- catch-up 윈도우(60초) 적용: 앱 재진입 시 이미 지난 알림 오발송 방지

---

### 3-4. 비밀번호 재설정

**요구사항**  
비밀번호를 잊어버린 사용자가 이메일로 재설정할 수 있어야 한다.

**구현**
- `SecureRandom` 32바이트 토큰 생성 → `SHA-256` 해싱 후 DB 저장 (원문 미저장)
- 토큰 유효시간 30분 (설정값으로 조정 가능)
- 재설정 성공 시 해당 유저의 미사용 토큰 전체 삭제 (토큰 재사용 방지)
- 이메일 미가입 주소 요청 시에도 동일한 200 응답 반환 (이메일 존재 여부 노출 방지)
- 로컬 개발 시 Mailpit으로 발송 메일 확인 (`http://localhost:8025`)

---

### 3-5. 프로젝트 분류 및 통계

**요구사항**  
태스크를 프로젝트별로 묶어서 보고, 완료율/트렌드를 확인하고 싶다.

**구현**
- 프로젝트 생성/수정/삭제, 색상 태그
- 프로젝트 상세 페이지: 전체/완료/완료율 통계 카드
- 7일 생성/완료 트렌드 차트 (바 차트)
- 태스크 완료·삭제 직후 stats 즉시 갱신 (React Query `invalidateQueries`)
- N+1 쿼리 개선: 프로젝트 통계 집계 쿼리 최적화

---

### 3-6. 인증 및 보안

**요구사항**  
회원가입/로그인/로그아웃, 본인 계정 관리, 안전한 API 보호가 필요하다.

**구현**
- JWT Bearer 토큰 인증 (Spring Security Stateless)
- 로그인 시 타이밍 공격 방지: 이메일 미존재 시에도 bcrypt 해싱 수행 후 거부
- 닉네임 변경, 비밀번호 변경, 회원 탈퇴 (본인 확인 후)
- CORS: 프로필(dev/prod)별 분리 설정 — dev는 `localhost:*` 와일드카드, prod는 지정 도메인만 허용
- Optimistic Locking (`@Version`) 으로 동시 수정 충돌 방지

---

### 3-7. UI/UX

**요구사항**  
어두운 환경에서도 편하게 쓸 수 있고, 한국어/영어를 지원해야 한다. 접근성도 고려해야 한다.

**구현**
- 다크모드: Tailwind `dark:` 클래스 + Zustand 테마 상태 (`localStorage` 유지)
- 다국어: i18next (한국어 기본, 영어 지원) — 설정 모달에서 실시간 전환
- 접근성: `aria-label`, `aria-expanded`, `aria-modal`, `role="dialog"`, ESC 키 닫기, 키보드 포커스 표시
- 우선순위별 태스크 좌측 컬러 보더 (HIGH=빨강, MEDIUM=주황, LOW=초록)
- 반응형 레이아웃, 페이지네이션 번호 버튼 + 줄임표

---

## 4. 시스템 아키텍처

```
┌─────────────────────────────────────────────────────┐
│                     Browser                         │
│  Next.js 16 (App Router)                           │
│  ├── React Query  (서버 상태 캐싱/동기화)           │
│  ├── Zustand      (UI 상태, 테마, 언어, 알림)       │
│  └── useTaskReminder (30s 폴링 → 브라우저 알림)     │
└─────────────────────┬───────────────────────────────┘
                      │ REST API (JSON)
                      │ Authorization: Bearer <JWT>
┌─────────────────────▼───────────────────────────────┐
│             Spring Boot 3.5 (port 8080)             │
│  ├── Spring Security (JWT Filter)                   │
│  ├── Controllers → Services → Repositories          │
│  ├── Flyway (V1~V5 마이그레이션 자동 적용)          │
│  └── Spring Mail → Mailpit (로컬) / SMTP (운영)     │
└─────────────────────┬───────────────────────────────┘
                      │ JDBC
┌─────────────────────▼───────────────────────────────┐
│             PostgreSQL 15 (port 5434)               │
└─────────────────────────────────────────────────────┘
```

---

## 5. 주요 기술적 결정

### Priority 정렬 — `@Formula` 활용
우선순위를 `VARCHAR`(HIGH/MEDIUM/LOW)로 저장하면 알파벳 정렬 시 `HIGH → LOW → MEDIUM` 순이 되어 의미론적 순서와 다릅니다.  
DB 마이그레이션 없이 Hibernate `@Formula`로 가상 컬럼(`priorityRank`)을 만들어 `HIGH=1, MEDIUM=2, LOW=3`으로 매핑해 정렬했습니다.

### 비밀번호 재설정 토큰 — 원문 미저장
토큰 원문을 DB에 저장하면 DB 유출 시 토큰이 노출됩니다.  
`SecureRandom` 생성 → SHA-256 해싱 값만 저장하고, 원문은 메일에만 전달합니다.  
검증 시 수신한 토큰을 동일하게 해싱해 비교합니다.

### 로그인 타이밍 공격 방지
`SELECT BY EMAIL`이 없으면 바로 401을 던지면, 응답 시간 차이로 이메일 존재 여부를 알 수 있습니다.  
미존재 이메일에도 동일하게 bcrypt 해싱을 수행해 응답 시간을 일정하게 유지합니다.

### 리마인더 catch-up 윈도우
앱을 재실행하거나 탭을 다시 열 때 이미 지난 알림 오프셋이 즉시 발송되는 문제가 있었습니다.  
체크 주기(30초) × 2 = 60초를 catch-up 윈도우로 설정해, 트리거 시각으로부터 60초 이내인 경우에만 발송합니다.

### Flyway 마이그레이션 원칙
한 번 배포된 마이그레이션 파일은 수정하지 않고, 변경사항은 항상 새 버전 파일(V5, V6...)로 추가합니다.  
`baseline-on-migrate`를 통해 기존 DB에 Flyway를 점진적으로 도입했습니다.

### CORS 프로필 분리
`application-dev.yml`: `localhost:*` 와일드카드 허용  
`application-prod.yml`: `FRONTEND_URL` 환경변수로 지정된 도메인만 허용  
동일 코드베이스로 환경별 보안 정책을 다르게 적용합니다.

### Production 환경 변수
`application-prod.yml`은 다음 환경변수가 없으면 시작하지 않습니다.

`FRONTEND_URL`, `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`, `JWT_SECRET`, `ACTUATOR_USERNAME`, `ACTUATOR_PASSWORD`

---

## 6. API 엔드포인트

> Swagger UI: `http://localhost:8080/swagger-ui.html`

### 인증 (Public)
| Method | URL | 설명 |
|--------|-----|------|
| POST | `/api/users/signup` | 회원가입 |
| POST | `/api/users/login` | 로그인 (JWT 발급) |
| GET | `/api/users/check-email` | 이메일 중복 확인 |
| POST | `/api/users/forgot-password` | 비밀번호 재설정 메일 발송 |
| POST | `/api/users/reset-password` | 비밀번호 재설정 |

### 사용자 (인증 필요)
| Method | URL | 설명 |
|--------|-----|------|
| GET | `/api/users/me` | 내 정보 조회 |
| PATCH | `/api/users/me/nickname` | 닉네임 변경 |
| PATCH | `/api/users/me/password` | 비밀번호 변경 |
| DELETE | `/api/users/me` | 회원 탈퇴 |

### 태스크 (인증 필요)
| Method | URL | 설명 |
|--------|-----|------|
| GET | `/api/tasks` | 전체 태스크 목록 |
| POST | `/api/tasks` | 태스크 생성 |
| GET | `/api/tasks/{id}` | 태스크 상세 |
| PATCH | `/api/tasks/{id}` | 태스크 수정 |
| DELETE | `/api/tasks/{id}` | 태스크 삭제 |
| PATCH | `/api/tasks/{id}/complete` | 완료 처리 |
| PATCH | `/api/tasks/{id}/uncomplete` | 완료 취소 |
| GET | `/api/tasks/search` | 검색/필터/정렬/페이지네이션 |
| GET | `/api/tasks/today` | 오늘 마감 태스크 |
| GET | `/api/tasks/week` | 이번 주 태스크 |
| GET | `/api/tasks/overdue` | 기한 초과 태스크 |
| GET | `/api/tasks/project/{projectId}` | 프로젝트별 태스크 |

### 프로젝트 (인증 필요)
| Method | URL | 설명 |
|--------|-----|------|
| GET | `/api/projects` | 프로젝트 목록 |
| POST | `/api/projects` | 프로젝트 생성 |
| GET | `/api/projects/{id}` | 프로젝트 상세 |
| PATCH | `/api/projects/{id}` | 프로젝트 수정 |
| DELETE | `/api/projects/{id}` | 프로젝트 삭제 |
| GET | `/api/projects/{id}/stats` | 프로젝트 통계 |

### 대시보드 (인증 필요)
| Method | URL | 설명 |
|--------|-----|------|
| GET | `/api/dashboard/stats` | 전체 통계 |

---

## 7. 데이터베이스 스키마

```sql
users
├── id, email (unique), password (bcrypt), nickname
└── created_at

projects
├── id, user_id (FK → users)
├── name, color
└── created_at

tasks
├── id, user_id (FK → users), project_id (FK → projects)
├── title, description
├── priority           -- VARCHAR: HIGH / MEDIUM / LOW
├── due_date, due_time
├── reminder_offsets   -- VARCHAR: "60,15" (분 단위, 쉼표 구분)
├── is_completed, completed_at
├── is_recurring, recurrence_type, recurrence_interval, recurrence_end_date
├── parent_task_id     -- 반복 태스크 계보 추적
├── version            -- Optimistic Locking
└── created_at, updated_at

password_reset_tokens
├── id, user_id (FK → users)
├── token_hash         -- SHA-256 해시값 (원문 미저장)
├── expires_at, used_at
└── created_at
```

**Flyway 마이그레이션 이력**
| 버전 | 내용 |
|------|------|
| V1 | 초기 스키마 (users, projects, tasks, 인덱스) |
| V2 | tasks.due_time 컬럼 추가 |
| V3 | tasks.reminder_offsets 컬럼 추가 |
| V4 | password_reset_tokens 테이블 생성 |

---

## 8. 로컬 실행 방법

### 사전 요구사항
- Docker Desktop
- JDK 17 (`C:\Users\<user>\.jdks\jbr-17.0.14` 또는 환경변수 `JAVA_HOME`)
- Node.js 24 (nvm 권장)
- Yarn

### 한 번에 실행 (권장)

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\run-local-dev.ps1
```

PostgreSQL + Mailpit 컨테이너 기동 → 백엔드 → 프론트엔드 순서로 자동 실행됩니다.  
패키지가 이미 설치된 경우:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\run-local-dev.ps1 -SkipInstall
```

### 수동 실행

```bash
# 1. DB + 메일 서버
docker compose -f docker-compose.dev.yml up -d

# 2. Backend
cd backend
./gradlew bootRun

# 3. Frontend
cd frontend
yarn install
yarn dev
```

### 접속 주소

| 서비스 | URL |
|--------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8080 |
| Swagger UI | http://localhost:8080/swagger-ui.html |
| Mailpit (메일 수신함) | http://localhost:8025 |
| PostgreSQL | localhost:5434 |
