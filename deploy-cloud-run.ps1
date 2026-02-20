# Deploy Job Board AI to Google Cloud Run
# Run from project root. First run: gcloud auth login
# Then: gcloud config set project YOUR_PROJECT_ID  (or project number is OK - script resolves it)

$ErrorActionPreference = "Stop"
$ProjectRaw = (gcloud config get-value project 2>$null)
if (-not $ProjectRaw) {
    Write-Host "Run: gcloud auth login" -ForegroundColor Yellow
    Write-Host "Then: gcloud config set project YOUR_PROJECT_ID" -ForegroundColor Yellow
    exit 1
}
# If config is set to project number (all digits), resolve to project ID (required by Cloud Build)
if ($ProjectRaw -match '^\d+$') {
    $ProjectId = (gcloud projects describe $ProjectRaw --format="value(projectId)" 2>$null)
    if (-not $ProjectId) {
        Write-Host "Could not resolve project number to ID. Run: gcloud config set project YOUR_PROJECT_ID" -ForegroundColor Yellow
        Write-Host "Find your Project ID: gcloud projects list" -ForegroundColor Yellow
        exit 1
    }
    Write-Host "Using project ID: $ProjectId" -ForegroundColor Gray
} else {
    $ProjectId = $ProjectRaw
}
$Image = "gcr.io/$ProjectId/job-board-ai"
$Service = "job-board-ai"
$Region = "us-central1"

Write-Host "`n=== Step 1: Building Docker image with Google Cloud Build ===" -ForegroundColor Cyan
Set-Location $PSScriptRoot
gcloud builds submit --project $ProjectId --tag $Image .

if ($LASTEXITCODE -ne 0) {
    Write-Host "Build failed. Fix errors above and run this script again." -ForegroundColor Red
    exit 1
}

Write-Host "`n=== Step 2: Deploying to Cloud Run ===" -ForegroundColor Cyan
# Set YOUR Gemini API key here, or leave empty to deploy without AI (you can add it later in Cloud Console)
$GeminiKey = if ($env:GEMINI_API_KEY) { $env:GEMINI_API_KEY } else { "your-gemini-api-key" }

gcloud run deploy $Service `
  --project $ProjectId `
  --image $Image `
  --platform managed `
  --region $Region `
  --allow-unauthenticated `
  --memory 512Mi `
  --set-env-vars "NODE_ENV=production,JWT_SECRET=job-board-demo-secret-change-in-production,GEMINI_API_KEY=$GeminiKey,GEMINI_MODEL=gemini-1.5-flash,DATABASE_PATH=/tmp/database.sqlite,UPLOAD_DIR=/tmp/uploads"

if ($LASTEXITCODE -ne 0) {
    Write-Host "Deploy failed. Check errors above." -ForegroundColor Red
    exit 1
}

Write-Host "`n=== Done ===" -ForegroundColor Green
Write-Host "Open the URL shown above in your browser. HR login: hr@jobboard.com / 12345678"
Write-Host "To set GEMINI_API_KEY later: Cloud Run -> job-board-ai -> Edit -> Variables"
