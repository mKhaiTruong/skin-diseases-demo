import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from routers import threads, predict, chat
from db import init_db
from pipeline import build_pipeline

from state import pipeline

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    pipeline["app"] = build_pipeline()
    yield
    
app = FastAPI(title="Skin Disease API", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
    ],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(threads.router)
app.include_router(predict.router)
app.include_router(chat.router)

if os.path.exists("frontend/dist"):
    app.mount("/", StaticFiles(directory="frontend/dist", html=True), name="static")