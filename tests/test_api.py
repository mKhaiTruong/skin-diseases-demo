import pytest
from unittest.mock import MagicMock, patch
from fastapi.testclient import TestClient

# Mock pipeline
with patch("pipeline.build_pipeline", return_value=MagicMock()):
    from main import app

client = TestClient(app)

def test_health():
    res = client.get("/health")
    assert res.status_code == 200

def test_create_thread():
    res = client.post("/threads")
    assert res.status_code == 200
    assert "id" in res.json()

def test_list_threads():
    res = client.get("/threads")
    assert res.status_code == 200
    assert isinstance(res.json(), list)

def test_get_messages_empty():
    thread = client.post("/threads").json()
    res = client.get(f"/threads/{thread['id']}/messages")
    assert res.status_code == 200
    assert res.json() == []

def test_delete_thread():
    thread = client.post("/threads").json()
    res = client.delete(f"/threads/{thread['id']}")
    assert res.status_code == 200
    assert res.json() == {"ok": True}