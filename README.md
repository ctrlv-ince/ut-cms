# Directus CMS & Corporate Portal Platform

> A full-featured Headless CMS architecture inspired by **Directus Data Studio**, built with **FeathersJS 5.0 Core**, **Knex & SQLite 3 persistence (WAL mode)**, and an **Angular 19 + Tailwind CSS v3** frontend featuring both a Public Corporate Portal and an authentic Directus Administrative Studio.

---

## 🌟 Key Architecture & Stack

| Layer | Technology | Key Capabilities |
| :--- | :--- | :--- |
| **CMS Studio & UI** | Angular 19 + Tailwind CSS v3 | Directus-style interface, Data Studio tables, schema inspector, REST tester, dark mode, responsive layout |
| **Backend Framework** | FeathersJS 5.0 Core + Express | REST transport, Socket.io real-time pub/sub channels, service hooks, file upload engine |
| **Database** | SQLite 3 (`cms.sqlite`) | WAL mode, relational schema, Knex query builder & migrations, auto-seeder |
| **Public Showcase** | Angular Standalone Components | Live corporate website consuming Articles, Services, Team, and Inquiries from Feathers API |

---

## 🚀 Quick Start Guide

### 1. Run Everything Concurrently (Recommended)
From the root directory:
```bash
npm run dev
# or
npm start
```
This automatically boots:
- **Backend (Feathers Core + SQLite)** on [`http://localhost:3030`](http://localhost:3030)
- **Frontend (Angular + Tailwind CSS)** on [`http://localhost:4200`](http://localhost:4200)

---

### 2. Run Independently

#### Backend
```bash
cd backend
npm start
```
- REST Endpoints: `http://localhost:3030/api/articles`, `/api/services`, `/api/inquiries`, etc.
- SQLite Database: `backend/data/cms.sqlite`
- Uploaded Files: `backend/public/uploads`

#### Frontend
```bash
cd frontend
npm start
# or npm run build for production bundle
```
- Open browser at `http://localhost:4200`

---

## 🧭 Application Modules & Capabilities

### 🌐 1. Public Enterprise Corporate Portal
- **Hero & Identity**: Real-time headline, subtitle, and brand identity loaded from SQLite singleton `settings`.
- **Practice Areas / Services**: Enterprise service offerings with interactive modal for deep architectural scope.
- **Thought Leadership & Articles**: Filterable by category (Technology, Architecture, Security, Cloud) with search bar and full **Article Reader Modal**.
- **Executive Team**: Leadership profiles with role, department badge, bio, email, and social links.
- **Interactive Contact & RFP Form**: Directly writes incoming client inquiries into SQLite with urgency prioritization.
- **Instant Portal Switcher**: Floating bottom pill to toggle between the **Public Portal** and **Directus Studio**.

---

### ⚡ 2. Directus CMS Studio (Admin Portal)
- **Insights & Analytics**: Real-time KPI cards for articles, services, inquiries, and media; live system specs; and recent activity audit logs.
- **Content Collections**:
  - `Articles & Insights`: Full CRUD, status toggle (`published`, `draft`, `archived`), author and category assignments.
  - `Enterprise Services`: Practice management with feature capabilities tags and status controls.
  - `Executive Team`: Staff directory with roles, departments, and avatars.
  - `Contact Inquiries`: Lead management with priority badges, status review workflow (`new`, `in_review`, `contacted`, `resolved`), and internal notes.
- **File & Media Library**: Asset catalog with folder tags, file size calculation, direct file upload, and one-click URL clipboard copying.
- **Data Model (Schema Studio)**: Direct reflection over SQLite database tables, inspecting column names, SQL data types, nullability, and default values.
- **Feathers API Explorer**: Interactive REST endpoint tester displaying formatted JSON responses, cURL commands, and JavaScript `fetch()` snippets.
- **Global Settings Editor**: Manage corporate site name, contact numbers, emails, physical address, and hero messaging.

---

## 🔌 Feathers Core REST Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET / POST` | `/api/articles` | List or create corporate articles |
| `PATCH / DELETE` | `/api/articles/:id` | Update or delete an article |
| `GET / POST` | `/api/services` | List or create enterprise services |
| `GET / POST` | `/api/inquiries` | Submit or review customer inquiries |
| `GET / POST` | `/api/team` | Team directory management |
| `GET / POST` | `/api/media` | Media asset database |
| `POST` | `/api/upload` | Multipart file upload endpoint |
| `GET` | `/api/schema` | Dynamic SQLite schema introspection |
| `GET` | `/api/stats` | Real-time dashboard KPI metrics |
| `GET / PATCH` | `/api/settings/1` | Global brand configuration |
| `GET` | `/api/server-info` | System health check |
