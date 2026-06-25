import uuid
from datetime import datetime
from fastapi import APIRouter
from db import get_conn

router = APIRouter()

@router.get("/threads")
def list_threads():
    conn = get_conn()
    rows = conn.execute("SELECT id, title, created_at FROM threads ORDER BY created_at DESC").fetchall()
    conn.close()
    return [dict(r) for r in rows]

@router.post("/threads")
def create_thread():
    tid = str(uuid.uuid4())
    conn = get_conn()
    conn.execute("INSERT INTO threads VALUES (?, ?, ?)", (tid, "Chat mới", datetime.now().isoformat()))
    conn.commit()
    conn.close()
    return {"id": tid, "title": "Chat mới"}

@router.delete("/threads/{thread_id}")
def delete_thread(thread_id: str):
    conn = get_conn()
    conn.execute("DELETE FROM messages WHERE thread_id=?", (thread_id,))
    conn.execute("DELETE FROM threads WHERE id=?", (thread_id,))
    conn.commit()
    conn.close()
    return {"ok": True}

@router.get("/threads/{thread_id}/messages")
def get_messages(thread_id: str):
    conn = get_conn()
    rows = conn.execute(
        "SELECT role, content FROM messages WHERE thread_id=? ORDER BY id",
        (thread_id,)
    ).fetchall()
    conn.close()
    return [dict(r) for r in rows]