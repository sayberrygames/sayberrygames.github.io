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

# Try to delete a test note
note_id = "0af3377b-6ca7-40a7-9c81-0ac582bd409b"
print(f"Attempting to delete note with ID: {note_id}")

try:
    # First, check if the note exists
    select_response = supabase.table('dev_notes').select("*").eq('id', note_id).single().execute()
    print(f"Note found: {select_response.data['title_ko']}")
    
    # Try to delete
    delete_response = supabase.table('dev_notes').delete().eq('id', note_id).execute()
    print(f"Delete response: {delete_response}")
    
    # Check if it's actually deleted
    try:
        check_response = supabase.table('dev_notes').select("*").eq('id', note_id).single().execute()
        print(f"Note still exists after delete: {check_response.data['title_ko']}")
    except:
        print("Note successfully deleted!")
        
except Exception as e:
    print(f"Error: {e}")
    print(f"Error type: {type(e)}")
    if hasattr(e, 'code'):
        print(f"Error code: {e.code}")
    if hasattr(e, 'message'):
        print(f"Error message: {e.message}")