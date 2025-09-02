// AdminDashboard.jsx - Complete implementation for role-based access control
import React, { useState, useEffect } from 'react'
import { 
  refreshUserSession, 
  getCurrentUserRole, 
  isAdmin, 
  testJobsAccess, 
  inviteTechnician,
  inviteMultipleTechnicians,
  verifySetup 
} from './supabase-auth-utils'

const AdminDashboard = () => {
  const [userRole, setUserRole] = useState(null)
  const [loading, setLoading] = useState(true)
  const [testResults, setTestResults] = useState(null)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteName, setInviteName] = useState('')
  const [inviteResults, setInviteResults] = useState([])
  const [setupVerification, setSetupVerification] = useState(null)

  // Predefined technicians to invite
  const techniciansToInvite = [
    { name: 'Chris', email: 'chris@example.com' },
    { name: 'Kian', email: 'kian@example.com' },
    { name: 'Steven', email: 'steven@example.com' }
  ]

  useEffect(() => {
    initializeDashboard()
  }, [])

  const initializeDashboard = async () => {
    try {
      setLoading(true)
      
      // Get current user role
      const role = await getCurrentUserRole()
      setUserRole(role)
      
      // If user is admin, refresh session to ensure latest JWT
      if (role === 'admin') {
        await refreshUserSession()
      }
      
    } catch (error) {
      console.error('Failed to initialize dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRefreshSession = async () => {
    try {
      setLoading(true)
      await refreshUserSession()
      
      // Update user role after refresh
      const role = await getCurrentUserRole()
      setUserRole(role)
      
      alert('✅ Session refreshed successfully! Your JWT now includes the latest role information.')
    } catch (error) {
      alert('❗ Failed to refresh session: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleTestJobsAccess = async () => {
    try {
      setLoading(true)
      const results = await testJobsAccess()
      setTestResults(results)
      
      if (results.success) {
        alert(`✅ Jobs access test successful!\n- SELECT: Found ${results.jobsCount} jobs\n- INSERT: Created job ${results.newJobId}`)
      } else {
        alert(`❗ Jobs access test failed:\n- Operation: ${results.operation}\n- Error: ${results.error}`)
      }
    } catch (error) {
      alert('❗ Failed to test jobs access: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleInviteSingle = async () => {
    if (!inviteEmail) {
      alert('Please enter an email address')
      return
    }

    try {
      setLoading(true)
      const result = await inviteTechnician(inviteEmail, inviteName)
      
      setInviteResults(prev => [...prev, { 
        ...result, 
        name: inviteName || 'Unknown',
        timestamp: new Date().toLocaleString()
      }])
      
      setInviteEmail('')
      setInviteName('')
      
      alert(`✅ Magic link sent to ${inviteEmail}`)
    } catch (error) {
      alert('❗ Failed to send invitation: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleInviteAll = async () => {
    try {
      setLoading(true)
      const results = await inviteMultipleTechnicians(techniciansToInvite)
      
      setInviteResults(prev => [...prev, ...results.map(r => ({
        ...r,
        timestamp: new Date().toLocaleString()
      }))])
      
      const successful = results.filter(r => r.success).length
      const failed = results.filter(r => !r.success).length
      
      alert(`📧 Batch invitation complete:\n✅ Successful: ${successful}\n❗ Failed: ${failed}`)
    } catch (error) {
      alert('❗ Failed to send batch invitations: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleVerifySetup = async () => {
    try {
      setLoading(true)
      const results = await verifySetup()
      setSetupVerification(results)
      
      const status = results.isAdmin && results.sessionRefresh && results.jobsAccess?.success
        ? '✅ All systems operational!'
        : '⚠️ Some issues detected - check results below'
      
      alert(status)
    } catch (error) {
      alert('❗ Setup verification failed: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading && !userRole) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (userRole !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-red-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">
            Current role: <span className="font-mono bg-gray-100 px-2 py-1 rounded">{userRole || 'none'}</span>
          </p>
          <p className="text-gray-600 mb-6">You need admin privileges to access this dashboard.</p>
          <button 
            onClick={handleRefreshSession}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            disabled={loading}
          >
            {loading ? 'Refreshing...' : 'Refresh Session'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">
            Role: <span className="font-mono bg-green-100 text-green-800 px-2 py-1 rounded">{userRole}</span>
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Session Management */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">🔄 Session Management</h2>
            <p className="text-gray-600 mb-4">
              Refresh your session to ensure your JWT includes the latest role information.
            </p>
            <button 
              onClick={handleRefreshSession}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Refreshing...' : 'Refresh Session'}
            </button>
          </div>

          {/* Jobs Access Testing */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">🧪 Test Jobs Access</h2>
            <p className="text-gray-600 mb-4">
              Verify that your RLS policies are working correctly by testing access to the jobs table.
            </p>
            <button 
              onClick={handleTestJobsAccess}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Testing...' : 'Test Jobs Access'}
            </button>
            
            {testResults && (
              <div className="mt-4 p-3 bg-gray-50 rounded">
                <h3 className="font-semibold mb-2">Test Results:</h3>
                <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                  {JSON.stringify(testResults, null, 2)}
                </pre>
              </div>
            )}
          </div>

          {/* Single Technician Invitation */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">📧 Invite Technician</h2>
            <div className="space-y-3">
              <input
                type="email"
                placeholder="Email address"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
              />
              <input
                type="text"
                placeholder="Name (optional)"
                value={inviteName}
                onChange={(e) => setInviteName(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
              />
              <button 
                onClick={handleInviteSingle}
                className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 disabled:opacity-50"
                disabled={loading || !inviteEmail}
              >
                {loading ? 'Sending...' : 'Send Magic Link'}
              </button>
            </div>
          </div>

          {/* Batch Technician Invitation */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">📧 Invite All Technicians</h2>
            <p className="text-gray-600 mb-4">
              Send magic links to Chris, Kian, and Steven for technician onboarding.
            </p>
            <div className="mb-4">
              {techniciansToInvite.map((tech, index) => (
                <div key={index} className="flex justify-between items-center py-1">
                  <span>{tech.name}</span>
                  <span className="text-gray-500 text-sm">{tech.email}</span>
                </div>
              ))}
            </div>
            <button 
              onClick={handleInviteAll}
              className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Sending...' : 'Send All Invitations'}
            </button>
          </div>

          {/* Setup Verification */}
          <div className="bg-white rounded-lg shadow p-6 lg:col-span-2">
            <h2 className="text-xl font-semibold mb-4">🔍 Complete Setup Verification</h2>
            <p className="text-gray-600 mb-4">
              Run a comprehensive test of your authentication setup, role assignment, and RLS policies.
            </p>
            <button 
              onClick={handleVerifySetup}
              className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Verifying...' : 'Verify Complete Setup'}
            </button>
            
            {setupVerification && (
              <div className="mt-4 p-4 bg-gray-50 rounded">
                <h3 className="font-semibold mb-2">Verification Results:</h3>
                <pre className="text-sm text-gray-700 whitespace-pre-wrap overflow-x-auto">
                  {JSON.stringify(setupVerification, null, 2)}
                </pre>
              </div>
            )}
          </div>

          {/* Invitation Results */}
          {inviteResults.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6 lg:col-span-2">
              <h2 className="text-xl font-semibold mb-4">📋 Invitation History</h2>
              <div className="space-y-2">
                {inviteResults.map((result, index) => (
                  <div 
                    key={index} 
                    className={`p-3 rounded ${result.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} border`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium">
                        {result.success ? '✅' : '❗'} {result.name} ({result.email})
                      </span>
                      <span className="text-sm text-gray-500">{result.timestamp}</span>
                    </div>
                    {!result.success && (
                      <p className="text-red-600 text-sm mt-1">{result.error}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard

