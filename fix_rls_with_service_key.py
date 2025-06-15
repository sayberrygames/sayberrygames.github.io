import os
from supabase import create_client, Client
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize Supabase client with service role key
url = os.environ.get("VITE_SUPABASE_URL")
service_key = os.environ.get("SUPABASE_SERVICE_KEY")

if not url or not service_key:
    print("Error: Supabase credentials not found in environment variables")
    exit(1)

# Create client with service role key (bypasses RLS)
supabase: Client = create_client(url, service_key)

print("=== Testing with Service Role Key ===")

# First, let's try to delete the problematic post
note_id = "0af3377b-6ca7-40a7-9c81-0ac582bd409b"

print(f"\nAttempting to delete note: {note_id}")
try:
    # Check if note exists
    check_response = supabase.table('dev_notes').select("*").eq('id', note_id).single().execute()
    print(f"Found note: {check_response.data['title_ko']}")
    
    # Delete with service role key
    delete_response = supabase.table('dev_notes').delete().eq('id', note_id).execute()
    print(f"Delete response: {delete_response}")
    
    # Verify deletion
    try:
        verify_response = supabase.table('dev_notes').select("*").eq('id', note_id).single().execute()
        print("Note still exists - deletion may have failed")
    except:
        print("✓ Note successfully deleted!")
        
except Exception as e:
    print(f"Error: {e}")

# Also execute SQL to fix the RLS policy
print("\n=== Updating RLS Policies ===")
sql_query = """
-- Drop existing delete policies
DROP POLICY IF EXISTS "Enable delete for users based on email" ON dev_notes;
DROP POLICY IF EXISTS "Enable delete for authors" ON dev_notes;

-- Create new delete policy that allows admins and authors
CREATE POLICY "Enable delete for admins and authors" 
ON dev_notes FOR DELETE 
USING (
    author = auth.jwt() ->> 'email'
    OR author = (auth.jwt() -> 'user_metadata' ->> 'name')
    OR author = split_part(auth.jwt() ->> 'email', '@', 1)
    OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
    OR auth.jwt() ->> 'email' = 'sayberrygames@gmail.com'
);
"""

# Execute raw SQL using the REST API
headers = {
    "apikey": service_key,
    "Authorization": f"Bearer {service_key}",
    "Content-Type": "application/json"
}

# Note: Direct SQL execution via REST API requires different approach
print("To fix RLS policies, please run the fix_admin_delete_policy.sql in Supabase Dashboard")