const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

    const { email, password } = await req.json()

    // Delete all super_admin roles from user_roles
    await fetch(`${supabaseUrl}/rest/v1/user_roles?role=eq.super_admin`, {
      method: 'DELETE',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    });

    // Get all users to find and delete any with the email
    const getUsersResponse = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    });

    if (getUsersResponse.ok) {
      const data = await getUsersResponse.json();
      
      // Delete all users with similar emails
      for (const user of data.users || []) {
        if (user.email && user.email.includes('maiconsi')) {
          await fetch(`${supabaseUrl}/auth/v1/admin/users/${user.id}`, {
            method: 'DELETE',
            headers: {
              'apikey': supabaseKey,
              'Authorization': `Bearer ${supabaseKey}`
            }
          });
        }
      }
    }

    // Wait a bit for deletions to complete
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Create new user
    const createUserResponse = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email,
        password,
        email_confirm: true
      })
    });

    if (!createUserResponse.ok) {
      const error = await createUserResponse.json();
      throw new Error(error.message || 'Failed to create user');
    }

    const userData = await createUserResponse.json();

    // Assign super_admin role
    const roleResponse = await fetch(`${supabaseUrl}/rest/v1/user_roles`, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        user_id: userData.id,
        role: 'super_admin'
      })
    });

    if (!roleResponse.ok) {
      throw new Error('Failed to assign super_admin role');
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Super admin recreated successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
