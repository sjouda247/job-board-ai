# Deploy Job Board AI to Google Cloud Run
# Run from project root. You must run "gcloud auth login" and "gcloud config set project 680087253226" first.

$ErrorActionPreference = "Stop"
$ProjectId = "680087253226"
$Image = "gcr.io/$ProjectId/job-board-ai"
$Service = "job-board-ai"
$Region = "us-central1"

Write-Host "`n=== Step 1: Building Docker image with Google Cloud Build ===" -ForegroundColor Cyan
Set-Location $PSScriptRoot
gcloud builds submit --tag $Image .

if ($LASTEXITCODE -ne 0) {
    Write-Host "Build failed. Fix errors above and run this script again." -ForegroundColor Red
    exit 1
}

Write-Host "`n=== Step 2: Deploying to Cloud Run ===" -ForegroundColor Cyan
# Set YOUR Gemini API key here, or leave empty to deploy without AI (you can add it later in Cloud Console)
$GeminiKey = if ($env:GEMINI_API_KEY) { $env:GEMINI_API_KEY } else { "your-gemini-api-key" }

gcloud run deploy $Service `
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
