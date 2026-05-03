param(
  [Parameter(Mandatory = $true)]
  [string]$BaseUrl
)

$ErrorActionPreference = "Stop"

function Test-Endpoint {
  param(
    [string]$Url,
    [string]$Name
  )

  try {
    $response = Invoke-WebRequest -Uri $Url -Method GET -TimeoutSec 20
    $body = $response.Content | ConvertFrom-Json
    Write-Host "[OK] $Name -> $($response.StatusCode)" -ForegroundColor Green
    return $body
  } catch {
    Write-Host "[FAIL] $Name -> $($_.Exception.Message)" -ForegroundColor Red
    throw
  }
}

$base = $BaseUrl.TrimEnd("/")
Write-Host "Checking production API at $base" -ForegroundColor Cyan

$resources = Test-Endpoint -Url "$base/api/resources" -Name "/api/resources"
$roadmaps = Test-Endpoint -Url "$base/api/roadmaps" -Name "/api/roadmaps"
$stats = Test-Endpoint -Url "$base/api/stats" -Name "/api/stats"

$resourceCount = if ($resources -is [System.Array]) { $resources.Count } else { 0 }
$roadmapCount = if ($roadmaps -is [System.Array]) { $roadmaps.Count } else { 0 }

Write-Host ""
Write-Host "Summary:" -ForegroundColor Yellow
Write-Host "Resources array count: $resourceCount"
Write-Host "Roadmaps array count : $roadmapCount"
Write-Host "Stats response        : resources=$($stats.resourceCount), roadmaps=$($stats.roadmapCount)"

if ($resourceCount -eq 0 -or $roadmapCount -eq 0) {
  Write-Host ""
  Write-Host "Warning: one of the collections is empty. Verify TURSO env vars point to the intended database." -ForegroundColor DarkYellow
}
