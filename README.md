# 📄 DocuSCAN — Document Intelligence Platform

DocuSCAN is an AI-powered **Document Intelligence and RAG-based question-answering platform** that allows users to interact with document content using natural language.

The platform uses **FastAPI** for backend API development and **Google Gemini API** to generate contextual responses based on document content.

🔗 **Live Demo:** https://docuscan-fxga.onrender.com/

🔗 **GitHub:** https://github.com/Pranav-Masal/Document-Search-Project-with-RAG

---

## 🚀 Features

### 📄 Document Intelligence

- Process document content for intelligent search
- Extract and work with relevant document information
- Ask natural-language questions about document content
- Generate context-aware answers
- Reduce the need for manually searching large documents

### 🤖 AI-Powered Question Answering

- Powered by Google Gemini API
- Context-aware responses
- Natural-language interaction
- RAG-based document retrieval approach
- Relevant document context used for generating responses

### ⚡ Backend API

- Built with FastAPI
- REST API architecture
- Request validation
- Structured API responses
- Fast and lightweight backend

### 🌐 Web Interface

- Simple and responsive user interface
- Document-based question answering
- Interactive chat experience
- Clean and easy-to-use design

---

## 🛠️ Tech Stack

### Backend

- Python
- FastAPI
- REST APIs

### AI / LLM

- Google Gemini API
- Retrieval-Augmented Generation (RAG)
- LLM-based Question Answering

### Frontend

- HTML
- CSS
- JavaScript

### Deployment & Tools

- Render
- Git
- GitHub
- Environment Variables

---

## 🏗️ Architecture

```text
                    ┌─────────────────────┐
                    │       User          │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │    Web Interface    │
                    │    HTML/CSS/JS       │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │      FastAPI        │
                    │     REST API        │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │ Document Processing │
                    │   & Retrieval       │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │       Gemini        │
                    │      LLM API        │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │ Contextual Answer   │
                    └─────────────────────┘
