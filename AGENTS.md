# DailyQuest — Agent Reference

## Java (Backend)

- 프로젝트 요구 버전: **Java 17**
- 시스템 기본(`java -version`)은 Java 8이므로 백엔드 실행/빌드 전 반드시 JAVA_HOME을 17로 지정해야 함
- JDK 17 경로: `C:\Users\bgchoi.SPECTRA\.jdks\jbr-17.0.14`

### PowerShell에서 임시 설정
```powershell
$env:JAVA_HOME='C:\Users\bgchoi.SPECTRA\.jdks\jbr-17.0.14'
$env:Path="$env:JAVA_HOME\bin;$env:Path"
```

### 백엔드 실행
```powershell
cd backend
.\gradlew bootRun
```

---

## Node (Frontend)

- 프로젝트 요구 버전: **Node v24.12.0**
- 시스템 nvm 전역 버전을 바꾸지 않고, 아래 고정 경로로 직접 실행
- Node 24 경로: `C:\Users\bgchoi.SPECTRA\AppData\Roaming\nvm\v24.12.0\node.exe`

### 프론트엔드 실행 (yarn dev)
```cmd
"C:\Users\bgchoi.SPECTRA\AppData\Roaming\nvm\v24.12.0\node.exe" "C:\Users\bgchoi.SPECTRA\AppData\Roaming\nvm\v24.12.0\node_modules\yarn\bin\yarn.js" dev
```

또는 `frontend/dev.cmd` 실행 (있을 경우)

### 패키지 매니저
- **yarn** 사용 (`yarn.lock` 기준)

---

## 프로젝트 구조

```
DailyQuest/
├── backend/   # Spring Boot 3.5.9, Java 17, Gradle
└── frontend/  # Next.js 15, TypeScript, yarn
```
