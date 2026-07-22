# Apply Mahsaagent RTL into Cursor workbench.html (durable until Cursor updates).
# Usage: powershell -ExecutionPolicy Bypass -File rtl/apply-to-cursor.ps1

$ErrorActionPreference = "Stop"
$RepoRoot = Split-Path -Parent $PSScriptRoot
$CssPath = Join-Path $PSScriptRoot "mahsaagent-rtl.css"
$WorkbenchHtml = Join-Path $env:LOCALAPPDATA "Programs\cursor\resources\app\out\vs\code\electron-sandbox\workbench\workbench.html"
$BackupHtml = "$WorkbenchHtml.mahsaagent-bak"
$MarkerStart = "<!-- MAHSAAGENT-RTL-START -->"
$MarkerEnd = "<!-- MAHSAAGENT-RTL-END -->"

if (-not (Test-Path $CssPath)) { throw "Missing CSS: $CssPath" }
if (-not (Test-Path $WorkbenchHtml)) { throw "Cursor workbench.html not found: $WorkbenchHtml" }

$css = Get-Content -Raw -Encoding UTF8 $CssPath
$html = Get-Content -Raw -Encoding UTF8 $WorkbenchHtml

if ($html -notmatch [regex]::Escape($MarkerStart)) {
  if (-not (Test-Path $BackupHtml)) {
    Copy-Item -LiteralPath $WorkbenchHtml -Destination $BackupHtml -Force
  }
}

# Remove previous inject if present
if ($html -match [regex]::Escape($MarkerStart)) {
  $html = [regex]::Replace(
    $html,
    [regex]::Escape($MarkerStart) + "[\s\S]*?" + [regex]::Escape($MarkerEnd),
    "",
    1
  )
}

$block = @"
$MarkerStart
<style id="mahsaagent-rtl-style">
$css
</style>
$MarkerEnd
"@

if ($html -notmatch "</head>") { throw "Unexpected workbench.html: no </head>" }
$html = $html -replace "</head>", ($block + "`r`n`t</head>")

Set-Content -LiteralPath $WorkbenchHtml -Value $html -Encoding UTF8 -NoNewline
Write-Host "OK: RTL injected into workbench.html"
Write-Host "Backup: $BackupHtml"
Write-Host "Reload Cursor window (Ctrl+Shift+P → Developer: Reload Window) to see chat RTL."
