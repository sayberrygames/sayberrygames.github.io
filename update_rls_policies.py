import os
from dotenv import load_dotenv
import requests
import json

# Load environment variables
load_dotenv()

url = os.environ.get("VITE_SUPABASE_URL")
service_key = os.environ.get("SUPABASE_SERVICE_KEY")

if not url or not service_key:
    print("Error: Supabase credentials not found")
    exit(1)

# Supabase REST API endpoint for running SQL
sql_endpoint = f"{url}/rest/v1/rpc"

headers = {
    "apikey": service_key,
    "Authorization": f"Bearer {service_key}",
    "Content-Type": "application/json",
    "Prefer": "return=minimal"
}

# First, let's check current policies using pg_policies view
check_policies_sql = """
SELECT 
    policyname,
    cmd,
    qual
FROM pg_catalog.pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'dev_notes'
AND cmd IN ('UPDATE', 'DELETE');
"""

# SQL to fix the policies
fix_policies_sql = """
-- Drop existing delete policies
DROP POLICY IF EXISTS "Enable delete for users based on email" ON public.dev_notes;
DROP POLICY IF EXISTS "Enable delete for authors" ON public.dev_notes;
DROP POLICY IF EXISTS "Users can delete own dev notes" ON public.dev_notes;

-- Create new delete policy that allows admins and authors
CREATE POLICY "Enable delete for admins and authors" 
ON public.dev_notes 
FOR DELETE 
TO authenticated
USING (
    (auth.jwt() ->> 'email' = author)
    OR (auth.jwt() -> 'user_metadata' ->> 'name' = author)
    OR (split_part(auth.jwt() ->> 'email', '@', 1) = author)
    OR ((auth.jwt() -> 'user_metadata' ->> 'role')::text = 'admin')
    OR (auth.jwt() ->> 'email' = 'sayberrygames@gmail.com')
);

-- Also fix update policy
DROP POLICY IF EXISTS "Enable update for users based on email" ON public.dev_notes;
DROP POLICY IF EXISTS "Enable update for authors" ON public.dev_notes;
DROP POLICY IF EXISTS "Users can update own dev notes" ON public.dev_notes;

CREATE POLICY "Enable update for admins and authors" 
ON public.dev_notes 
FOR UPDATE 
TO authenticated
USING (
    (auth.jwt() ->> 'email' = author)
    OR (auth.jwt() -> 'user_metadata' ->> 'name' = author)
    OR (split_part(auth.jwt() ->> 'email', '@', 1) = author)
    OR ((auth.jwt() -> 'user_metadata' ->> 'role')::text = 'admin')
    OR (auth.jwt() ->> 'email' = 'sayberrygames@gmail.com')
);
"""

# Execute SQL directly via management API
print("=== Updating RLS Policies ===")

# Use the Supabase management API
import subprocess

# Save SQL to file
with open('temp_fix_policies.sql', 'w') as f:
    f.write(fix_policies_sql)

# Use psql with connection string
db_url = f"postgresql://postgres.hapjsigxjmogajicrtjd:{service_key}@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres"

try:
    # Try using psql
    result = subprocess.run(
        ['psql', db_url, '-f', 'temp_fix_policies.sql'],
        capture_output=True,
        text=True
    )
    
    if result.returncode == 0:
        print("✓ RLS policies updated successfully!")
        print(result.stdout)
    else:
        print("Error updating policies via psql:")
        print(result.stderr)
        
except FileNotFoundError:
    print("psql not found. Installing postgresql-client...")
    subprocess.run(['sudo', 'apt-get', 'update'], check=False)
    subprocess.run(['sudo', 'apt-get', 'install', '-y', 'postgresql-client'], check=False)
    print("\nPlease run this script again after psql is installed.")
    
finally:
    # Clean up temp file
    if os.path.exists('temp_fix_policies.sql'):
        os.remove('temp_fix_policies.sql')