from datetime import datetime
from fastapi import APIRouter
from langchain_core.messages import HumanMessage

from db import get_conn
from state import pipeline

router = APIRouter()

@router.post("/threads/{thread_id}/chat")
async def chat(thread_id: str, body: dict):
    user_message = body.get("message", "")

    conn = get_conn()
    conn.execute(
        "INSERT INTO messages (thread_id, role, content, created_at) VALUES (?, ?, ?, ?)",
        (thread_id, "user", user_message, datetime.now().isoformat())
    )
    conn.commit()
    conn.close()

    result = pipeline["app"].invoke({
        "is_followup": True,
        "messages": [HumanMessage(content=user_message)],
        "image_bytes": b"",
    },
        config={"configurable": {"thread_id": thread_id}}
    )

    reply = result.get("reply", "")

    conn = get_conn()
    conn.execute(
        "INSERT INTO messages (thread_id, role, content, created_at) VALUES (?, ?, ?, ?)",
        (thread_id, "assistant", reply, datetime.now().isoformat())
    )
    conn.commit()
    conn.close()

    return {"reply": reply}