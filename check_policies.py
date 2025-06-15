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

print("=== Testing Admin Permissions ===")
print("Note: Actual RLS policies can only be viewed in Supabase Dashboard")
print("This test will attempt various operations to infer the current policies\n")

# Test data
note_id = "0af3377b-6ca7-40a7-9c81-0ac582bd409b"
test_email = "sayberrygames@gmail.com"

# Check if we can read the note
print("1. Testing READ permission:")
try:
    response = supabase.table('dev_notes').select("*").eq('id', note_id).single().execute()
    print(f"   ✓ Can read: {response.data['title_ko']}")
    print(f"   Author: {response.data['author']}")
except Exception as e:
    print(f"   ✗ Cannot read: {e}")

# Test update with minimal change
print("\n2. Testing UPDATE permission:")
print(f"   Note: This is using anon key, not authenticated as {test_email}")
try:
    # Try to update view_count (minimal change)
    current_count = response.data.get('view_count', 0)
    update_response = supabase.table('dev_notes').update({
        'view_count': current_count + 1
    }).eq('id', note_id).execute()
    
    if update_response.data:
        print(f"   ✓ Can update: view_count changed")
        # Revert
        supabase.table('dev_notes').update({'view_count': current_count}).eq('id', note_id).execute()
    else:
        print(f"   ✗ Cannot update: No data returned (likely RLS blocked)")
except Exception as e:
    print(f"   ✗ Cannot update: {e}")

# Test delete
print("\n3. Testing DELETE permission:")
print("   Note: Not actually deleting to preserve data")
print("   Based on previous attempts, DELETE is blocked by RLS")

print("\n=== Recommendations ===")
print("1. Go to Supabase Dashboard > SQL Editor")
print("2. Run the fix_admin_delete_policy.sql script")
print("3. This will update RLS policies to allow admins to delete any post")
print("\nCurrent behavior suggests:")
print("- DELETE is restricted to post authors only")
print("- Admin role is not being checked in DELETE policy")
print("- This needs to be fixed in Supabase Dashboard")