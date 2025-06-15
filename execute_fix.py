import os
import requests
from dotenv import load_dotenv

load_dotenv()

url = os.environ.get("VITE_SUPABASE_URL")
access_token = os.environ.get("SUPABASE_ACCESS_TOKEN")
project_ref = url.split('//')[1].split('.')[0]

api_url = f"https://api.supabase.com/v1/projects/{project_ref}/database/query"

headers = {
    "Authorization": f"Bearer {access_token}",
    "Content-Type": "application/json"
}

# Read SQL file
with open('fix_signup_trigger.sql', 'r') as f:
    sql_query = f.read()

print("=== Fixing signup trigger ===")

data = {
    "query": sql_query
}

try:
    response = requests.post(api_url, headers=headers, json=data)
    
    if response.status_code in [200, 201]:
        print("✓ Trigger fixed successfully!")
        print("✓ Signup should work now")
    else:
        print(f"Error: Status code {response.status_code}")
        print(f"Response: {response.text}")
        
except Exception as e:
    print(f"Request error: {e}")