param(
    [Parameter(Position = 0)]
    [string]$PopPath,

    [switch]$CheckOnly
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

# Compatibilidade para quem ainda chama o extrator histórico por PowerShell.
# Toda a lógica vive em tools/extract_pop.py; este arquivo não contém fontes,
# contagens ou regras paralelas capazes de sobrescrever a cadeia canônica.
$RepositoryRoot = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path
$Extractor = Join-Path $RepositoryRoot 'tools\extract_pop.py'

if (-not (Test-Path -LiteralPath $Extractor -PathType Leaf)) {
    throw "Extrator canônico não localizado: $Extractor"
}

$Arguments = @($Extractor)
if (-not [string]::IsNullOrWhiteSpace($PopPath)) {
    $Arguments += $PopPath
}
if ($CheckOnly) {
    $Arguments += '--check-only'
}

& python @Arguments
if ($LASTEXITCODE -ne 0) {
    throw "A extração do POP falhou com código $LASTEXITCODE."
}
