import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Alert, AlertDescription } from '@/components/ui/alert.jsx'
import { Separator } from '@/components/ui/separator.jsx'
import { 
  RefreshCw, 
  TestTube, 
  Mail, 
  Users, 
  CheckCircle, 
  XCircle, 
  Settings,
  Shield,
  Database
} from 'lucide-react'
import './App.css'

// Import our Supabase utilities
import { 
  refreshUserSession, 
  getCurrentUserRole, 
  isAdmin, 
  testJobsAccess, 
  inviteTechnician,
  inviteMultipleTechnicians,
  verifySetup,
  supabase 
} from './lib/supabase-auth-utils.js'

function App() {
  const [userRole, setUserRole] = useState(null)
  const [loading, setLoading] = useState(false)
  const [supabaseUrl, setSupabaseUrl] = useState('')
  const [supabaseKey, setSupabaseKey] = useState('')
  const [isConfigured, setIsConfigured] = useState(false)
  const [testResults, setTestResults] = useState(null)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteName, setInviteName] = useState('')
  const [inviteResults, setInviteResults] = useState([])
  const [setupVerification, setSetupVerification] = useState(null)

  // Predefined technicians
  const techniciansToInvite = [
    { name: 'Chris', email: 'chris@example.com' },
    { name: 'Kian', email: 'kian@example.com' },
    { name: 'Steven', email: 'steven@example.com' }
  ]

  useEffect(() => {
    // Check if we can get current role on load
    if (isConfigured) {
      loadCurrentRole()
    }
  }, [isConfigured])

  const loadCurrentRole = async () => {
    try {
      const role = await getCurrentUserRole()
      setUserRole(role)
    } catch (error) {
      console.error('Failed to load user role:', error)
    }
  }

  const handleConfigure = () => {
    if (!supabaseUrl || !supabaseKey) {
      alert('Please enter both Supabase URL and anon key')
      return
    }
    
    // Note: In a real app, you'd reinitialize the client here
    // For this demo, we assume the utilities are configured
    setIsConfigured(true)
    loadCurrentRole()
  }

  const handleRefreshSession = async () => {
    if (!isConfigured) {
      alert('Please configure Supabase first')
      return
    }

    try {
      setLoading(true)
      await refreshUserSession()
      await loadCurrentRole()
      alert('✅ Session refreshed successfully!')
    } catch (error) {
      alert('❗ Failed to refresh session: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleTestJobsAccess = async () => {
    if (!isConfigured) {
      alert('Please configure Supabase first')
      return
    }

    try {
      setLoading(true)
      const results = await testJobsAccess()
      setTestResults(results)
      
      if (results.success) {
        alert(`✅ Jobs access test successful!\n- Found ${results.jobsCount} jobs\n- Created job ${results.newJobId}`)
      } else {
        alert(`❗ Jobs access test failed: ${results.error}`)
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
    if (!isConfigured) {
      alert('Please configure Supabase first')
      return
    }

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
    if (!isConfigured) {
      alert('Please configure Supabase first')
      return
    }

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-gray-900">🔐 Supabase Auth & RLS Demo</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Complete implementation of Supabase session refresh and role-based access control. 
            Test your authentication setup, RLS policies, and technician onboarding flow.
          </p>
        </div>

        {/* Status Badge */}
        <div className="flex justify-center">
          <Badge variant={userRole === 'admin' ? 'default' : userRole ? 'secondary' : 'outline'} className="text-sm">
            <Shield className="w-4 h-4 mr-1" />
            Role: {userRole || 'Not loaded'}
          </Badge>
        </div>

        {/* Configuration Section */}
        {!isConfigured && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Configuration
              </CardTitle>
              <CardDescription>
                Enter your Supabase project details to get started
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                type="url"
                placeholder="https://your-project.supabase.co"
                value={supabaseUrl}
                onChange={(e) => setSupabaseUrl(e.target.value)}
              />
              <Input
                type="text"
                placeholder="Your anon key"
                value={supabaseKey}
                onChange={(e) => setSupabaseKey(e.target.value)}
              />
              <Button onClick={handleConfigure} className="w-full">
                Initialize Supabase
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Main Content - Only show if configured */}
        {isConfigured && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Session Management */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <RefreshCw className="w-5 h-5" />
                  Session Management
                </CardTitle>
                <CardDescription>
                  Refresh your session to ensure your JWT includes the latest role information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={handleRefreshSession}
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Refreshing...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Refresh Session
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Jobs Access Testing */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TestTube className="w-5 h-5" />
                  Test Jobs Access
                </CardTitle>
                <CardDescription>
                  Verify that your RLS policies are working correctly
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  onClick={handleTestJobsAccess}
                  disabled={loading}
                  className="w-full"
                  variant="outline"
                >
                  {loading ? (
                    <>
                      <TestTube className="w-4 h-4 mr-2 animate-pulse" />
                      Testing...
                    </>
                  ) : (
                    <>
                      <Database className="w-4 h-4 mr-2" />
                      Test Jobs Access
                    </>
                  )}
                </Button>
                
                {testResults && (
                  <Alert>
                    <AlertDescription>
                      <div className="flex items-center gap-2 mb-2">
                        {testResults.success ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-600" />
                        )}
                        <span className="font-medium">
                          {testResults.success ? 'Test Successful' : 'Test Failed'}
                        </span>
                      </div>
                      <pre className="text-xs bg-gray-50 p-2 rounded overflow-x-auto">
                        {JSON.stringify(testResults, null, 2)}
                      </pre>
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* Single Technician Invitation */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  Invite Technician
                </CardTitle>
                <CardDescription>
                  Send a magic link to invite a new technician
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Input
                  type="email"
                  placeholder="technician@example.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                />
                <Input
                  type="text"
                  placeholder="Technician Name (optional)"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                />
                <Button 
                  onClick={handleInviteSingle}
                  disabled={loading || !inviteEmail}
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <Mail className="w-4 h-4 mr-2 animate-pulse" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4 mr-2" />
                      Send Magic Link
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Batch Technician Invitation */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Invite All Technicians
                </CardTitle>
                <CardDescription>
                  Send magic links to Chris, Kian, and Steven
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {techniciansToInvite.map((tech, index) => (
                    <div key={index} className="flex justify-between items-center text-sm">
                      <span className="font-medium">{tech.name}</span>
                      <span className="text-gray-500">{tech.email}</span>
                    </div>
                  ))}
                </div>
                <Button 
                  onClick={handleInviteAll}
                  disabled={loading}
                  className="w-full"
                  variant="outline"
                >
                  {loading ? (
                    <>
                      <Users className="w-4 h-4 mr-2 animate-pulse" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Users className="w-4 h-4 mr-2" />
                      Send All Invitations
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Setup Verification - Full Width */}
        {isConfigured && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Complete Setup Verification
              </CardTitle>
              <CardDescription>
                Run a comprehensive test of your authentication setup, role assignment, and RLS policies
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={handleVerifySetup}
                disabled={loading}
                className="w-full"
                size="lg"
              >
                {loading ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2 animate-pulse" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Verify Complete Setup
                  </>
                )}
              </Button>
              
              {setupVerification && (
                <Alert>
                  <AlertDescription>
                    <div className="flex items-center gap-2 mb-2">
                      {setupVerification.isAdmin && setupVerification.sessionRefresh && setupVerification.jobsAccess?.success ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <XCircle className="w-4 h-4 text-yellow-600" />
                      )}
                      <span className="font-medium">Verification Results</span>
                    </div>
                    <pre className="text-xs bg-gray-50 p-3 rounded overflow-x-auto">
                      {JSON.stringify(setupVerification, null, 2)}
                    </pre>
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        )}

        {/* Invitation History */}
        {inviteResults.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>📋 Invitation History</CardTitle>
              <CardDescription>
                Track of all sent invitations and their status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {inviteResults.map((result, index) => (
                  <div 
                    key={index} 
                    className={`p-3 rounded-lg border ${
                      result.success 
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-red-50 border-red-200'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        {result.success ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-600" />
                        )}
                        <span className="font-medium">
                          {result.name} ({result.email})
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">{result.timestamp}</span>
                    </div>
                    {!result.success && (
                      <p className="text-red-600 text-sm mt-1 ml-6">{result.error}</p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <div className="text-center text-sm text-gray-500 pt-6">
          <Separator className="mb-4" />
          <p>
            This demo implements the complete Supabase authentication workflow with role-based access control.
            <br />
            Perfect for testing your RLS policies and technician onboarding flow.
          </p>
        </div>
      </div>
    </div>
  )
}

export default App

