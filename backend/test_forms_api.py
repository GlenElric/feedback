"""Full verification of the forms API"""
from fastapi.testclient import TestClient
from app.main import app

c = TestClient(app)

# 1. Login
r = c.post("/api/auth/login", json={"email": "testuser@example.com", "password": "TestPass123!"})
assert r.status_code == 200, f"Login failed: {r.status_code}"
tok = r.json()["access_token"]
h = {"Authorization": f"Bearer {tok}"}
print("1. Login: OK")

# 2. Get profile
r = c.get("/api/auth/me", headers=h)
assert r.status_code == 200, f"Profile failed: {r.status_code}"
print(f"2. Profile: {r.json()['email']}")

# 3. Create form
form_payload = {
    "title": "End-of-Semester Feedback",
    "description": "Help us improve the course!",
    "allow_anonymous": True,
    "questions": [
        {"question_text": "Rate the course overall", "question_type": "rating", "is_required": True, "order_index": 0},
        {"question_text": "What topic was most useful?", "question_type": "multiple_choice", "is_required": True,
         "options": ["Python", "Databases", "Web Dev", "Machine Learning"], "order_index": 1},
        {"question_text": "Additional comments?", "question_type": "text", "is_required": False, "order_index": 2},
    ],
}
r = c.post("/api/forms/", json=form_payload, headers=h)
assert r.status_code == 201, f"Create form failed: {r.status_code} {r.text}"
form = r.json()
print(f"3. Created form: id={form['form_id']}, title={form['title']}, questions={len(form['questions'])}")

# 4. List forms
r = c.get("/api/forms/", headers=h)
assert r.status_code == 200
forms = r.json()
print(f"4. List forms: {len(forms)} form(s)")

# 5. Get single form
r = c.get(f"/api/forms/{form['form_id']}", headers=h)
assert r.status_code == 200
print(f"5. Get form: {r.json()['title']} with {len(r.json()['questions'])} questions")

# 6. Update form
r = c.put(f"/api/forms/{form['form_id']}", json={"title": "Updated Feedback Form"}, headers=h)
assert r.status_code == 200
print(f"6. Updated form title to: {r.json()['title']}")

# 7. Delete form
r = c.delete(f"/api/forms/{form['form_id']}", headers=h)
assert r.status_code == 204
print("7. Deleted form: OK")

# 8. Verify deletion
r = c.get("/api/forms/", headers=h)
remaining = len(r.json())
print(f"8. Forms remaining after delete: {remaining}")

print("\nAll API tests passed!")
