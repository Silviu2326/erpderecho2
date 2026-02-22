# opencode-runner.ps1 - Ejecuta prompts de opencode secuencialmente
# Uso: .\opencode-runner.ps1 -File prompts.txt
#
# Formato del archivo de prompts (una línea vacía separa cada prompt):
# prompt 1
#
# prompt 2
#
# prompt 3

param(
    [Parameter(Mandatory=$true)]
    [string]$File
)

if (-not (Test-Path $File)) {
    Write-Host "Error: El archivo $File no existe" -ForegroundColor Red
    exit 1
}

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  OpenCode Prompt Runner" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Archivo: $File"
Write-Host "Fecha: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Leer el archivo y dividir por bloques vacíos
$content = Get-Content $File -Raw
$prompts = $content -split '(?:\r?\n){2,}' | Where-Object { $_.Trim() -ne '' }

$total = $prompts.Count
Write-Host "Total de prompts a ejecutar: $total" -ForegroundColor Yellow
Write-Host ""

for ($i = 0; $i -lt $total; $i++) {
    $index = $i + 1
    $prompt = $prompts[$i].Trim()
    
    Write-Host "----------------------------------------" -ForegroundColor Gray
    Write-Host "Prompt $index/$total" -ForegroundColor Yellow
    Write-Host "----------------------------------------" -ForegroundColor Gray
    Write-Host $prompt
    Write-Host ""
    
    # Ejecutar el prompt con opencode
    # Escribir el prompt a un archivo temporal
    $tempFile = [System.IO.Path]::GetTempFileName()
    Set-Content -Path $tempFile -Value $prompt
    
    # Ejecutar opencode con el prompt
    npx opencode run $tempFile
    
    # Limpiar
    Remove-Item $tempFile -Force
    
    Write-Host ""
    Write-Host "Prompt $index completado" -ForegroundColor Green
    Write-Host ""
}

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Todos los prompts completados" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Cyan
