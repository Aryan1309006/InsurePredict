import unittest
from fastapi.testclient import TestClient
from app.main import app
from app.database.mongodb import get_users_col, get_predictions_col

class TestAuthAndMongoDB(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        # Clean up test users and their predictions
        users_col = get_users_col()
        preds_col = get_predictions_col()
        users_col.delete_many({"email": {"$in": ["testuser_a@example.com", "testuser_b@example.com"]}})

    def test_01_register_user_a(self):
        client = TestClient(app)
        resp = client.post("/api/auth/register", json={
            "name": "User Alpha",
            "email": "testuser_a@example.com",
            "password": "Password123!",
            "confirm_password": "Password123!"
        })
        self.assertEqual(resp.status_code, 201)
        data = resp.json()
        self.assertEqual(data["user"]["email"], "testuser_a@example.com")
        self.assertEqual(data["user"]["name"], "User Alpha")
        self.assertIn("insurepredict_session", resp.cookies)
        print("PASS: Test 1 - Register User A")

    def test_02_register_duplicate_email(self):
        client = TestClient(app)
        resp = client.post("/api/auth/register", json={
            "name": "User Alpha Duplicate",
            "email": "testuser_a@example.com",
            "password": "Password123!",
            "confirm_password": "Password123!"
        })
        self.assertEqual(resp.status_code, 400)
        self.assertIn("already registered", resp.json()["detail"].lower())
        print("PASS: Test 2 - Duplicate Email Rejected")

    def test_03_login_wrong_password(self):
        client = TestClient(app)
        resp = client.post("/api/auth/login", json={
            "email": "testuser_a@example.com",
            "password": "WrongPassword999"
        })
        self.assertEqual(resp.status_code, 401)
        self.assertIn("invalid email or password", resp.json()["detail"].lower())
        print("PASS: Test 3 - Wrong Password Rejected")

    def test_04_login_success_and_me(self):
        client = TestClient(app)
        resp = client.post("/api/auth/login", json={
            "email": "testuser_a@example.com",
            "password": "Password123!"
        })
        self.assertEqual(resp.status_code, 200)
        self.assertIn("insurepredict_session", resp.cookies)

        # Call /api/auth/me with the same client
        me_resp = client.get("/api/auth/me")
        self.assertEqual(me_resp.status_code, 200)
        self.assertEqual(me_resp.json()["email"], "testuser_a@example.com")
        print("PASS: Test 4 - Login and /api/auth/me")

    def test_05_predict_unauthenticated(self):
        client = TestClient(app)
        payload = {
            "age": 30,
            "sex": "male",
            "bmi": 25.0,
            "children": 1,
            "smoker": "no",
            "region": "southwest"
        }
        resp = client.post("/api/predict", json=payload)
        self.assertEqual(resp.status_code, 401)
        print("PASS: Test 5 - Unauthenticated Predict Rejected")

    def test_06_predict_authenticated_and_history_isolation(self):
        # 1. Login User A
        client_a = TestClient(app)
        login_a = client_a.post("/api/auth/login", json={
            "email": "testuser_a@example.com",
            "password": "Password123!"
        })
        self.assertEqual(login_a.status_code, 200)

        # 2. Make prediction for User A
        payload_a = {
            "age": 35,
            "sex": "male",
            "bmi": 27.5,
            "children": 2,
            "smoker": "no",
            "region": "northwest"
        }
        pred_a = client_a.post("/api/predict", json=payload_a)
        self.assertEqual(pred_a.status_code, 200)
        self.assertIn("predicted_cost", pred_a.json())

        # 3. Check User A history
        hist_a = client_a.get("/api/predictions")
        self.assertEqual(hist_a.status_code, 200)
        records_a = hist_a.json()["predictions"]
        self.assertGreaterEqual(len(records_a), 1)
        pred_a_id = records_a[0]["id"]

        # 4. Register and Login User B on separate client
        client_b = TestClient(app)
        reg_b = client_b.post("/api/auth/register", json={
            "name": "User Beta",
            "email": "testuser_b@example.com",
            "password": "Password456!",
            "confirm_password": "Password456!"
        })
        self.assertEqual(reg_b.status_code, 201)

        # 5. Check User B history - MUST NOT see User A's prediction!
        hist_b = client_b.get("/api/predictions")
        self.assertEqual(hist_b.status_code, 200)
        records_b = hist_b.json()["predictions"]
        b_ids = [r["id"] for r in records_b]
        self.assertNotIn(pred_a_id, b_ids)
        print("PASS: Test 6 - User B cannot see User A's prediction (History Isolation)")

        # 6. User B cannot delete User A's prediction
        del_attempt = client_b.delete(f"/api/predictions/{pred_a_id}")
        self.assertEqual(del_attempt.status_code, 404)
        print("PASS: Test 7 - User B cannot delete User A's prediction")

        # 7. User A CAN delete their own prediction
        del_success = client_a.delete(f"/api/predictions/{pred_a_id}")
        self.assertEqual(del_success.status_code, 200)
        print("PASS: Test 8 - User A successfully deleted their prediction")

    def test_07_logout(self):
        client = TestClient(app)
        client.post("/api/auth/login", json={
            "email": "testuser_a@example.com",
            "password": "Password123!"
        })
        logout_resp = client.post("/api/auth/logout")
        self.assertEqual(logout_resp.status_code, 200)
        
        # Subsequent me check without cookies should fail with 401
        client.cookies.clear()
        me_resp = client.get("/api/auth/me")
        self.assertEqual(me_resp.status_code, 401)
        print("PASS: Test 9 - Logout and unauthenticated check")


if __name__ == "__main__":
    unittest.main()
