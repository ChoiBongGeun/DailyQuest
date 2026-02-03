# Backend

> Spring Boot 3.5.9 + Java 17

## 기술 스택
- Spring Boot 3.5.9
- Java 17
- PostgreSQL 15
- Spring Data JPA
- Spring Security + JWT
- Springdoc OpenAPI (Swagger)

## 실행 / 테스트
```bash
gradlew.bat bootRun
gradlew.bat test
```

## main 대비 변경 사항 (develop 기준)
- `Task` 엔티티: `dueTime`, `reminderOffsets` 필드 추가
- Flyway 마이그레이션 추가: `V2__add_task_due_time.sql`, `V3__add_task_reminder_offsets.sql`
- `TaskDto`, `TaskService`에 due time / 개별 알림 오프셋 처리 반영

## 이번 작업 정리 (task-level reminder)
- [x] `Task`에 `reminderOffsets` 추가
- [x] Flyway migration (`reminder_offsets` 컬럼) 추가
- [x] `TaskDto`에 `reminderOffsets` 필드 추가
- [x] `TaskService`에 `reminderOffsets` 처리 추가
