import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    const adminEmail = 'yashwarulkar25@gmail.com';
    const adminPassword = '12345678';

    // Check if admin already exists
    const { data: existingUser } = await supabaseAdmin.auth.admin.listUsers();
    const adminExists = existingUser?.users?.some(u => u.email === adminEmail);

    if (adminExists) {
      console.log('Super admin already exists');
      return new Response(
        JSON.stringify({ message: 'Super admin already exists', success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create the super admin user
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
      user_metadata: {
        full_name: 'Super Admin'
      }
    });

    if (createError) {
      console.error('Error creating admin:', createError);
      throw createError;
    }

    console.log('Super admin created:', newUser.user?.id);

    // Update the user role to super_admin
    if (newUser.user) {
      const { error: roleError } = await supabaseAdmin
        .from('user_roles')
        .update({ role: 'super_admin' })
        .eq('user_id', newUser.user.id);

      if (roleError) {
        console.error('Error updating role:', roleError);
        // Try inserting if update fails (in case trigger didn't run)
        await supabaseAdmin
          .from('user_roles')
          .upsert({ user_id: newUser.user.id, role: 'super_admin' });
      }
    }

    return new Response(
      JSON.stringify({ message: 'Super admin created successfully', success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage, success: false }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});