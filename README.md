---
title: Skin Diseases Chatbot
emoji: 🩺
colorFrom: red
colorTo: yellow
sdk: docker
pinned: false
---

# 🩺 Skin Disease AI Chatbot

AI-powered dermatology assistant that analyzes skin condition images and provides medical recommendations.

**[Live Demo](https://huggingface.co/spaces/bill123mk/skin-diseases-chatbot)**

---

## 🏗️ Architecture

```
Image Upload → Vision Model (ONNX) → RAG Pipeline (ChromaDB) → LLM Recommendation
                                                                      ↕
                                                            Text Follow-up Chat
```

**Stack:**
- **Vision**: EfficientNet-B0 → ONNX (CPU inference)
- **RAG**: ChromaDB + Gemini Embeddings + Vietnamese medical PDF
- **Agent**: LangGraph + Claude Haiku
- **Backend**: FastAPI + SQLite
- **Frontend**: React + Ant Design
- **Deploy**: HuggingFace Spaces (Docker)

---

## 🚀 Quick Start

### Prerequisites
- Docker
- AWS credentials (for model/ChromaDB weights)
- API keys: Anthropic, Google (Gemini)

### 1. Clone repo
```bash
git clone https://github.com/mKhaiTruong/skin-diseases-demo
cd skin-diseases-demo
```

### 2. Setup environment
Create `.env` file:
```env
# AWS
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_DEFAULT_REGION=ap-southeast-1
S3_BUCKET=your_bucket
S3_MODEL_KEY=train/efficientnet/weights.onnx
S3_CHROMA_KEY=rag/chroma_db.zip

# API Keys
ANTHROPIC_API_KEY=your_key
GOOGLE_API_KEY=your_key
```

### 3. Run with Docker
```bash
# Build
docker build -t skin-disease .

# Run with persistent storage
docker run -p 7860:7860 \
  --env-file .env \
  -v $(pwd)/data_persist:/app/data_persist \
  skin-disease
```

Open `http://localhost:7860`

---

## 📁 Project Structure

```
skin-diseases-demo/
├── main.py              # FastAPI app
├── pipeline.py          # LangGraph pipeline
├── vision_node.py       # ONNX vision inference
├── routers/             # API endpoints
│   ├── threads.py
│   ├── predict.py
│   └── chat.py
├── helpers/
│   └── assets.py        # S3 download
├── frontend/dist/       # React build
└── tests/               # API tests
```

---

## 🔬 Model Performance

| Metric | Score |
|--------|-------|
| Macro F1 | ~0.75 |
| RAG Hit Rate | 60% |
| RAG Faithfulness | 0.80 |

> ⚠️ For reference only. Not a substitute for professional medical diagnosis.

---

## ⚙️ CI/CD

GitHub Actions pipeline:
1. **Test** — pytest API tests
2. **Build** — React frontend
3. **Deploy** — Auto push to HuggingFace Spaces

---

## 🗺️ Roadmap

- [ ] Finetune vision model
- [ ] HITL doctor review interface  
- [ ] Edge device (Raspberry Pi)
- [ ] MLOps monitoring (Evidently + Grafana)
- [ ] Self-healing agent (Prometheus + LangGraph)