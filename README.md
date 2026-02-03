# DailyQuest

> DailyQuest는 Next.js + Spring Boot 기반의 일정/할 일 관리 앱입니다.

## 기술 스택 (Tech Stack)
- Frontend: Next.js 16, React 19, TypeScript, Zustand, React Query
- Backend: Spring Boot 3.5.9, Java 17, PostgreSQL 15, JWT

## 빠른 시작 (Quick Start)
1. PostgreSQL 실행
```bash
docker-compose -f docker-compose.dev.yml up -d
```

2. Backend 실행
```bash
cd backend
gradlew.bat bootRun
```

3. Frontend 실행
```bash
cd frontend
yarn install
yarn dev
```

## 문서
- 백엔드 상세: `backend/README.md`
- 프론트엔드 상세: `frontend/README.md`

## License
MIT
