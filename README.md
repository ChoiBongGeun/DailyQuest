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
- [ ] Entity 설계
- [ ] REST API 구현
- [ ] UI 개발

## 📝 License

MIT

---