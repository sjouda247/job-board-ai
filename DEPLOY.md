# Deploy Job Board AI to GitHub + Google Cloud Run

Follow these steps **in order** in a terminal (PowerShell or Command Prompt).

---

## Part 1: Push to GitHub

### 1.1 Open terminal in the project folder

```powershell
cd "C:\Users\jouda\Downloads\job-board-ai-main\job-board-ai-main"
```

### 1.2 Log in to GitHub (if not already)

- **Option A – GitHub CLI (recommended):**  
  Run `gh auth login` and follow the prompts (browser or token).
- **Option B – Git credential manager:**  
  On first `git push`, Windows may open a browser to log you in.

### 1.3 Commit and push

```powershell
git add -A
git status
git commit -m "fix bugs and add Cloud Run deployment"
git push origin main
```

If `git push` asks for username/password, use a **Personal Access Token** (GitHub → Settings → Developer settings → Personal access tokens), not your GitHub password.

---

## Part 2: Deploy to Google Cloud Run

### 2.1 Install Google Cloud SDK (if needed)

- Download: https://cloud.google.com/sdk/docs/install  
- Run the installer, then **close and reopen** your terminal.

### 2.2 Log in and set project

```powershell
gcloud auth login
gcloud config set project 680087253226
```

Use the same Google account that owns the Cloud Run project.

### 2.3 Enable required APIs (one-time)

```powershell
gcloud services enable run.googleapis.com cloudbuild.googleapis.com
```

### 2.4 Build the Docker image (from project root)

```powershell
cd "C:\Users\jouda\Downloads\job-board-ai-main\job-board-ai-main"
gcloud builds submit --tag gcr.io/680087253226/job-board-ai .
```

Wait until you see "SUCCESS".

### 2.5 Deploy to Cloud Run

**Replace `YOUR_GEMINI_API_KEY`** with your real key from https://aistudio.google.com/apikey  

Run this as **one block** (copy all lines):

```powershell
gcloud run deploy job-board-ai `
  --image gcr.io/680087253226/job-board-ai `
  --platform managed `
  --region us-central1 `
  --allow-unauthenticated `
  --memory 512Mi `
  --set-env-vars "NODE_ENV=production,JWT_SECRET=change-this-to-a-long-random-string,GEMINI_API_KEY=YOUR_GEMINI_API_KEY,GEMINI_MODEL=gemini-1.5-flash,DATABASE_PATH=/tmp/database.sqlite,UPLOAD_DIR=/tmp/uploads"
```

Or **without Gemini** (AI features will be disabled):

```powershell
gcloud run deploy job-board-ai `
  --image gcr.io/680087253226/job-board-ai `
  --platform managed `
  --region us-central1 `
  --allow-unauthenticated `
  --memory 512Mi `
  --set-env-vars "NODE_ENV=production,JWT_SECRET=change-this-to-a-long-random-string,GEMINI_MODEL=gemini-1.5-flash,DATABASE_PATH=/tmp/database.sqlite,UPLOAD_DIR=/tmp/uploads"
```

At the end you’ll see a line like:

```
Service [job-board-ai] URL: https://job-board-ai-680087253226.us-central1.run.app
```

### 2.6 Test the live app

- Open the URL in your browser (homepage + jobs).
- Health: `https://job-board-ai-680087253226.us-central1.run.app/health`
- HR login: **hr@jobboard.com** / **12345678**

---

## Troubleshooting

| Problem | What to do |
|--------|------------|
| `git push` "credentials" or 403 | Use `gh auth login` or a Personal Access Token instead of password. |
| `gcloud: command not found` | Install Cloud SDK and restart the terminal. |
| `Permission denied` on Cloud Build | In Google Cloud Console → IAM, make sure your user has "Cloud Build Editor" and "Cloud Run Admin". |
| 404 on the live URL | In Cloud Run → Logs, check for container errors. Redeploy after fixing. |
| Gemini test returns 500 | Set `GEMINI_API_KEY` in Cloud Run (Edit & deploy new revision → Variables). |
