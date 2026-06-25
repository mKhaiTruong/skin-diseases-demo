from pathlib import Path
from typing import TypedDict, Optional
from dotenv import load_dotenv
load_dotenv()

from langgraph.checkpoint.sqlite.aio import AsyncSqliteSaver
import sqlite3

_checkpointer = None

from agent import AgentState
from agent.nodes.rag_node import RagNode
from agent.nodes.recommendation_node import RecommendNode
from agent.nodes.followup_node import FollowupNode
from agent.graph import build_chat_graph
from agent import RagConfig
from vision_node import VisionONNXNode
from helpers.assets import download_assets

import os
PERSIST_DIR = "/data" if os.path.exists("/data") else "data_persist"

def get_checkpointer():
    global _checkpointer
    if _checkpointer is None:
        conn = sqlite3.connect(f"{PERSIST_DIR}/langgraph.db", check_same_thread=False)
        _checkpointer = AsyncSqliteSaver(conn)
    return _checkpointer


def build_pipeline():
    onnx_path, chroma_dir = download_assets()

    vision_node = VisionONNXNode(onnx_path=str(onnx_path))
    rag_node = RagNode(config=RagConfig(
        pdf_path=Path("data/DaLieu.pdf"),
        chroma_dir=chroma_dir,
        embedding_model="gemini-embedding-001",
        chunk_size=1000,
        chunk_overlap=200,
        top_k=3,
    ))
    recommend_node = RecommendNode()
    followup_node  = FollowupNode()

    return build_chat_graph(vision_node, rag_node, recommend_node, followup_node)