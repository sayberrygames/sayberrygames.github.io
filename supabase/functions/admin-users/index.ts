import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    // Get the user token from the request
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const token = authHeader.replace('Bearer ', '')
    
    // Verify the user is authenticated and is an admin
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token)
    
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Check if user is admin
    const isAdmin = user.user_metadata?.role === 'admin' || user.email === 'sayberrygames@gmail.com'
    
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: 'Admin access required' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const url = new URL(req.url)
    const userId = url.pathname.split('/').pop()

    // Handle different HTTP methods
    if (req.method === 'GET') {
      // Get all users
      const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers()
      
      if (error) {
        throw error
      }

      return new Response(JSON.stringify({ users }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
      
    } else if (req.method === 'PUT' && userId && userId !== 'admin-users') {
      // Update specific user
      const body = await req.json()
      
      const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
        userId,
        {
          user_metadata: body.user_metadata
        }
      )
      
      if (error) {
        throw error
      }

      return new Response(JSON.stringify({ user: data.user }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
    
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})