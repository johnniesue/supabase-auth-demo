// Usage Example - How to implement the complete workflow
// This demonstrates the exact steps mentioned in your message

import { 
  refreshUserSession, 
  testJobsAccess, 
  inviteTechnician,
  verifySetup 
} from './supabase-auth-utils.js'

/**
 * Complete workflow implementation
 * This follows the exact steps you mentioned:
 * 1. Refresh session to get updated JWT with role
 * 2. Test jobs access to verify RLS policies
 * 3. Send magic links to technicians
 */
async function completeWorkflow() {
  console.log('🚀 Starting complete Supabase auth workflow...')
  
  try {
    // Step 1: Refresh your session so your JWT includes the latest role
    console.log('\n📍 Step 1: Refreshing session...')
    await refreshUserSession()
    
    // Step 2: Test your access by selecting/inserting jobs
    console.log('\n📍 Step 2: Testing jobs access...')
    const jobsTest = await testJobsAccess()
    
    if (jobsTest.success) {
      console.log('✅ Jobs access confirmed - RLS policies working correctly!')
      console.log(`   - Found ${jobsTest.jobsCount} existing jobs`)
      console.log(`   - Successfully created test job: ${jobsTest.newJobId}`)
    } else {
      console.log('❗ Jobs access failed:', jobsTest.error)
      return
    }
    
    // Step 3: Send magic links to Chris, Kian, and Steven
    console.log('\n📍 Step 3: Sending magic links to technicians...')
    
    const technicians = [
      { name: 'Chris', email: 'chris@yourcompany.com' },
      { name: 'Kian', email: 'kian@yourcompany.com' },
      { name: 'Steven', email: 'steven@yourcompany.com' }
    ]
    
    for (const tech of technicians) {
      try {
        await inviteTechnician(tech.email, tech.name)
        console.log(`✅ Magic link sent to ${tech.name} (${tech.email})`)
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000))
        
      } catch (error) {
        console.log(`❗ Failed to invite ${tech.name}: ${error.message}`)
      }
    }
    
    console.log('\n🎉 Workflow complete! Your setup is ready.')
    console.log('\n📋 Next steps:')
    console.log('   1. Check your email for confirmation of sent magic links')
    console.log('   2. Share the magic link emails with Chris, Kian, and Steven')
    console.log('   3. When they click the links, they\'ll be assigned technician roles automatically')
    console.log('   4. Test their access by having them log in and try to access jobs')
    
  } catch (error) {
    console.error('❗ Workflow failed:', error.message)
  }
}

/**
 * Quick verification - run this to check everything is working
 */
async function quickVerification() {
  console.log('🔍 Running quick verification...')
  
  const results = await verifySetup()
  
  console.log('\n📊 Verification Results:')
  console.log('   User Role:', results.userRole)
  console.log('   Is Admin:', results.isAdmin)
  console.log('   Session Refresh:', results.sessionRefresh ? '✅' : '❌')
  console.log('   Jobs Access:', results.jobsAccess?.success ? '✅' : '❌')
  
  if (results.jobsAccess && !results.jobsAccess.success) {
    console.log('   Jobs Error:', results.jobsAccess.error)
  }
  
  return results
}

/**
 * Individual step functions - use these for testing specific parts
 */

// Just refresh the session
export async function stepRefreshSession() {
  console.log('🔄 Refreshing session...')
  return await refreshUserSession()
}

// Just test jobs access
export async function stepTestJobs() {
  console.log('🧪 Testing jobs access...')
  return await testJobsAccess()
}

// Just invite one technician
export async function stepInviteTechnician(email, name) {
  console.log(`📧 Inviting ${name} (${email})...`)
  return await inviteTechnician(email, name)
}

// Export main functions
export {
  completeWorkflow,
  quickVerification
}

// If running this file directly (for testing)
if (typeof window === 'undefined' && import.meta.url === `file://${process.argv[1]}`) {
  // Running in Node.js environment
  console.log('Running in test mode...')
  quickVerification().then(() => {
    console.log('Test complete')
  }).catch(error => {
    console.error('Test failed:', error)
  })
}

