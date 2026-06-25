import time
import base64
import streamlit as st
from dotenv import load_dotenv
load_dotenv()

from helpers.database import init_db, save_message, get_messages
from helpers.session import init_session
from components.sidebar import render_sidebar
from pipeline import build_pipeline

st.set_page_config(page_title="Chẩn đoán da liễu AI", page_icon="🩺")

conn = init_db()
init_session(conn)
render_sidebar(conn)

@st.cache_resource
def get_pipeline():
    return build_pipeline()

app = get_pipeline()
thread_id = st.session_state["thread_id"]

st.title("Chẩn đoán bệnh da liễu bằng AI")
st.caption("⚠️ Công cụ hỗ trợ tham khảo, không thay thế chẩn đoán của bác sĩ chuyên khoa.")

def render_message(role, content):
    avatar = "🧑" if role == "user" else "🩺"
    with st.chat_message(role, avatar=avatar):
        if content.startswith("__IMAGE__:"):
            b64 = content[len("__IMAGE__:"):]
            img_bytes = base64.b64decode(b64)
            st.image(img_bytes, width=200)
        else:
            st.markdown(content)

for role, content in get_messages(conn, thread_id):
    render_message(role, content)

uploaded_image = st.file_uploader(
    "Tải ảnh vùng da cần kiểm tra",
    type=["jpg", "jpeg", "png"],
    key=f"uploader_{st.session_state.get('uploader_key', 0)}",
)

if uploaded_image and st.button("Phân tích"):
    image_bytes = uploaded_image.getvalue()
    b64 = base64.b64encode(image_bytes).decode()

    # Lưu ảnh vào DB dưới dạng base64
    save_message(conn, thread_id, "user", f"__IMAGE__:{b64}")
    st.chat_message("user", avatar="🧑").image(image_bytes, width=200)

    with st.spinner("Đang phân tích ảnh..."):
        result = app.invoke({"image_bytes": image_bytes})

    disease    = result["disease"]
    confidence = result["confidence"]
    rec        = result["recommendation"]

    lines = [
        f"**Kết quả: {disease}** (độ tin cậy: {confidence*100:.1f}%)",
        "",
        "**Khuyến nghị:**",
        *[f"- {r}" for r in rec["recommendations"]],
        "",
        "**Bước tiếp theo:**",
        *[f"- {s}" for s in rec["next_steps"]],
        "",
        "**Mẹo chăm sóc:**",
        *[f"- {t}" for t in rec["tips"]],
    ]
    response_text = "\n".join(lines)

    with st.chat_message("assistant", avatar="🩺"):
        placeholder = st.empty()
        displayed = ""
        for line in lines:
            displayed += line + "\n"
            placeholder.markdown(displayed)
            time.sleep(0.06)

    save_message(conn, thread_id, "assistant", response_text)
    st.session_state["uploader_key"] = st.session_state.get("uploader_key", 0) + 1
    st.rerun()