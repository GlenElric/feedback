"""
Quick test script using httpx to test the API
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

print("=" * 70)
print("🚀 FEEDBACK COLLECTION PLATFORM - API TESTS")
print("=" * 70)
print()

# Test data
test_user = {
    "email": "livetest@example.com",
    "password": "testpass123",
    "full_name": "Live Test User"
}

print("📝 Test 1: Health Check")
print("-" * 70)
try:
    response = client.get("/health")
    if response.status_code == 200:
        print(f"✅ Status: {response.status_code}")
        print(f"✅ Response: {response.json()}")
    else:
        print(f"❌ Unexpected status: {response.status_code}")
except Exception as e:
    print(f"❌ Error: {e}")
print()

print("📝 Test 2: User Registration")
print("-" * 70)
try:
    response = client.post("/api/auth/register", json=test_user)
    if response.status_code == 201:
        data = response.json()
        print(f"✅ User registered successfully!")
        print(f"   User ID: {data.get('user_id')}")
        print(f"   Email: {data.get('email')}")
        print(f"   Name: {data.get('full_name')}")
        print(f"   Role: {data.get('role')}")
    elif response.status_code == 400:
        print(f"✅ User already exists (expected on retry)")
        print(f"   Message: {response.json()}")
    else:
        print(f"❌ Status: {response.status_code}")
        print(f"   Response: {response.json()}")
except Exception as e:
    print(f"❌ Error: {e}")
print()

print("📝 Test 3: User Login")
print("-" * 70)
login_data = {"email": test_user["email"], "password": test_user["password"]}
try:
    response = client.post("/api/auth/login", json=login_data)
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Login successful!")
        print(f"   Token Type: {data.get('token_type')}")
        print(f"   Access Token: {data.get('access_token')[:30]}...")
        print(f"   User Email: {data.get('user', {}).get('email')}")
        access_token = data.get('access_token')
    else:
        print(f"❌ Status: {response.status_code}")
        print(f"   Response: {response.json()}")
        access_token = None
except Exception as e:
    print(f"❌ Error: {e}")
    access_token = None
print()

if access_token:
    print("📝 Test 4: Get User Profile (Protected Endpoint)")
    print("-" * 70)
    try:
        headers = {"Authorization": f"Bearer {access_token}"}
        response = client.get("/api/auth/me", headers=headers)
        if response.status_code == 200:
            profile = response.json()
            print(f"✅ Profile retrieved successfully!")
            print(f"   User ID: {profile.get('user_id')}")
            print(f"   Email: {profile.get('email')}")
            print(f"   Full Name: {profile.get('full_name')}")
            print(f"   Role: {profile.get('role')}")
        else:
            print(f"❌ Status: {response.status_code}")
            print(f"   Response: {response.json()}")
    except Exception as e:
        print(f"❌ Error: {e}")
    print()

print("📝 Test 5: Invalid Login (Wrong Password)")
print("-" * 70)
invalid_login = {"email": test_user["email"], "password": "wrongpassword"}
try:
    response = client.post("/api/auth/login", json=invalid_login)
    if response.status_code == 401:
        print(f"✅ Correctly rejected invalid credentials!")
        print(f"   Status: {response.status_code}")
    else:
        print(f"❌ Unexpected status: {response.status_code}")
except Exception as e:
    print(f"❌ Error: {e}")
print()

print("=" * 70)
print("✅ ALL API TESTS COMPLETED!")
print("=" * 70)
print()
print("📌 NEXT STEPS:")
print("   1. Open http://localhost:5173 in your browser")
print("   2. Test the registration form")
print("   3. Test login with your credentials")
print("   4. Verify dashboard access")
print()
