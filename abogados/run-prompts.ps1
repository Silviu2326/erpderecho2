param([string]$PromptsFile, [string]$LogFile, [int]$Count = 4)

$ErrorActionPreference = "Continue"
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$content = [System.IO.File]::ReadAllText($PromptsFile, [System.Text.Encoding]::UTF8)
$lines = $content -split '\r?\n'
$prompts = @()
$currentPrompt = ""

foreach ($line in $lines) {
    $trimmed = $line.Trim()
    
    if ($trimmed.StartsWith("Siguiendo")) {
        if ($currentPrompt -ne "") {
            $prompts += $currentPrompt
        }
        $currentPrompt = $line
    }
    elseif ($trimmed.StartsWith("#") -or $trimmed -eq "") {
        if ($currentPrompt -ne "" -and $prompts.Count -lt $Count) {
            $prompts += $currentPrompt
        }
        $currentPrompt = ""
    }
    elseif ($currentPrompt -ne "") {
        $currentPrompt += "`n" + $line
    }
}

if ($currentPrompt -ne "") {
    $prompts += $currentPrompt
}

$log = @()
$log += "=========================================="
$log += "OpenCode Prompt Runner - $(Get-Date)"
$log += "=========================================="
$log += "Total prompts detected: $($prompts.Count)"
$log += ""

for ($i = 0; $i -lt [Math]::Min($Count, $prompts.Count); $i++) {
    $index = $i + 1
    $prompt = $prompts[$i]
    
    $log += "----------------------------------------"
    $log += "PROMPT $index/$Count"
    $log += "----------------------------------------"
    $preview = if ($prompt.Length -gt 200) { $prompt.Substring(0, 200) + "..." } else { $prompt }
    $log += $preview
    $log += ""
    
    Write-Host "=== PROMPT $index/$Count ===" -ForegroundColor Cyan
    Write-Host $preview.Substring(0, [Math]::Min(150, $preview.Length)) -ForegroundColor Gray
    Write-Host ""
    
    $tempFile = [System.IO.Path]::GetTempFileName() + ".txt"
    [System.IO.File]::WriteAllText($tempFile, $prompt, [System.Text.Encoding]::UTF8)
    
    Write-Host "Ejecutando opencode..." -ForegroundColor Yellow
    
    try {
        $output = & npx opencode run $tempFile 2>&1 | Out-String
    } catch {
        $output = "Error: $_"
    }
    
    $log += "OUTPUT:"
    $log += $output
    $log += ""
    
    Write-Host $output
    Write-Host ""
    
    Remove-Item $tempFile -Force -ErrorAction SilentlyContinue
    
    $log += "=== PROMPT $index COMPLETADO ==="
    $log += ""
    Write-Host "=== PROMPT $index COMPLETADO ===" -ForegroundColor Green
    Write-Host ""
}

$log += "=========================================="
$log += "EJECUCION COMPLETADA - $(Get-Date)"
$log += "=========================================="

$log | Out-File -FilePath $LogFile -Encoding UTF8
Write-Host "Log guardado en: $LogFile" -ForegroundColor Yellow
Write-Host "Prompts ejecutados: $Count de $($prompts.Count) disponibles" -ForegroundColor Cyan
