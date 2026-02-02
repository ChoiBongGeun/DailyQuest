# Frontend

> Next.js 16 + React 19 + TypeScript

## 🛠 기술 스택

- Next.js 16
- React 19
- TypeScript
- React Query
- Zustand
- i18next (ko/en)
- Vitest + Testing Library

## 🚀 실행

```bash
yarn dev
```

## 🧪 테스트

```bash
yarn test
yarn test:i18n-types
yarn tsc --noEmit --incremental false
```

## 🆕 최근 프론트엔드 변경 사항

- API 클라이언트 리팩토링
  - 백엔드 `ApiResponse<T>` 포맷 언랩 공통 처리 (`src/lib/api/response.ts`)
  - 인증/할 일/프로젝트/대시보드 API 응답 처리 일관화
- 대시보드 실연동 강화
  - 전체/오늘/이번 주/프로젝트별 할 일 조회
  - 할 일 생성/수정/완료/삭제 백엔드 연동
  - 프로젝트 목록 사이드바 실데이터 연동
- 타입 정리
  - 백엔드 DTO 기준으로 Task/Project/Dashboard 타입 정합성 개선
- 다국어(i18n) 개선
  - ko.json 기반 문자열 적용 확대
  - i18next 타입 선언 추가로 키 오타 컴파일 타임 검증
  - 의도적 오타 키 검증 스크립트 추가 (`yarn test:i18n-types`)
- 테스트 환경 도입
  - Vitest/jsdom/Testing Library 설정
  - 유틸/응답 언랩 단위 테스트 추가

## 📎 참고 문서

- 초기 실행 가이드: `frontend/QUICKSTART.md`
- UI 개선 문서: `frontend/README_UI_IMPROVEMENT.md`
