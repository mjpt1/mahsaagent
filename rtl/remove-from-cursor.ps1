# Remove Mahsaagent RTL from Cursor workbench.html
# Usage: powershell -ExecutionPolicy Bypass -File rtl/remove-from-cursor.ps1

$ErrorActionPreference = "Stop"
$WorkbenchHtml = Join-Path $env:LOCALAPPDATA "Programs\cursor\resources\app\out\vs\code\electron-sandbox\workbench\workbench.html"
$BackupHtml = "$WorkbenchHtml.mahsaagent-bak"
$MarkerStart = "<!-- MAHSAAGENT-RTL-START -->"
$MarkerEnd = "<!-- MAHSAAGENT-RTL-END -->"

if (-not (Test-Path $WorkbenchHtml)) { throw "Cursor workbench.html not found: $WorkbenchHtml" }

if (Test-Path $BackupHtml) {
  Copy-Item -LiteralPath $BackupHtml -Destination $WorkbenchHtml -Force
  Write-Host "OK: restored workbench.html from backup"
  exit 0
}

$html = Get-Content -Raw -Encoding UTF8 $WorkbenchHtml
if ($html -match [regex]::Escape($MarkerStart)) {
  $html = [regex]::Replace(
    $html,
    [regex]::Escape($MarkerStart) + "[\s\S]*?" + [regex]::Escape($MarkerEnd),
    "",
    1
  )
  Set-Content -LiteralPath $WorkbenchHtml -Value $html -Encoding UTF8 -NoNewline
  Write-Host "OK: removed MAHSAAGENT-RTL markers"
} else {
  Write-Host "Nothing to remove (markers not found)"
}
