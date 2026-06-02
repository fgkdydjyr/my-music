$dist = "D:\Progect\my-music\SPlayer\dist"
$files = @(
  "知音-3.0.2-arm64-portable.exe",
  "知音-3.0.2-arm64-setup.exe",
  "知音-3.0.2-portable.exe",
  "知音-3.0.2-setup.exe",
  "知音-3.0.2-x64-portable.exe",
  "知音-3.0.2-x64-setup.exe",
  "知音-3.0.2-arm64-setup.exe.blockmap",
  "知音-3.0.2-setup.exe.blockmap",
  "知音-3.0.2-x64-setup.exe.blockmap"
)
$newPrefix = "splayer"
foreach ($f in $files) {
  $oldPath = Join-Path $dist $f
  if (Test-Path $oldPath) {
    $newName = $f -replace "^知音", $newPrefix
    $newPath = Join-Path $dist $newName
    Copy-Item -LiteralPath $oldPath -Destination $newPath
    Write-Host "$f -> $newName"
  } else {
    Write-Host "NOT FOUND: $f"
  }
}
