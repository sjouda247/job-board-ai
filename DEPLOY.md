# Deploy Job Board AI to GitHub + Google Cloud Run

Follow these steps **in order** in a terminal (PowerShell or Command Prompt).

---

## Quick reference: what you need

| What | Where to get it |
|------|------------------|
| **Project ID** | Google Cloud Console → top bar project name, or `gcloud projects list` (use the **ID** column, not the number) |
| **GitHub** | Account + Personal Access Token (Settings → Developer settings → PAT) if push asks for password |
| **Gemini API key** | https://aistudio.google.com/apikey (optional; you can add it later in Cloud Run variables) |

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

You need your **Project ID** (a short name like `my-job-board`), not the project number.

- Find it: Google Cloud Console → top bar project dropdown, or run `gcloud projects list`.

```powershell
gcloud auth login
gcloud config set project YOUR_PROJECT_ID
```

Example: if your project ID is `my-job-board`, run `gcloud config set project my-job-board`.

### 2.3 Enable required APIs (one-time)

```powershell
gcloud services enable run.googleapis.com cloudbuild.googleapis.com
```

### 2.4 Build the Docker image (from project root)

**Use your Project ID** in the tag (same as in step 2.2):

```powershell
cd "C:\Users\jouda\Downloads\job-board-ai-main\job-board-ai-main"
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/job-board-ai .
```

Example: `gcloud builds submit --tag gcr.io/my-job-board/job-board-ai .`  
Wait until you see "SUCCESS".

### 2.5 Deploy to Cloud Run

**Replace `YOUR_GEMINI_API_KEY`** with your real key from https://aistudio.google.com/apikey  

Run this as **one block** (replace `YOUR_PROJECT_ID` with your Project ID):

```powershell
gcloud run deploy job-board-ai `
  --image gcr.io/YOUR_PROJECT_ID/job-board-ai `
  --platform managed `
  --region us-central1 `
  --allow-unauthenticated `
  --memory 512Mi `
  --set-env-vars "NODE_ENV=production,JWT_SECRET=change-this-to-a-long-random-string,GEMINI_API_KEY=YOUR_GEMINI_API_KEY,GEMINI_MODEL=gemini-1.5-flash,DATABASE_PATH=/tmp/database.sqlite,UPLOAD_DIR=/tmp/uploads"
```

Or **without Gemini** (AI features disabled until you add the key in Cloud Console):

```powershell
gcloud run deploy job-board-ai `
  --image gcr.io/YOUR_PROJECT_ID/job-board-ai `
  --platform managed `
  --region us-central1 `
  --allow-unauthenticated `
  --memory 512Mi `
  --set-env-vars "NODE_ENV=production,JWT_SECRET=change-this-to-a-long-random-string,GEMINI_MODEL=gemini-1.5-flash,DATABASE_PATH=/tmp/database.sqlite,UPLOAD_DIR=/tmp/uploads"
```

At the end you’ll see a line like:

```
Service [job-board-ai] URL: https://job-board-ai-XXXXX.us-central1.run.app
```

### 2.6 Test the live app

- Open the URL in your browser (homepage + jobs).
- Health: open your service URL and add `/health` (e.g. `https://job-board-ai-XXXXX.us-central1.run.app/health`)
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
