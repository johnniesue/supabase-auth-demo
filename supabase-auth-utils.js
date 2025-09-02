// Supabase Authentication & Role Management Utilities
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'YOUR_SUPABASE_URL'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

/**
 * Refresh the current user session to get updated JWT with latest role information
 * Call this after role changes to ensure the JWT includes the new role
 */
export async function refreshUserSession() {
  try {
    console.log('🔄 Refreshing user session...')
    
    const { data, error } = await supabase.auth.refreshSession()
    
    if (error) {
      console.error('❗ Session refresh failed:', error.message)
      throw error
    }
    
    console.log('✅ Session refreshed successfully')
    console.log('New access token:', data.session?.access_token?.substring(0, 20) + '...')
    console.log('Expires at:', new Date(data.session?.expires_at! * 1000))
    
    // Log the user role from the refreshed session
    const user = data.session?.user
    if (user?.user_metadata?.role) {
      console.log('👤 User role:', user.user_metadata.role)
    }
    
    return data.session
  } catch (error) {
    console.error('Failed to refresh session:', error)
    throw error
  }
}

/**
 * Get the current user's role from their metadata
 */
export async function getCurrentUserRole() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error) {
      console.error('Error getting user:', error)
      return null
    }
    
    if (!user) {
      console.log('No authenticated user')
      return null
    }
    
    const role = user.user_metadata?.role
    console.log('Current user role:', role || 'No role assigned')
    
    return role
  } catch (error) {
    console.error('Failed to get user role:', error)
    return null
  }
}

/**
 * Check if the current user has admin privileges
 */
export async function isAdmin() {
  const role = await getCurrentUserRole()
  return role === 'admin'
}

/**
 * Check if the current user has technician privileges
 */
export async function isTechnician() {
  const role = await getCurrentUserRole()
  return role === 'technician'
}

/**
 * Test admin access to the jobs table
 * This will verify that RLS policies are working correctly
 */
export async function testJobsAccess() {
  try {
    console.log('🧪 Testing jobs table access...')
    
    // First refresh session to ensure we have the latest role
    await refreshUserSession()
    
    // Test SELECT access
    const { data: jobs, error: selectError } = await supabase
      .from('jobs')
      .select('*')
      .limit(5)
    
    if (selectError) {
      console.error('❗ Jobs SELECT failed:', selectError.message)
      return { success: false, error: selectError.message, operation: 'SELECT' }
    }
    
    console.log('✅ Jobs SELECT successful - found', jobs?.length || 0, 'jobs')
    
    // Test INSERT access (create a test job)
    const testJob = {
      title: 'Test Job - ' + new Date().toISOString(),
      description: 'This is a test job created to verify admin access',
      status: 'pending'
    }
    
    const { data: newJob, error: insertError } = await supabase
      .from('jobs')
      .insert([testJob])
      .select()
    
    if (insertError) {
      console.error('❗ Jobs INSERT failed:', insertError.message)
      return { 
        success: false, 
        error: insertError.message, 
        operation: 'INSERT',
        selectSuccess: true,
        jobsCount: jobs?.length || 0
      }
    }
    
    console.log('✅ Jobs INSERT successful - created job:', newJob?.[0]?.id)
    
    return {
      success: true,
      selectSuccess: true,
      insertSuccess: true,
      jobsCount: jobs?.length || 0,
      newJobId: newJob?.[0]?.id
    }
    
  } catch (error) {
    console.error('Failed to test jobs access:', error)
    return { success: false, error: error.message, operation: 'UNKNOWN' }
  }
}

/**
 * Send magic link invitation to a new technician
 * This will trigger the technician onboarding flow when they sign up
 */
export async function inviteTechnician(email, technicianName = '') {
  try {
    console.log('📧 Sending magic link to technician:', email)
    
    // Check if current user is admin
    const userIsAdmin = await isAdmin()
    if (!userIsAdmin) {
      throw new Error('Only admins can invite technicians')
    }
    
    // Send magic link
    const { data, error } = await supabase.auth.signInWithOtp({
      email: email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: {
          role: 'technician',
          invited_by: (await supabase.auth.getUser()).data.user?.email,
          technician_name: technicianName
        }
      }
    })
    
    if (error) {
      console.error('❗ Failed to send magic link:', error.message)
      throw error
    }
    
    console.log('✅ Magic link sent successfully to:', email)
    
    return { success: true, email, data }
    
  } catch (error) {
    console.error('Failed to invite technician:', error)
    throw error
  }
}

/**
 * Batch invite multiple technicians
 */
export async function inviteMultipleTechnicians(technicians) {
  const results = []
  
  for (const tech of technicians) {
    try {
      const result = await inviteTechnician(tech.email, tech.name)
      results.push({ ...result, name: tech.name })
      
      // Add small delay between invites to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000))
      
    } catch (error) {
      results.push({ 
        success: false, 
        email: tech.email, 
        name: tech.name, 
        error: error.message 
      })
    }
  }
  
  return results
}

/**
 * Complete setup verification - run all tests
 */
export async function verifySetup() {
  console.log('🔍 Running complete setup verification...')
  
  const results = {
    userRole: null,
    isAdmin: false,
    sessionRefresh: false,
    jobsAccess: null,
    timestamp: new Date().toISOString()
  }
  
  try {
    // Check user role
    results.userRole = await getCurrentUserRole()
    results.isAdmin = await isAdmin()
    
    // Refresh session
    const session = await refreshUserSession()
    results.sessionRefresh = !!session
    
    // Test jobs access
    results.jobsAccess = await testJobsAccess()
    
    console.log('📊 Setup verification complete:', results)
    
    return results
    
  } catch (error) {
    console.error('Setup verification failed:', error)
    results.error = error.message
    return results
  }
}

// Export default object with all functions
export default {
  supabase,
  refreshUserSession,
  getCurrentUserRole,
  isAdmin,
  isTechnician,
  testJobsAccess,
  inviteTechnician,
  inviteMultipleTechnicians,
  verifySetup
}

