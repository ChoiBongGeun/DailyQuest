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