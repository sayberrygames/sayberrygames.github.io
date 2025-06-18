import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hapjsigxjmogajicrtjd.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhhcGpzaWd4am1vZ2FqaWNydGpkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTk2NjQ3MCwiZXhwIjoyMDY1NTQyNDcwfQ.V-mlfQchoqdfLUUN7f7EPhgnMr_o7EQahB9LtEO4C_E';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkTeamMembers() {
  const { data: members, error } = await supabase
    .from('team_members')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('Error fetching team members:', error);
    return;
  }

  console.log('Total team members:', members.length);
  console.log('\nCurrent team member data:\n');

  members.forEach(member => {
    console.log(`=== ${member.name} (ID: ${member.id}) ===`);
    console.log(`Active: ${member.active}`);
    console.log(`Sort Order: ${member.sort_order}`);
    console.log(`\nRoles:`);
    console.log(`  Korean: ${member.role_ko || '(empty)'}`);
    console.log(`  English: ${member.role_en || '(empty)'}`);
    console.log(`  Japanese: ${member.role_ja || '(empty)'}`);
    console.log(`\nDescriptions:`);
    console.log(`  Korean: ${member.description_ko || '(empty)'}`);
    console.log(`  English: ${member.description_en || '(empty)'}`);
    console.log(`  Japanese: ${member.description_ja || '(empty)'}`);
    console.log(`\nAvatar URL: ${member.avatar_url || '(empty)'}`);
    console.log('\n' + '-'.repeat(50) + '\n');
  });
}

checkTeamMembers();