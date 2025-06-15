# Claude Assistant Instructions

## Important Credentials (DO NOT COMMIT)
- Supabase Access Token is stored in `.env` file
- Use this token for database schema changes (CREATE TABLE, etc.)

## Testing Commands
When implementing new features, always run:
1. `npm run lint` - Check code style
2. `npm run typecheck` - Check TypeScript types
3. `npm run build` - Ensure production build works

## Supabase Setup
- URL: https://hapjsigxjmogajicrtjd.supabase.co
- Service keys are in `.env` file
- For table creation, use the ACCESS_TOKEN with Management API

## Project Structure
- Two games: ChaosBringer (카오스브링어) and Zeroth Age (0세기)
- Team members are assigned to projects via `team_member_projects` table
- Wiki system uses project-based access control

## Key Features Implemented
1. Authentication with 4-tier role system (admin/lead/member/user)
2. Project-based content management
3. Wiki/Notion-like documentation system
4. Admin user management
5. Profile management with password reset
6. WYSIWYG editor (TipTap) instead of markdown editor
7. Auto-generated URL slugs from titles

## Admin Account
- Email: sayberrygames@gmail.com
- Password: 382400
- Role: admin (set in user_metadata)

## Edge Functions
The following Edge Functions need to be deployed to Supabase:

### admin-users
Location: `/supabase/functions/admin-users/index.ts`
Purpose: Allows admins to list and update user roles
Deploy command: `supabase functions deploy admin-users`

## Recent Updates
- Replaced BlockNote with TipTap editor due to import errors
- Fixed style jsx warnings by moving styles to separate CSS file
- Implemented auto-generated URL slugs from titles
- Added tooltip for slug field explanation
- Fixed team_member_projects query by checking team_member table first
- Created Edge Function for admin user management

## Known Issues
- Edge Functions require manual deployment through Supabase dashboard
- team_members table needs to be linked with auth.users table
- Wiki project assignments currently show all projects (TODO: implement proper filtering)