# NexusRAG — Document Intelligence Platform

A complete RAG project built with:

- Python
- FastAPI
- Groq API
- FastEmbed
- NumPy cosine similarity
- PyPDF
- HTML/CSS/JavaScript

## Features

- Upload PDF, TXT and Markdown files
- Local document chunking
- Local vector embeddings
- Persistent local vector index
- Semantic retrieval
- Groq-powered grounded answers
- Source/chunk citations
- Document management
- Responsive premium UI
- Health endpoint and FastAPI docs

## 1. Create virtual environment

Windows PowerShell:

```powershell
py -3.12 -m venv venv
.\venv\Scripts\Activate.ps1
```

If PowerShell blocks activation:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\venv\Scripts\Activate.ps1
```

## 2. Install packages

```powershell
python -m pip install --upgrade pip
pip install -r requirements.txt
```

## 3. Configure Groq

Copy `.env.example` to `.env`:

```powershell
Copy-Item .env.example .env
```

Open `.env` and put your own key:

```env
GROQ_API_KEY=your_real_key
```

## 4. Run

```powershell
uvicorn main:app --reload
```

Open:

http://127.0.0.1:8000

API docs:

http://127.0.0.1:8000/docs

## First run

The first document upload downloads/initializes the local embedding model. This can take a little longer than later uploads.

## Project structure

```text
DocuSCAN/
├── main.py
├── requirements.txt
├── .env.example
├── .gitignore
├── README.md
├── templates/
│   └── index.html
├── static/
│   ├── css/style.css
│   └── js/app.js
└── data/
    ├── uploads/
    └── index/
```

## RAG flow

Document
→ text extraction
→ chunking
→ embeddings
→ local vector index
→ similarity retrieval
→ relevant context
→ Groq LLM
→ grounded answer + sources
