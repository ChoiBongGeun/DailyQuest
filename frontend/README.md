# Frontend

> Next.js 16 + React 19 + TypeScript

## 기술 스택
- Next.js 16
- React 19
- TypeScript
- React Query
- Zustand
- i18next (ko/en)
- Vitest + Testing Library

## 실행 / 테스트
```bash
yarn dev
yarn test
yarn test:i18n-types
yarn build
```

## main 대비 변경 사항 (develop 기준)
- 설정 모달 / 알림 드롭다운 / 브라우저 알림 권한 UI 추가
- `use-task-reminder` 훅 추가 (개별 알림 우선 적용)
- `TaskModal`에 개별 알림 설정 UI 추가
- i18n 번역 키 (en/ko) 추가

## 참고 문서
- `frontend/QUICKSTART.md`
- `frontend/README_UI_IMPROVEMENT.md`
