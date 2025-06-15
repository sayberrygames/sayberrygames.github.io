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

## Admin Account
- Email: sayberrygames@gmail.com
- Password: 382400
- Role: admin (set in user_metadata)