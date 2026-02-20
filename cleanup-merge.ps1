$gitDir = "c:\Users\jrwig\Documents\drill web app\sport-streak-academy\.git"

# Remove swap file
$swapFile = "$gitDir\.MERGE_MSG.swp"
if (Test-Path $swapFile) {
    Remove-Item $swapFile -Force
    Write-Host "Swap file removed"
}

# Remove merge state files
$mergeFiles = @("MERGE_HEAD", "MERGE_MSG", "MERGE_MODE", "COMMIT_EDITMSG")
foreach ($file in $mergeFiles) {
    $path = "$gitDir\$file"
    if (Test-Path $path) {
        Remove-Item $path -Force
        Write-Host "Removed $file"
    }
}

Write-Host "Merge state cleaned up"

# Reset git
cd "c:\Users\jrwig\Documents\drill web app\sport-streak-academy"
git reset --hard HEAD
git fetch origin
git push origin main
