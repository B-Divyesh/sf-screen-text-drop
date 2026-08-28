$ErrorActionPreference = "Stop"
$manifest = Invoke-RestMethod "https://github.com/B-Divyesh/sf-screen-text-drop/releases/latest/download/latest.json"
$asset = $manifest.platforms.'windows-x64'
$destination = Join-Path $env:USERPROFILE "Downloads\$($asset.name)"
Invoke-WebRequest $asset.url -OutFile $destination
$actual = (Get-FileHash $destination -Algorithm SHA256).Hash.ToLower()
if ($actual -ne $asset.sha256.ToLower()) { Remove-Item $destination; throw "Checksum mismatch; nothing installed." }
Write-Host "Verified SHA256 and saved Screen Text Drop to $destination"
Write-Host "Open the installer to continue. This v1 build is unsigned, so Windows may show a warning."
