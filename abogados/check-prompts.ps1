$content = Get-Content 'E:\derecho\abogados\prompts-todos.txt' -Raw
$lines = $content -split '\r?\n'
$inPrompt = $false
$prompts = @()
$currentPrompt = ""

for ($i = 0; $i -lt $lines.Count; $i++) {
    $line = $lines[$i]
    
    if ($line -match '^#{5,}\s*#') {
        if ($currentPrompt.Length -gt 30) {
            $prompts += $currentPrompt
        }
        $currentPrompt = ""
        $inPrompt = $false
    }
    elseif ($line.Trim().StartsWith('Siguiendo')) {
        if ($currentPrompt.Length -gt 30) {
            $prompts += $currentPrompt
        }
        $currentPrompt = $line
        $inPrompt = $true
    }
    elseif ($inPrompt) {
        $currentPrompt += "`n" + $line
    }
}

if ($currentPrompt.Length -gt 30) {
    $prompts += $currentPrompt
}

Write-Host "Total prompts found:" $prompts.Count
for ($i = 0; $i -lt [Math]::Min(6, $prompts.Count); $i++) {
    Write-Host "=== Prompt $i ==="
    Write-Host $prompts[$i].Substring(0, [Math]::Min(120, $prompts[$i].Length))
    Write-Host ""
}
