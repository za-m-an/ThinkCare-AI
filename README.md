# 🏥 ThinkCare AI — Bilingual Clinical AI Companion

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=nextdotjs)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100.0-009688?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.0-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2C5282?style=for-the-badge&logo=prisma)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-336791?style=for-the-badge&logo=postgresql)](https://www.postgresql.org/)

ThinkCare AI is a bilingual (English & Bangla / বাংলা) clinical assistant system engineered specifically for healthcare delivery in Bangladesh. The platform combines advanced Small Language Models (SLMs), traditional machine learning classifiers, and a feature-rich Web portal to provide interactive triage, patient management, diagnostic forecasting, and custom automated medical report generation.

---

## 🏗️ System Architecture

```mermaid
graph TD
    User([User / Patient / Admin]) -->|HTTP / TSX| WebApp[Next.js Frontend & API Gateway]
    
    subgraph WebApp [Next.js Core Hub]
        RouteGuard[Middleware Auth & Session]
        PrismaORM[Prisma ORM & Postgres Database]
        LangManager[Bilingual Language Manager]
        DocsModule[Live /docs Access Gate]
    end

    subgraph ServingEngines [Clinical AI Serving Layer]
        SLMAPI[ThinkCare SLM FastAPI - Port 8002]
        CatBoostAPI[CatBoost Predictor FastAPI - Port 8001]
    end
    
    WebApp -->|Bilingual Chat Payload| SLMAPI
    WebApp -->|Symptom Differential Triage| CatBoostAPI
    
    SLMAPI -->|Fine-tuned Qwen 2.5 1.5B| QwenModel[Generative Clinical Dialogue]
    CatBoostAPI -->|CatBoost Classifier| CatBoostModel[31-Feature Disease & Severity Triage]
    
    PrismaORM -->|Reads/Writes| Postgres[(PostgreSQL DB)]
```

---

## ✨ Key Features

### 1. Bilingual Chat & State-of-the-Art Language Support (বাংলা & English)
- **i18n Infrastructure**: Full translation context manager persisting state across refreshes (`localStorage` synchronization).
- **Bangla Typography Rendering**: Custom **Noto Sans Bengali** fallback integration for pixel-perfect script rendering under the Bengali locale toggle.
- **Bilingual Prompts**: Seamless routing of inputs (with automatic Unicode detection for Bengali characters `[\u0980-\u09ff]`) into custom-tailored system prompts.

### 2. Dual-Mode Inference Engines
- **Mode 1 — CatBoost Triage Classifier**: Uses a lightweight 31-feature model (`medical_catboost_model.pkl`) to identify high-probability conditions, mapping outputs dynamically to a localized symptom/precaution registry.
- **Mode 2 — Direct SLM Chat**: Serves a fine-tuned `Qwen2.5-1.5B-Instruct` model directly to provide natural clinical conversation, explain diagnostic classifications, and suggest precautions in the patient's language.

### 3. Adaptive Mobile-First Splits
- **Responsive SSR Splits**: Handlers dynamically split rendering paths on compile/hydrate bounds using screen geometry hooks (`useDevice`).
- **User Layout**: Single-column interface with slide-out diagnostics tabs, bottom navigation bars, and touch-optimized form components.
- **Admin Layout**: Dynamic summary logs, quick preset switches, and scroll-friendly table rows.

### 4. Admin Users Portal & Report Generator
- **Patient Monitoring**: Search, filter, and detail view profiles of patient onboarding biometric records (height, weight, BP, SpO₂, step records).
- **Report Generation**: Automatically builds a comprehensive, download-ready Clinical Text Report summarizing biometrics, symptoms, prediction history, and custom notes.

### 5. Live Pitch Deck & Tech Docs Module (`/docs`)
- **Access Control & Scheduling**: Admins can program exact visibility dates/times or toggle public access instantly. Includes real-time UTC/BST timers.
- **Rich Interactive Viewer**: Gathers a YC-style Pitch Deck (business targets) and deep Technical Docs (architecture, security, API routing) into an interactive tabbed layout.
- **Telemetry & Exporter**: Displays live telemetry of application servers and allows judges to export the full technical content as a clean plain text file.

---

## 📁 Repository Directory Structure

```bash
ThinkCare-AI/
├── README.md                  # This primary documentation file
├── .gitignore                 # Root level ignore settings
├── ThinkCare_SLM/             # SLM Serving API Core
│   ├── ai_api.py              # FastAPI script running model generation on Port 8002
│   ├── chat_template.jinja    # Model-specific dialogue styling
│   ├── config.json            # Model parameters configuration
│   └── tokenizer.json         # Token mappings for Qwen 2.5
└── WEb_app/                   # Next.js Full Stack Portal
    ├── prisma/                # DB Schemas & Migration scripts
    ├── public/                # Static assets & Team avatars
    ├── src/
    │   ├── app/               # Next.js App Router (pages, APIs, layouts)
    │   ├── components/        # Reusable Tailwind UX parts
    │   ├── contexts/          # Language/Authentication Context Providers
    │   ├── hooks/             # SSR device detection hooks
    │   └── lib/               # Translations mapping dictionary
    └── tailwind.config.ts     # Interface theme definitions
```

---

## 🚀 Setting Up & Deploying

### 1. Database & Frontend Setup (Next.js)

Navigate into the `WEb_app` directory:
```bash
cd WEb_app
```

Configure your environment variables inside a `.env` file (see `.env.example` if present):
```env
DATABASE_URL="postgresql://username:password@localhost:5432/thinkcare_db"
NEXT_PUBLIC_SLM_API_URL="http://localhost:8002"
NEXT_PUBLIC_CATBOOST_API_URL="http://localhost:8001"
```

Install packages and push the Prisma database schema:
```bash
npm install
npx prisma db push
```

Start the Next.js development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the portal.

---

### 2. SLM Serving Backend Setup (Python)

Navigate into the `ThinkCare_SLM` directory:
```bash
cd ThinkCare_SLM
```

Configure a virtual environment, activate it, and install requirements:
```bash
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

pip install fastapi uvicorn torch transformers accelerate jinja2
```

Launch the model server on port `8002`:
```bash
python ai_api.py
```
> **Note**: On startup, the server automatically reads weights from `model.safetensors` and loads them onto CUDA (if available) or CPU.

---

## 🧪 Testing and Verification

To verify that both components are communicating correctly:

#### Check TypeScript & Compilation
```bash
cd WEb_app
npx tsc --noEmit
npm run build
```

#### Test Chat API endpoint via cURL:
**English Request**:
```bash
curl -X POST http://localhost:8002/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "I have fever and headache", "language": "en"}'
```

**Bangla Request**:
```bash
curl -X POST http://localhost:8002/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "আমার তীব্র জ্বর ও মাথাব্যথা", "language": "bn"}'
```

---

## 👥 Team & Development
- **Lead Developer**: Kamruzzaman ([@za-m-an](https://github.com/za-m-an))
- **Clinical AI Lead**: Irtisum
- **Full Stack / DevOps**: Taief
