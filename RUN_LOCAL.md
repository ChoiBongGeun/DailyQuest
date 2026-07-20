# Run Local Stack

Use the root script below to start DB, backend, and frontend together on Windows PowerShell.

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\run-local-dev.ps1
```

Notes:

- Starts PostgreSQL from `docker-compose.dev.yml`
- Starts Mailpit from `docker-compose.dev.yml` for local email testing
- Waits until DB healthcheck is `healthy`
- Opens a new PowerShell window for backend with Java 17 from `C:\Users\bgchoi.SPECTRA\.jdks\jbr-17.0.14`
- Opens a new PowerShell window for frontend and runs `yarn dev`
- Mailpit web inbox is available at <http://localhost:8025>

Optional:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\run-local-dev.ps1 -SkipInstall
```

Use `-SkipInstall` when frontend dependencies are already installed and you do not want to run `yarn install` again.
