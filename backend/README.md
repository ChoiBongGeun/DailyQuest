# Backend

> Spring Boot 3.5.9 + Java 17

## 🛠 기술 스택

- Spring Boot 3.5.9
- Java 17
- PostgreSQL 15
- Spring Data JPA
- Spring Security + JWT
- Swagger (Springdoc OpenAPI)

## 💻 개발 환경

- Java 17
- Gradle 8.x
- PostgreSQL 15 (Docker)

## 🚀 실행

**Windows**
```
gradlew.bat bootRun
```

**macOS/Linux**
```
./gradlew bootRun
```

## 🧪 테스트
```
gradlew.bat test
```

## 🌐 접속

- Health Check: http://localhost:8080/api/health
- Swagger UI: http://localhost:8080/swagger-ui.html

## 📂 디렉토리

- `config/` - 설정 (Security, CORS, Swagger)
- `controller/` - REST API
- `service/` - 비즈니스 로직
- `domain/` - Entity, Repository
- `dto/` - Request/Response DTO

## 🆕 최근 백엔드 변경 사항

- 프로젝트 통계 API 추가
  - `GET /api/projects/{projectId}/stats`
- 우선순위별 할 일 조회 API 추가
  - `GET /api/tasks/priority/{priority}`
- 프로젝트/할 일 소유권 검증 강화
  - 본인 리소스가 아니면 `403 (NO_PERMISSION, code: 403001)` 반환
- Task/Project 서비스의 owner 검증 로직 반영
- 통합 테스트 추가
  - `TaskControllerIntegrationTest`: 타인 task 접근 403 검증
  - `ProjectControllerIntegrationTest`: 타인 project 접근 403 검증
- 전체 테스트 재검증 완료 (`./gradlew test`, Java 17)
