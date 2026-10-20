# Script to start the local PostgreSQL cluster for IndaureX
$pgExe = "C:\Program Files\PostgreSQL\17\bin\postgres.exe"
$pgData = Join-Path $PSScriptRoot ".local_pgdata"
$port = 5435

$conn = Test-NetConnection -ComputerName 127.0.0.1 -Port $port -WarningAction SilentlyContinue
if ($conn.TcpTestSucceeded) {
    Write-Host "PostgreSQL is already running on port $port." -ForegroundColor Green
} else {
    Write-Host "Starting local PostgreSQL cluster on port $port..." -ForegroundColor Cyan
    Start-Process -FilePath $pgExe -ArgumentList "-D `"$pgData`" -p $port" -NoNewWindow
    Start-Sleep -Seconds 2
    Write-Host "PostgreSQL started successfully on port $port." -ForegroundColor Green
}
