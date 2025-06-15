import os
from supabase import create_client, Client
from dotenv import load_dotenv
from postgrest import SyncSelectRequestBuilder

# Load environment variables
load_dotenv()

url = os.environ.get("VITE_SUPABASE_URL")
service_key = os.environ.get("SUPABASE_SERVICE_KEY")

if not url or not service_key:
    print("Error: Supabase credentials not found")
    exit(1)

# Create client with service role key
supabase: Client = create_client(url, service_key)

print("=== Creating Test Admin Delete ===")

# First, let's create a test dev note that we can delete
test_note = {
    'slug': 'test-admin-delete',
    'title_ko': '관리자 삭제 테스트',
    'title_en': 'Admin Delete Test',
    'title_ja': '管理者削除テスト',
    'content_ko': '이것은 관리자 삭제 권한을 테스트하기 위한 임시 게시물입니다.',
    'content_en': 'This is a temporary post to test admin delete permissions.',
    'content_ja': 'これは管理者の削除権限をテストするための一時的な投稿です。',
    'date': '2025-06-15',
    'category': 'Technical',
    'author': 'test-author',  # Different author
    'published': True,
    'project_id': 'c9cc0464-5a73-4218-9572-2f644d90c2ba'
}

try:
    # Create test note
    create_response = supabase.table('dev_notes').insert(test_note).execute()
    if create_response.data:
        test_id = create_response.data[0]['id']
        print(f"✓ Created test note with ID: {test_id}")
        print(f"  Author: {create_response.data[0]['author']}")
        
        # Now let's see the actual RLS error when trying to delete as admin
        print("\n=== Testing Delete with Anon Key (to see RLS error) ===")
        
        # Create anon client to test RLS
        anon_key = os.environ.get("VITE_SUPABASE_ANON_KEY")
        anon_supabase = create_client(url, anon_key)
        
        try:
            anon_delete = anon_supabase.table('dev_notes').delete().eq('id', test_id).execute()
            print(f"Anon delete result: {anon_delete}")
        except Exception as e:
            print(f"Anon delete error (expected): {e}")
            
        # Clean up with service key
        print("\n=== Cleaning up test note ===")
        cleanup = supabase.table('dev_notes').delete().eq('id', test_id).execute()
        print("✓ Test note cleaned up")
        
except Exception as e:
    print(f"Error: {e}")

print("\n=== RLS Policy Fix Instructions ===")
print("The RLS policies need to be updated in Supabase Dashboard:")
print("1. Go to https://supabase.com/dashboard")
print("2. Select your project")
print("3. Go to 'SQL Editor'")
print("4. Run the following SQL:")
print()

sql_fix = """
-- Check current policies
SELECT policyname, cmd, qual
FROM pg_catalog.pg_policies 
WHERE schemaname = 'public' AND tablename = 'dev_notes';

-- Drop and recreate DELETE policy
DROP POLICY IF EXISTS "Users can delete own dev notes" ON public.dev_notes;
DROP POLICY IF EXISTS "Enable delete for users based on email" ON public.dev_notes;

CREATE POLICY "Users can delete own dev notes or admins can delete any" 
ON public.dev_notes FOR DELETE 
TO authenticated
USING (
    (auth.uid() = auth.uid()) AND (
        -- Author checks
        author = auth.jwt() ->> 'email'
        OR author = (auth.jwt() -> 'user_metadata' ->> 'name')
        OR author = split_part(auth.jwt() ->> 'email', '@', 1)
        -- Admin checks
        OR (auth.jwt() -> 'user_metadata' ->> 'role')::text = 'admin'
        OR auth.jwt() ->> 'email' = 'sayberrygames@gmail.com'
    )
);

-- Drop and recreate UPDATE policy  
DROP POLICY IF EXISTS "Users can update own dev notes" ON public.dev_notes;
DROP POLICY IF EXISTS "Enable update for users based on email" ON public.dev_notes;

CREATE POLICY "Users can update own dev notes or admins can update any" 
ON public.dev_notes FOR UPDATE 
TO authenticated
USING (
    (auth.uid() = auth.uid()) AND (
        -- Author checks
        author = auth.jwt() ->> 'email'
        OR author = (auth.jwt() -> 'user_metadata' ->> 'name')
        OR author = split_part(auth.jwt() ->> 'email', '@', 1)
        -- Admin checks
        OR (auth.jwt() -> 'user_metadata' ->> 'role')::text = 'admin'
        OR auth.jwt() ->> 'email' = 'sayberrygames@gmail.com'
    )
);
"""

print(sql_fix)
print("\n5. After running this SQL, admins will be able to delete any dev note.")