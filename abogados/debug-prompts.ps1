$content = Get-Content 'E:\derecho\abogados\prompts-todos.txt' -Raw
Write-Host "Content length:" $content.Length
$blocks = $content -split '(?:\r?\n){2,}'
Write-Host "Blocks found:" $blocks.Count
if ($blocks.Count -gt 0) {
    Write-Host "First block preview:"
    Write-Host $blocks[0].Substring(0, [Math]::Min(200, $blocks[0].Length))
}
