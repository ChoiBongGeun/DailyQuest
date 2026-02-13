param(
    [string]$ComposeFile = "docker-compose.dev.yml",
    [string]$ServiceName = "postgres",
    [string]$ContainerName = "dailyquest-db-dev"
)

$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RepoRoot = Split-Path -Parent $ScriptDir
$ComposePath = if ([System.IO.Path]::IsPathRooted($ComposeFile)) {
    $ComposeFile
} else {
    Join-Path $RepoRoot $ComposeFile
}

if (-not (Test-Path $ComposePath)) {
    throw "Compose file not found: $ComposePath"
}

Write-Host "[1/3] Stopping and removing dev DB volume..."
docker compose -f $ComposePath down -v

Write-Host "[2/3] Starting dev DB..."
docker compose -f $ComposePath up -d $ServiceName

Write-Host "[3/3] Waiting for DB healthcheck..."
$maxRetries = 30
for ($i = 1; $i -le $maxRetries; $i++) {
    $status = docker inspect --format "{{.State.Health.Status}}" $ContainerName 2>$null
    if ($status -eq "healthy") {
        Write-Host "DB is healthy."
        exit 0
    }
    Start-Sleep -Seconds 2
}

Write-Error "DB did not become healthy in time."
