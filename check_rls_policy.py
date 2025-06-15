import os
from supabase import create_client, Client
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize Supabase client
url = os.environ.get("VITE_SUPABASE_URL")
key = os.environ.get("VITE_SUPABASE_ANON_KEY")

if not url or not key:
    print("Error: Supabase credentials not found in environment variables")
    exit(1)

supabase: Client = create_client(url, key)

# Check team members
print("=== Checking Team Members ===")
try:
    response = supabase.table('team_members').select("*").execute()
    if response.data:
        for member in response.data:
            print(f"Email: {member.get('email')}, Name: {member.get('name')}, Role: {member.get('role')}")
    else:
        print("No team members found")
except Exception as e:
    print(f"Error fetching team members: {e}")

# Check the specific dev note
print("\n=== Checking Dev Note ===")
note_id = "0af3377b-6ca7-40a7-9c81-0ac582bd409b"
try:
    response = supabase.table('dev_notes').select("*").eq('id', note_id).single().execute()
    if response.data:
        print(f"Title: {response.data['title_ko']}")
        print(f"Author: {response.data['author']}")
        print(f"Created at: {response.data.get('created_at')}")
        print(f"Published: {response.data.get('published')}")
except Exception as e:
    print(f"Error fetching dev note: {e}")

# Check if sayberrygames@gmail.com is an admin
print("\n=== Checking Admin Status ===")
try:
    response = supabase.table('team_members').select("*").eq('email', 'sayberrygames@gmail.com').single().execute()
    if response.data:
        print(f"User found: {response.data}")
        print(f"Role: {response.data.get('role')}")
        print(f"Is admin: {response.data.get('role') == 'admin'}")
    else:
        print("User not found in team_members")
except Exception as e:
    print(f"Error checking admin status: {e}")