# Supabase Auth & RLS Implementation Guide

This guide provides a complete implementation for Supabase session refresh and role-based access control, including a React component, utility functions, and a standalone HTML test page.

## 🚀 Quick Start

1.  **Download and Unzip:** Download the `supabase-auth-demo.zip` file and unzip it.
2.  **Configure Supabase:** Open `supabase-auth-utils.js` and replace `YOUR_SUPABASE_URL` and `YOUR_SUPABASE_ANON_KEY` with your actual Supabase project credentials.
3.  **Test with HTML Page:** Open `test-page.html` in your browser. Enter your Supabase URL and anon key, then click "Initialize Supabase". You can then use the buttons to test the different functionalities.
4.  **Integrate into React App:**
    *   Copy `supabase-auth-utils.js` to your React project (e.g., `src/lib/`).
    *   Copy `AdminDashboard.jsx` to your components folder (e.g., `src/components/`).
    *   Install the required dependencies: `@supabase/supabase-js`, `lucide-react`, and the `shadcn/ui` components used in the dashboard.
    *   Use the `AdminDashboard` component in your app.

## 📁 File Descriptions

*   `supabase-auth-utils.js`: A set of utility functions for handling Supabase authentication, session refresh, role checking, and more.
*   `AdminDashboard.jsx`: A complete React component that provides a user interface for testing the authentication and RLS features.
*   `usage-example.js`: A script that demonstrates how to use the utility functions to implement the complete workflow programmatically.
*   `test-page.html`: A standalone HTML page for quickly testing the functionality in a browser without a full React setup.
*   `README.md`: This file.

## 🔧 How to Use the Utilities

### `refreshUserSession()`

Refreshes the current user session to get an updated JWT with the latest role information. Call this after any role changes.

### `getCurrentUserRole()`

Returns the role of the currently authenticated user from their metadata.

### `isAdmin()` and `isTechnician()`

Helper functions to check if the current user has the 'admin' or 'technician' role.

### `testJobsAccess()`

Tests the RLS policies by attempting to select and insert into the `jobs` table. This is a great way to verify that your policies are working as expected.

### `inviteTechnician(email, name)`

Sends a magic link to the specified email address. You can include optional metadata, such as the user's name and role, which will be set when they sign up.

### `inviteMultipleTechnicians(technicians)`

A convenience function to invite multiple technicians at once.

### `verifySetup()`

Runs a complete verification of the setup, including role checking, session refresh, and jobs access.

## 📝 Notes

*   **RLS Policies:** This implementation assumes you have RLS policies set up in your Supabase project that use the `auth.jwt() ->> 'role'` to control access.
*   **Error Handling:** The utility functions include basic error handling and logging. You can customize this to fit your application's needs.
*   **Customization:** The React component and utility functions are designed to be easily customized. Feel free to modify them to match your specific requirements.


