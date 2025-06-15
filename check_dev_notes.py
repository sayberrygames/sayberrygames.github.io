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

# Search for the specific dev note
print("Searching for '0세기 LLM' dev notes...")
response = supabase.table('dev_notes').select("*").execute()

if response.data:
    for note in response.data:
        if note.get('title_ko') and ('0세기' in note['title_ko'] or 'LLM' in note['title_ko']):
            print(f"\nFound note:")
            print(f"ID: {note['id']}")
            print(f"Slug: {note['slug']}")
            print(f"Title: {note['title_ko']}")
            print(f"Author: {note['author']}")
            print(f"Date: {note['date']}")
            print(f"Published: {note['published']}")
            
            # Test update
            print("\n--- Testing Update ---")
            try:
                update_response = supabase.table('dev_notes').update({
                    'title_ko': '0세기 LLM 캐릭터 시스템 개발기 (테스트 수정)'
                }).eq('id', note['id']).execute()
                print("Update successful!")
                print(f"Updated title: {update_response.data[0]['title_ko']}")
                
                # Revert back
                revert_response = supabase.table('dev_notes').update({
                    'title_ko': '0세기 LLM 캐릭터 시스템 개발기'
                }).eq('id', note['id']).execute()
                print("Reverted back to original title")
                
            except Exception as e:
                print(f"Update error: {e}")
                
            # Test delete (but not actually delete)
            print("\n--- Testing Delete Permission ---")
            try:
                # First check if we can select it specifically
                select_response = supabase.table('dev_notes').select("*").eq('id', note['id']).single().execute()
                print(f"Can select specific note: Yes")
                
                # Don't actually delete, just check the operation
                print("Delete test skipped to preserve data")
                
            except Exception as e:
                print(f"Select error: {e}")
else:
    print("No dev notes found in the database")