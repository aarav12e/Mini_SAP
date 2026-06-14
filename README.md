# Mini SAP ERP System 

A full Mini SAP ERP built with **MongoDB + Express + React + Node.js**, styled faithfully after **SAP GUI 7** — classic blue header, grey body, compact tables, T-code navigation and all.

## Modules
- **HR** — PA30, PA40, PA61, PC00 (Employee Master, Leave, Payroll)
- **Finance (FI)** — FB01, FB50, FBL1N (GL Posting, Ledgers)
- **Inventory (MM)** — MM01, MB52, MB1A, MB1C, MIGO
- **Sales (SD)** — VA01, VA02, VA03, VF01, VL01N
- **Customers / Vendors** — XD01, XK01
- **Reporting** — S_ALR_87, MC.1 (P&L, Sales Analysis)

## ABAP Workbench T-codes
| T-code | Screen |
|--------|--------|
| SE11 | ABAP Dictionary — create tables, data elements |
| SE16N | Table Data Browser |
| SE38 | ABAP Editor — write & execute programs |
| SE80 | Object Navigator |
| SE37 | Function Module Builder |
| SE91 | Message Class Maintenance |
| SM37 | Background Job Monitor |
| SM50 | Work Process Overview |
| ST22 | ABAP Runtime Error (Dump) Analysis |
| SU01 | User Maintenance |

## Tech Stack
- **Frontend**: React 18 + Vite + React Router v6 (deployed on Vercel)
- **Backend**: Node.js + Express.js (deployed on Render)
- **Database**: MongoDB Atlas (Mongoose ODM)
- **Auth**: JWT + Role-based access (ADMIN, HR, FINANCE, SALES, INVENTORY, VIEWER)

---

## Local Setup

### 1. Backend
```bash
cd backend
npm install
cp .env.example .env
# Fill in MONGO_URI and JWT_SECRET in .env
npm run dev
```

### 2. Frontend
```bash
cd frontend
npm install
cp .env.example .env
# Set VITE_API_URL=http://localhost:5000/api
npm run dev
```

### 3. Seed Admin User
After backend is running, hit this endpoint once:
```
POST http://localhost:5000/api/auth/seed
```
Or click the **"Seed Admin"** button on the login page.

**Default credentials:** `ADMIN / Admin@1234`

---

## Deployment

### Backend → Render.com
1. Push `backend/` to GitHub
2. Create a new **Web Service** on Render
3. Build command: `npm install`
4. Start command: `node server.js`
5. Add environment variables: `MONGO_URI`, `JWT_SECRET`, `CLIENT_URL` (your Vercel URL), `NODE_ENV=production`

### Frontend → Vercel
1. Push `frontend/` to GitHub
2. Import into Vercel
3. Framework: **Vite**
4. Add environment variable: `VITE_API_URL=https://your-render-url.onrender.com/api`

---

## Folder Structure

```
mini-sap-erp/
├── backend/
│   ├── config/         → MongoDB connection
│   ├── middleware/      → JWT auth middleware
│   ├── models/          → Mongoose schemas
│   ├── routes/          → Express API routes
│   ├── server.js        → Entry point
│   └── .env.example
│
└── frontend/
    └── src/
        ├── components/
        │   ├── layout/      → SideNav
        │   ├── modules/     → HR, Finance, Inventory, Sales, Report screens
        │   └── workbench/   → SE11, SE38, SE37, SE16N, SE91, SM37, SM50, ST22, SU01, SE80
        ├── context/         → AuthContext, ERPContext
        ├── pages/           → LoginPage, ERPShell
        └── utils/           → Axios API helper
```

## ABAP Practice Guide
1. Go to **SE11** — create a custom Z-table (e.g. `ZSTUDENTS`) with fields
2. Go to **SE16N** — browse and insert rows into your table
3. Go to **SE38** — write an ABAP report using `WRITE:` and `START-OF-SELECTION.`
4. Press **F8 (Execute)** to run and see output in the spool
5. If it crashes, **ST22** shows the dump with fix hints
6. Go to **SE37** — build a function module with IMPORTING/EXPORTING params
7. Go to **SM37** — schedule your program as a background job
8. Go to **SM50** — watch work processes in real time

---
Built by Aarav Kumar
Please Give it a Star
