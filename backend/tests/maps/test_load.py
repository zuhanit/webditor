from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_map_load():
  response = client.get("/api/v1/maps/test_map")
  assert response.status_code == 200
  assert response.json() == {"message": "Map loaded successfully"}
