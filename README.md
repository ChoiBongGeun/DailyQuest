# DailyQuest

> 일정 관리 웹/앱 - React + Spring Boot

## 🛠 기술 스택

- **Frontend**: React 19, Next.js 16, TypeScript, Zustand, React Query
- **Backend**: Spring Boot 3.5.9, PostgreSQL 15, JWT
- **DevOps**: Docker

## 🚀 빠른 시작

**1. PostgreSQL 실행**
```
docker-compose -f docker-compose.dev.yml up -d
```

**2. Backend 실행**
```
cd backend
gradlew.bat bootRun
```

**3. Frontend 실행**
```
cd frontend
yarn install && yarn dev
```

## 🌐 접속

- Frontend: http://localhost:3000
- Backend: http://localhost:8080/api/health
- Swagger: http://localhost:8080/swagger-ui.html

## 📂 프로젝트 구조
```
dailyquest/
├── frontend/              # Next.js
├── backend/               # Spring Boot
└── docker-compose.dev.yml
```

## ✅ 개발 현황

- [x] 개발 환경 구축
- [x] Swagger, Test 설정
- [x] Entity 설계
- [x] 핵심 REST API 구현
- [x] 핵심 UI 개발 및 백엔드 연동

## 🆕 최근 전체 변경 사항

- 프론트/백엔드 API 응답 포맷을 `ApiResponse<T>` 기준으로 통일
- 대시보드 주요 기능(전체/오늘/이번 주/프로젝트별 조회, 할 일 생성/수정/완료/삭제) 실제 백엔드 연동
- 인증/토큰 처리 및 오류 메시지 처리 흐름 정리
- 프로젝트/할 일 소유권 검증(권한 없는 사용자 접근 시 403) 적용
- 프론트 단위 테스트(Vitest) + 백엔드 통합/서비스 테스트 검증 완료

자세한 변경 내역은 `frontend/README.md`, `backend/README.md`를 참고하세요.

## 📝 License

MIT

---
