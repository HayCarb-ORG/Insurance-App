# Insurance / SHE Management Desktop App

Desktop-ready internal application built with React + TypeScript + Vite + Tailwind CSS, FastAPI, and Electron.

## Stack

- Frontend: React, TypeScript, Vite, Tailwind CSS v4
- Backend: FastAPI + pandas + Excel files
- Desktop: Electron
- Data files: `data/Oracle.xlsx` and `data/SHE.xlsx`

## Project Structure

- `frontend/`: Glassmorphism UI pages and components
- `backend/`: FastAPI API, Excel services, and seed script
- `electron/`: Desktop shell bootstrap
- `data/`: Oracle and SHE Excel sources

## First-time Setup

1. Install frontend dependencies:

   ```powershell
   cd frontend
   npm install
   ```

2. Install Electron dependencies:

   ```powershell
   cd ../electron
   npm install
   ```

3. Install backend dependencies:

   ```powershell
   cd ../backend
   py -3.11 -m pip install -r requirements.txt
   ```

4. Seed dummy Excel data:

   ```powershell
   py -3.11 app/seed.py
   ```

5. Install root dev orchestrator dependencies:

   ```powershell
   cd ..
   npm install
   ```

## Run Full Desktop App (Dev)

```powershell
npm run dev
```

This starts:

- Frontend on `http://127.0.0.1:5173`
- FastAPI backend on `http://127.0.0.1:8000`
- Electron desktop window pointing to the frontend dev server

## API Endpoints

- `GET /api/auth/{email}`
- `GET /api/she/{nic}`
- `POST /api/she/dependant`
- `PUT /api/she/{id}`

## Demo Login Email

Use `john.doe@company.com` to test the initial flow.
