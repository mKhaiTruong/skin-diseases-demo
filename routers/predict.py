import uuid, base64
from datetime import datetime
from fastapi import APIRouter, UploadFile, File
from fastapi.responses import StreamingResponse
from langchain_core.messages import HumanMessage
from langchain_core.messages import AIMessage
import asyncio, json

from db import get_conn
from pipeline import get_checkpointer
from state import pipeline

router = APIRouter()

@router.post("/threads/{thread_id}/predict/stream")
async def predict_stream(thread_id: str, file: UploadFile = File(...)):
    image_bytes = await file.read()

    b64 = base64.b64encode(image_bytes).decode()
    conn = get_conn()
    conn.execute(
        "INSERT INTO messages (thread_id, role, content, created_at) VALUES (?, ?, ?, ?)",
        (thread_id, "user", f"__IMAGE__:{b64}", datetime.now().isoformat())
    )
    conn.commit()
    conn.close()
    
    async def event_generator():
        result = pipeline["app"].invoke(
            {
                "is_followup": False,
                "image_bytes": image_bytes,
                "messages": [],
            },
            config={"configurable": {"thread_id": thread_id}}
        )

        disease        = result["disease"]
        confidence     = result["confidence"]
        recommendation = result["recommendation"]
        
        pipeline["app"].invoke(
            {
                "is_followup": True,
                "messages": [AIMessage(content=f"Chẩn đoán lần {datetime.now().strftime('%H:%M')}: {disease} (độ tin cậy: {confidence*100:.1f}%)")],
                "image_bytes": b"",
            },
            config={"configurable": {"thread_id": thread_id}}
        )
        
        lines = [
        f"**Kết quả: {disease}** (độ tin cậy: {confidence*100:.1f}%)",
        "",
        "**Khuyến nghị:**",
        *[f"- {r}" for r in recommendation["recommendations"]],
        "",
        "**Bước tiếp theo:**",
        *[f"- {s}" for s in recommendation["next_steps"]],
        "",
        "**Mẹo chăm sóc:**",
        *[f"- {t}" for t in recommendation["tips"]],
        ]
        response_text = "\n".join(lines)

        for line in lines:
            yield f"data: {json.dumps({'text': line})}\n\n"
            await asyncio.sleep(0.06)

        conn2 = get_conn()
        conn2.execute(
            "INSERT INTO messages (thread_id, role, content, created_at) VALUES (?, ?, ?, ?)",
            (thread_id, "assistant", response_text, datetime.now().isoformat())
        )
        conn2.execute("UPDATE threads SET title=? WHERE id=?", (disease, thread_id))
        conn2.commit()
        conn2.close()

        yield f"data: {json.dumps({'done': True, 'disease': disease, 'confidence': confidence})}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )