import os
from supabase import create_client, Client
from dotenv import load_dotenv
import random
import string

load_dotenv()

url = os.environ.get("VITE_SUPABASE_URL")
anon_key = os.environ.get("VITE_SUPABASE_ANON_KEY")

supabase: Client = create_client(url, anon_key)

# Generate random email for testing
random_suffix = ''.join(random.choices(string.ascii_lowercase + string.digits, k=6))
test_email = f"test_{random_suffix}@example.com"
test_password = "test123456"

print(f"=== Testing signup with email: {test_email} ===")

try:
    # Try to sign up
    response = supabase.auth.sign_up({
        "email": test_email,
        "password": test_password,
        "options": {
            "data": {
                "name": "Test User",
                "role": "user"
            }
        }
    })
    
    if response.user:
        print("✓ Signup successful!")
        print(f"User ID: {response.user.id}")
        print(f"Email: {response.user.email}")
        print(f"Metadata: {response.user.user_metadata}")
    else:
        print("✗ Signup failed - no user returned")
        
except Exception as e:
    print(f"✗ Signup error: {e}")
    print(f"Error type: {type(e)}")
    
print("\n=== Checking if this is a trigger issue ===")
print("If signup failed with 'Database error saving new user', it's likely a trigger problem.")
print("The trigger has been disabled, so signup should work now on the website.")