# Supabase Setup Instructions

## 1. Create Admin User

1. Admin user already created!
   - Email: `sayberrygames@gmail.com`
   - Password: `382400` (extended from 3824 to meet minimum requirements)

## 2. Run SQL Scripts

Go to Supabase Dashboard > SQL Editor and run the contents of `setup_all_tables.sql`

This will create:
- `profiles` table with role system (admin, lead, member, user)
- `dev_notes` table for development notes
- `team_members` table for team management
- `news` table for company news
- All necessary RLS policies and triggers

## 3. Insert Initial Data

The SQL script already includes:
- Team member data
- Existing dev notes from the website

## 4. Role System

- **admin**: Full access to everything (sayberrygames@gmail.com)
- **lead**: Can manage team, write news and dev notes (team leads)
- **member**: Can write dev notes (team members)
- **user**: Read-only access (regular users)

## 5. Features Implemented

### Authentication
- Login page at `/login`
- Signup page at `/signup`
- Auth state management with context

### Content Management
- Write post page at `/write?type=dev_notes` or `/write?type=news`
- Markdown editor with live preview
- Multi-language support (Korean, English, Japanese)
- Tags, categories, featured images
- View count tracking

### Permissions
- Dev notes: Team members and above can write
- News: Team leads and admins can write
- Team management: Leads and admins only

### UI Updates
- Login/logout buttons in navbar
- Write button for authorized users
- Beautiful markdown rendering with syntax highlighting
- Responsive design with mobile support

## 6. Environment Variables

The Supabase credentials are hardcoded in `src/lib/supabase.ts`:
- URL: `https://hapjsigxjmogajicrtjd.supabase.co`
- Anon Key: Already set

For production, consider moving these to environment variables.

## 7. Next Steps

1. Create the admin user in Supabase
2. Run the SQL setup script
3. Test login with admin credentials
4. Start creating content!

## 8. Additional Features to Consider

- Image upload functionality
- Comment system
- Draft/publish workflow
- Content versioning
- Analytics dashboard
- Email notifications