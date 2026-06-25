import os
import sqlite3

PERSIST_DIR = "/data" if os.path.exists("/data") else "data_persist"
os.makedirs(PERSIST_DIR, exist_ok=True)
DB_PATH = f"{PERSIST_DIR}/chat.db"

def get_conn():
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_conn()
    conn.execute("CREATE TABLE IF NOT EXISTS threads (id TEXT PRIMARY KEY, title TEXT, created_at TEXT)")
    conn.execute("""CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        thread_id TEXT, role TEXT, content TEXT, created_at TEXT)""")
    conn.commit()
    conn.close()