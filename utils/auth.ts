// EcoMon Authentication Utilities
// Simple auth system for EcoMon gamified recycling platform

interface User {
  id: string;
  userId: string; // UUID-based user identifier
  displayName: string;
  email?: string;
  level: number;
  ecoPoints: number;
  ecoTokens: number;
  joinDate: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  preferences?: {
    notifications: boolean;
    shareLocation: boolean;
    wasteTypes: string[];
  };
}

interface AuthSession {
  user: User;
  token: string;
  expiresAt: number;
  isAuthenticated: boolean;
}

// Local storage keys
const AUTH_STORAGE_KEY = 'ecomon_auth_session';
const USER_STORAGE_KEY = 'ecomon_user_data';

/**
 * Check if user is currently authenticated
 */
export function isAuthenticated(): boolean {
  try {
    const session = getStoredSession();
    if (!session) return false;

    // Check if session is expired
    if (Date.now() > session.expiresAt) {
      clearSession();
      return false;
    }

    return session.isAuthenticated;
  } catch (error) {
    console.error('Error checking authentication:', error);
    return false;
  }
}

/**
 * Get current session token
 */
export function getSessionToken(): string | null {
  try {
    const session = getStoredSession();
    if (!session || !isAuthenticated()) {
      return null;
    }
    return session.token;
  } catch (error) {
    console.error('Error getting session token:', error);
    return null;
  }
}

/**
 * Get current authenticated user
 */
export function getCurrentUser(): User | null {
  try {
    const session = getStoredSession();
    if (!session || !isAuthenticated()) {
      return null;
    }
    return session.user;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

/**
 * Login user with credentials
 */
export async function login(email: string, password: string): Promise<{ success: boolean; error?: string }> {
  try {
    // For demo purposes, create a mock user
    // In production, this would call your backend API
    const mockUser: User = {
      id: `user_${Date.now()}`,
      displayName: email.split('@')[0] || 'EcoWarrior',
      email,
      level: 1,
      ecoPoints: 0,
      ecoTokens: 0,
      joinDate: new Date().toISOString(),
      preferences: {
        notifications: true,
        shareLocation: true,
        wasteTypes: ['plastic', 'metal', 'paper']
      }
    };

    const session: AuthSession = {
      user: mockUser,
      token: generateSessionToken(),
      expiresAt: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
      isAuthenticated: true
    };

    // Store session
    storeSession(session);

    console.log('✅ User logged in:', mockUser.displayName);
    return { success: true };

  } catch (error: any) {
    console.error('Login error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Register new user
 */
export async function register(displayName: string, email: string, password: string): Promise<{ success: boolean; error?: string; userDID?: string }> {
  try {
    // Create user DID via backend
    const response = await fetch('http://localhost:3003/api/identity/user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        displayName,
        location: null, // Will be set when user enables location
        preferences: {
          notifications: true,
          shareLocation: false,
          wasteTypes: ['plastic', 'metal', 'paper']
        }
      })
    });

    if (!response.ok) {
      throw new Error('Failed to create user DID');
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Registration failed');
    }

    const newUser: User = {
      id: `user_${Date.now()}`,
      userId: result.data.userId || `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      displayName,
      email,
      level: 1,
      ecoPoints: 0,
      ecoTokens: 0,
      joinDate: new Date().toISOString(),
      preferences: {
        notifications: true,
        shareLocation: false,
        wasteTypes: ['plastic', 'metal', 'paper']
      }
    };

    const session: AuthSession = {
      user: newUser,
      token: generateSessionToken(),
      expiresAt: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
      isAuthenticated: true
    };

    // Store session
    storeSession(session);

    console.log('✅ User registered:', newUser.displayName, 'UserID:', newUser.userId);
    return { success: true, userId: newUser.userId };

  } catch (error: any) {
    console.error('Registration error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Logout current user
 */
export function logout(): void {
  try {
    clearSession();
    console.log('✅ User logged out');
  } catch (error) {
    console.error('Logout error:', error);
  }
}

/**
 * Update user data
 */
export function updateUser(updates: Partial<User>): boolean {
  try {
    const session = getStoredSession();
    if (!session || !isAuthenticated()) {
      return false;
    }

    const updatedUser = { ...session.user, ...updates };
    const updatedSession = { ...session, user: updatedUser };

    storeSession(updatedSession);
    return true;
  } catch (error) {
    console.error('Error updating user:', error);
    return false;
  }
}

/**
 * Get user's current location
 */
export function getUserLocation(): Promise<{ latitude: number; longitude: number }> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        };

        // Update user location in session
        updateUser({ location });

        resolve(location);
      },
      (error) => {
        reject(new Error(`Geolocation error: ${error.message}`));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  });
}

// ============================================================================
// Helper Functions
// ============================================================================

function getStoredSession(): AuthSession | null {
  try {
    // Check if we're in browser environment
    if (typeof window === 'undefined' || !window.localStorage) {
      return null;
    }

    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!stored) return null;
    return JSON.parse(stored);
  } catch (error) {
    console.error('Error reading stored session:', error);
    return null;
  }
}

function storeSession(session: AuthSession): void {
  try {
    // Check if we're in browser environment
    if (typeof window === 'undefined' || !window.localStorage) {
      return;
    }

    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
  } catch (error) {
    console.error('Error storing session:', error);
  }
}

function clearSession(): void {
  try {
    // Check if we're in browser environment
    if (typeof window === 'undefined' || !window.localStorage) {
      return;
    }

    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing session:', error);
  }
}

function generateSessionToken(): string {
  return `ecomon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Export types for use in components
export type { User, AuthSession };
