import streamlit as st
from helpers.database import get_threads, delete_thread
from helpers.session import new_thread

def render_sidebar(conn):
    st.sidebar.title("🩺 Lịch sử chat")

    if st.sidebar.button("➕ Chat mới"):
        new_thread(conn)

    for tid, title in get_threads(conn):
        col1, col2 = st.sidebar.columns([4, 1])
        with col1:
            if st.button(title, key=f"select_{tid}"):
                st.session_state["thread_id"] = tid
                st.rerun()
        with col2:
            if st.button("🗑", key=f"delete_{tid}"):
                delete_thread(conn, tid)
                # Nếu xóa thread đang xem thì reset
                if st.session_state.get("thread_id") == tid:
                    threads = get_threads(conn)
                    st.session_state["thread_id"] = threads[0][0] if threads else None
                st.rerun()