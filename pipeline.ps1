#Requires -Version 5.1
<#
.SYNOPSIS
    AstroLife — Bootstrap, configure, and deploy script.
.DESCRIPTION
    Idempotent setup and deployment pipeline for AstroLife on Vercel.
    Run from the root of the repository.
#>

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Write-Step($msg) {
    Write-Host ""
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
    Write-Host "  $msg" -ForegroundColor Cyan
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
}

function Write-Success($msg) { Write-Host "  ✅ $msg" -ForegroundColor Green }
function Write-Info($msg)    { Write-Host "  ℹ️  $msg" -ForegroundColor Yellow }
function Write-Err($msg)     { Write-Host "  ❌ $msg" -ForegroundColor Red }

# ─── 1. Check Node.js ────────────────────────────────────────────────────────
Write-Step "Checking prerequisites"

try {
    $nodeVersion = node --version
    Write-Success "Node.js $nodeVersion found"
} catch {
    Write-Err "Node.js not found. Install from https://nodejs.org"
    exit 1
}

# Check minimum Node version (18+)
$nodeMajor = [int]($nodeVersion -replace 'v(\d+)\..*', '$1')
if ($nodeMajor -lt 18) {
    Write-Err "Node.js 18+ required. Found: $nodeVersion"
    exit 1
}

# Detect package manager
$pkgManager = "npm"
if (Get-Command pnpm -ErrorAction SilentlyContinue) {
    $pkgManager = "pnpm"
    Write-Success "pnpm detected"
} else {
    Write-Info "pnpm not found, using npm"
}

# ─── 2. Check .env.local ─────────────────────────────────────────────────────
Write-Step "Checking environment configuration"

if (-not (Test-Path ".env.local")) {
    Write-Info ".env.local not found — copying from .env.example"
    Copy-Item ".env.example" ".env.local"
    Write-Err "Please fill in .env.local before continuing."
    Write-Host ""
    Write-Host "  Required variables:" -ForegroundColor Yellow
    @(
        "DATABASE_URL",
        "NEXTAUTH_URL",
        "NEXTAUTH_SECRET",
        "GOOGLE_CLIENT_ID",
        "GOOGLE_CLIENT_SECRET",
        "STRIPE_SECRET_KEY",
        "STRIPE_WEBHOOK_SECRET",
        "STRIPE_PRICE_MONTHLY",
        "STRIPE_PRICE_YEARLY"
    ) | ForEach-Object { Write-Host "    - $_" -ForegroundColor Yellow }
    exit 1
} else {
    Write-Success ".env.local found"
}

# ─── 3. Install dependencies ─────────────────────────────────────────────────
Write-Step "Installing dependencies"

if ($pkgManager -eq "pnpm") {
    pnpm install
} else {
    npm install
}
Write-Success "Dependencies installed"

# ─── 4. Generate Prisma client ───────────────────────────────────────────────
Write-Step "Generating Prisma client"
npx prisma generate
Write-Success "Prisma client generated"

# ─── 5. Run database migrations ──────────────────────────────────────────────
Write-Step "Running database migrations"

$confirm = Read-Host "  Run 'prisma migrate deploy'? (y/N)"
if ($confirm -eq "y" -or $confirm -eq "Y") {
    npx prisma migrate deploy
    Write-Success "Migrations applied"
} else {
    Write-Info "Skipped database migrations"
}

# ─── 6. Seed database ────────────────────────────────────────────────────────
Write-Step "Seeding database"

$confirmSeed = Read-Host "  Run database seed? (y/N)"
if ($confirmSeed -eq "y" -or $confirmSeed -eq "Y") {
    npx prisma db seed
    Write-Success "Database seeded"
} else {
    Write-Info "Skipped database seed"
}

# ─── 7. Build application ────────────────────────────────────────────────────
Write-Step "Building application"

if ($pkgManager -eq "pnpm") {
    pnpm build
} else {
    npm run build
}
Write-Success "Build completed"

# ─── 8. Vercel deployment ────────────────────────────────────────────────────
Write-Step "Vercel deployment"

$vercelAvailable = Get-Command vercel -ErrorAction SilentlyContinue

if (-not $vercelAvailable) {
    Write-Info "Vercel CLI not found. Installing globally…"
    npm install -g vercel
}

Write-Info "Linking to Vercel project…"
vercel link

Write-Info "Pulling environment variables from Vercel…"
vercel env pull .env.local

$confirmDeploy = Read-Host "  Deploy to production? (y/N)"
if ($confirmDeploy -eq "y" -or $confirmDeploy -eq "Y") {
    vercel deploy --prod
    Write-Success "Deployed to production!"
} else {
    Write-Info "Skipped production deployment. Run 'vercel deploy --prod' when ready."
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
Write-Host "  ✨ AstroLife pipeline complete!" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
