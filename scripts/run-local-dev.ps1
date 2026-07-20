param(
    [string]$JavaHome = "C:\Users\bgchoi.SPECTRA\.jdks\jbr-17.0.14",
    [string]$NodeHome = "C:\Users\bgchoi.SPECTRA\AppData\Roaming\nvm\v24.12.0",
    [string]$ComposeFile = "docker-compose.dev.yml",
    [string]$DbServiceName = "postgres",
    [string]$DbContainerName = "dailyquest-db-dev",
    [string]$MailServiceName = "mailpit",
    [switch]$SkipInstall
)

$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RepoRoot = Split-Path -Parent $ScriptDir
$ComposePath = if ([System.IO.Path]::IsPathRooted($ComposeFile)) {
    $ComposeFile
} else {
    Join-Path $RepoRoot $ComposeFile
}
$BackendDir = Join-Path $RepoRoot "backend"
$FrontendDir = Join-Path $RepoRoot "frontend"

function ConvertTo-EncodedPowerShellCommand {
    param([Parameter(Mandatory = $true)][string]$Command)
    return [Convert]::ToBase64String([Text.Encoding]::Unicode.GetBytes($Command))
}

if (-not (Test-Path $ComposePath)) {
    throw "Compose file not found: $ComposePath"
}

if (-not (Test-Path $JavaHome)) {
    throw "Java 17 path not found: $JavaHome"
}

if (-not (Test-Path (Join-Path $BackendDir "gradlew.bat"))) {
    throw "Backend Gradle wrapper not found: $BackendDir\gradlew.bat"
}

if (-not (Test-Path (Join-Path $FrontendDir "package.json"))) {
    throw "Frontend package.json not found: $FrontendDir\package.json"
}

if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    throw "Docker CLI was not found. Install Docker Desktop and make sure 'docker' is available in PATH."
}

$previousErrorActionPreference = $ErrorActionPreference
$ErrorActionPreference = "Continue"
$dockerInfoOutput = docker info 2>&1
$dockerInfoExitCode = $LASTEXITCODE
$ErrorActionPreference = $previousErrorActionPreference

if ($dockerInfoExitCode -ne 0) {
    throw @"
Docker engine is not running.

Start Docker Desktop, wait until it shows Running, then try again:
  powershell -ExecutionPolicy Bypass -File .\scripts\run-local-dev.ps1
"@
}

Write-Host "[1/4] Starting dev services (DB + Mailpit)..."
docker compose -f $ComposePath up -d $DbServiceName $MailServiceName
if ($LASTEXITCODE -ne 0) {
    throw "Failed to start dev services with docker compose. Check Docker Desktop and $ComposePath."
}

Write-Host "[2/4] Waiting for DB healthcheck..."
$maxRetries = 30
for ($i = 1; $i -le $maxRetries; $i++) {
    $status = docker inspect --format "{{.State.Health.Status}}" $DbContainerName 2>$null
    if ($LASTEXITCODE -ne 0) {
        throw "DB container '$DbContainerName' was not found. Docker compose may have failed to create it."
    }

    if ($status -eq "healthy") {
        Write-Host "DB is healthy."
        break
    }

    if ($i -eq $maxRetries) {
        throw "DB did not become healthy in time."
    }

    Start-Sleep -Seconds 2
}

Write-Host "[3/4] Starting backend with Java 17 in a new PowerShell window..."
$backendCommand = @"
`$env:JAVA_HOME='$JavaHome'
`$env:Path=(Join-Path `$env:JAVA_HOME 'bin') + ';' + `$env:Path
Set-Location '$BackendDir'
Write-Host 'Using JAVA_HOME=' `$env:JAVA_HOME
java -version
.\gradlew.bat bootRun
"@
$encodedBackendCommand = ConvertTo-EncodedPowerShellCommand $backendCommand
Start-Process powershell -ArgumentList "-NoExit", "-EncodedCommand", $encodedBackendCommand | Out-Null

Write-Host "[4/4] Starting frontend in a new PowerShell window..."
$frontendInstall = if ($SkipInstall) { "" } else { "yarn install`r`n" }
$frontendCommand = @"
`$env:Path='$NodeHome;' + `$env:Path
Set-Location '$FrontendDir'
Write-Host 'Using Node ' (node -v)
$frontendInstall
yarn dev
"@
$encodedFrontendCommand = ConvertTo-EncodedPowerShellCommand $frontendCommand
Start-Process powershell -ArgumentList "-NoExit", "-EncodedCommand", $encodedFrontendCommand | Out-Null

Write-Host ""
Write-Host "Local stack started."
Write-Host "- DB: docker compose ($DbServiceName)"
Write-Host "- Mailpit: http://localhost:8025"
Write-Host "- Backend: new PowerShell window with Java 17"
Write-Host "- Frontend: new PowerShell window"
Write-Host ""
Write-Host "Usage:"
Write-Host "  powershell -ExecutionPolicy Bypass -File .\scripts\run-local-dev.ps1"
Write-Host "  powershell -ExecutionPolicy Bypass -File .\scripts\run-local-dev.ps1 -SkipInstall"
