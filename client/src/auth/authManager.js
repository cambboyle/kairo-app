// Auth Manager - Flexible Authentication System for Kairo
// Designed to work with multiple auth providers (Auth0, Firebase, Supabase, etc.)

export class AuthManager {
  constructor() {
    this.user = null
    this.isAuthenticated = false
    this.authProvider = null // Will be set when provider is chosen
    this.listeners = new Set()

    // Initialize auth state from localStorage on startup
    this.initializeAuth()
  }

  // =================================================================
  // CORE AUTH METHODS - These will be implemented by auth providers
  // =================================================================

  /**
   * Initialize authentication on app startup
   * TODO: Implement with chosen provider (Auth0, Firebase, etc.)
   */
  async initializeAuth() {
    try {
      // Check for existing session/token
      const savedUser = localStorage.getItem('kairo-user')
      const savedToken = localStorage.getItem('kairo-auth-token')

      if (savedUser && savedToken) {
        // TODO: Validate token with auth provider
        // await this.validateToken(savedToken)
        this.user = JSON.parse(savedUser)
        this.isAuthenticated = true
        this.notifyListeners('auth-state-changed', {
          user: this.user,
          isAuthenticated: true,
        })
      }
    } catch (error) {
      console.error('Auth initialization failed:', error)
      this.logout() // Clear invalid session
    }
  }

  /**
   * Sign in with email/password
   * TODO: Implement with chosen provider
   */
  async signIn(email, password) {
    try {
      // FUTURE: Replace with actual auth provider
      // const response = await authProvider.signIn(email, password)

      // Mock implementation for now
      console.log('🔐 Sign in attempted:', email)
      throw new Error('Auth provider not configured yet')

      // FUTURE IMPLEMENTATION:
      // this.user = response.user
      // this.isAuthenticated = true
      // localStorage.setItem('kairo-user', JSON.stringify(this.user))
      // localStorage.setItem('kairo-auth-token', response.token)
      // this.notifyListeners('auth-state-changed', { user: this.user, isAuthenticated: true })
      // return { success: true, user: this.user }
    } catch (error) {
      console.error('Sign in failed:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Sign up with email/password
   * TODO: Implement with chosen provider
   */
  async signUp(email, password, displayName = null) {
    try {
      // FUTURE: Replace with actual auth provider
      // const response = await authProvider.signUp(email, password, { displayName })

      console.log('📝 Sign up attempted:', email, displayName)
      throw new Error('Auth provider not configured yet')

      // FUTURE IMPLEMENTATION:
      // this.user = response.user
      // this.isAuthenticated = true
      // localStorage.setItem('kairo-user', JSON.stringify(this.user))
      // localStorage.setItem('kairo-auth-token', response.token)
      // this.notifyListeners('auth-state-changed', { user: this.user, isAuthenticated: true })
      // return { success: true, user: this.user }
    } catch (error) {
      console.error('Sign up failed:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Sign in with OAuth provider (Google, GitHub, etc.)
   * TODO: Implement with chosen provider
   */
  async signInWithProvider(provider) {
    try {
      // FUTURE: Replace with actual auth provider
      // const response = await authProvider.signInWithOAuth(provider)

      console.log('🌐 OAuth sign in attempted:', provider)
      throw new Error('OAuth not configured yet')

      // FUTURE IMPLEMENTATION:
      // this.user = response.user
      // this.isAuthenticated = true
      // localStorage.setItem('kairo-user', JSON.stringify(this.user))
      // localStorage.setItem('kairo-auth-token', response.token)
      // this.notifyListeners('auth-state-changed', { user: this.user, isAuthenticated: true })
      // return { success: true, user: this.user }
    } catch (error) {
      console.error('OAuth sign in failed:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Sign out current user
   */
  async logout() {
    try {
      // FUTURE: Call auth provider logout
      // await authProvider.signOut()

      this.user = null
      this.isAuthenticated = false
      localStorage.removeItem('kairo-user')
      localStorage.removeItem('kairo-auth-token')
      this.notifyListeners('auth-state-changed', {
        user: null,
        isAuthenticated: false,
      })

      console.log('👋 User signed out')
      return { success: true }
    } catch (error) {
      console.error('Logout failed:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Reset password
   * TODO: Implement with chosen provider
   */
  async resetPassword(email) {
    try {
      // FUTURE: Replace with actual auth provider
      // await authProvider.resetPassword(email)

      console.log('🔄 Password reset requested:', email)
      throw new Error('Password reset not configured yet')

      // FUTURE IMPLEMENTATION:
      // return { success: true, message: 'Password reset email sent' }
    } catch (error) {
      console.error('Password reset failed:', error)
      return { success: false, error: error.message }
    }
  }

  // =================================================================
  // USER PROFILE METHODS
  // =================================================================

  /**
   * Update user profile
   * TODO: Implement with chosen provider and backend
   */
  async updateProfile(updates) {
    try {
      if (!this.isAuthenticated) {
        throw new Error('User not authenticated')
      }

      // FUTURE: Update with auth provider and backend
      // const response = await authProvider.updateProfile(updates)
      // await backend.updateUserProfile(this.user.id, updates)

      console.log('👤 Profile update attempted:', updates)
      throw new Error('Profile updates not configured yet')

      // FUTURE IMPLEMENTATION:
      // this.user = { ...this.user, ...response.user }
      // localStorage.setItem('kairo-user', JSON.stringify(this.user))
      // this.notifyListeners('profile-updated', { user: this.user })
      // return { success: true, user: this.user }
    } catch (error) {
      console.error('Profile update failed:', error)
      return { success: false, error: error.message }
    }
  }

  // =================================================================
  // UTILITY METHODS
  // =================================================================

  /**
   * Get current user
   */
  getCurrentUser() {
    return this.user
  }

  /**
   * Check if user is authenticated
   */
  isUserAuthenticated() {
    return this.isAuthenticated
  }

  /**
   * Get user ID for API calls
   */
  getUserId() {
    return this.user?.id || null
  }

  /**
   * Get auth token for API calls
   */
  getAuthToken() {
    return localStorage.getItem('kairo-auth-token')
  }

  /**
   * Add auth state listener
   */
  addAuthListener(callback) {
    this.listeners.add(callback)
    return () => this.listeners.delete(callback) // Return unsubscribe function
  }

  /**
   * Notify all listeners of auth state changes
   */
  notifyListeners(event, data) {
    this.listeners.forEach((callback) => {
      try {
        callback(event, data)
      } catch (error) {
        console.error('Auth listener error:', error)
      }
    })
  }

  // =================================================================
  // FUTURE PROVIDER INTEGRATION METHODS
  // =================================================================

  /**
   * Configure auth provider (Auth0, Firebase, Supabase, etc.)
   * Call this during app initialization with your chosen provider
   */
  setAuthProvider(provider) {
    this.authProvider = provider
    console.log('🔧 Auth provider configured:', provider.name)
  }

  /**
   * Validate auth token with provider
   * TODO: Implement based on chosen provider
   */
  async validateToken(token) {
    if (!this.authProvider) {
      throw new Error('Auth provider not configured')
    }

    // FUTURE: Implement token validation
    // return await this.authProvider.validateToken(token)
    return true // Mock for now
  }
}

// Create singleton instance
export const authManager = new AuthManager()

// =================================================================
// PROVIDER INTEGRATION EXAMPLES
// =================================================================

/*
// EXAMPLE: Auth0 Integration
import { Auth0Provider } from '@auth0/auth0-spa-js'

const auth0Provider = {
  name: 'Auth0',
  client: new Auth0Provider({
    domain: 'your-domain.auth0.com',
    clientId: 'your-client-id',
    redirectUri: window.location.origin
  }),
  
  async signIn(email, password) {
    return await this.client.loginWithCredentials({ email, password })
  },
  
  async signUp(email, password, options) {
    return await this.client.signUp({ email, password, ...options })
  },
  
  async signInWithOAuth(provider) {
    return await this.client.loginWithRedirect({ connection: provider })
  }
}

authManager.setAuthProvider(auth0Provider)
*/

/*
// EXAMPLE: Firebase Integration
import { auth } from 'firebase/auth'

const firebaseProvider = {
  name: 'Firebase',
  
  async signIn(email, password) {
    const result = await signInWithEmailAndPassword(auth, email, password)
    return { user: result.user, token: await result.user.getIdToken() }
  },
  
  async signUp(email, password, options) {
    const result = await createUserWithEmailAndPassword(auth, email, password)
    if (options.displayName) {
      await updateProfile(result.user, { displayName: options.displayName })
    }
    return { user: result.user, token: await result.user.getIdToken() }
  },
  
  async signInWithOAuth(provider) {
    const authProvider = provider === 'google' ? new GoogleAuthProvider() : new GithubAuthProvider()
    const result = await signInWithPopup(auth, authProvider)
    return { user: result.user, token: await result.user.getIdToken() }
  }
}

authManager.setAuthProvider(firebaseProvider)
*/

/*
// EXAMPLE: Supabase Integration
import { createClient } from '@supabase/supabase-js'

const supabaseProvider = {
  name: 'Supabase',
  client: createClient('your-url', 'your-anon-key'),
  
  async signIn(email, password) {
    const { data, error } = await this.client.auth.signInWithPassword({ email, password })
    if (error) throw error
    return { user: data.user, token: data.session.access_token }
  },
  
  async signUp(email, password, options) {
    const { data, error } = await this.client.auth.signUp({ 
      email, 
      password,
      options: { data: options }
    })
    if (error) throw error
    return { user: data.user, token: data.session?.access_token }
  },
  
  async signInWithOAuth(provider) {
    const { data, error } = await this.client.auth.signInWithOAuth({ provider })
    if (error) throw error
    return { user: data.user, token: data.session.access_token }
  }
}

authManager.setAuthProvider(supabaseProvider)
*/
