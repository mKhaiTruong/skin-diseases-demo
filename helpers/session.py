import uuid
import streamlit as st
from helpers.database import create_thread, get_threads

def init_session(conn):
    threads = get_threads(conn)
    if "thread_id" not in st.session_state:
        if threads:
            st.session_state["thread_id"] = threads[0][0]
        else:
            _new_thread(conn)

def new_thread(conn):
    _new_thread(conn)
    st.rerun()

def _new_thread(conn):
    tid = str(uuid.uuid4())
    create_thread(conn, tid)
    st.session_state["thread_id"] = tid