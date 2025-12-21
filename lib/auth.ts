export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

const USERS_KEY = 'invoice-generator-users';
const CURRENT_USER_KEY = 'invoice-generator-current-user';

/**
 * Register a new user
 */
export function registerUser(email: string, password: string, name: string): User {
  const users = getUsers();
  
  // Check if user already exists
  if (users.find(u => u.email === email)) {
    throw new Error('User with this email already exists');
  }

  const newUser: User = {
    id: Date.now().toString(),
    email,
    name,
    createdAt: new Date().toISOString(),
  };

  // Store user with password (in production, hash the password)
  const userData = {
    ...newUser,
    password, // In production, this should be hashed
  };

  users.push(userData);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));

  // Auto-login after registration
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));

  return newUser;
}

/**
 * Sign in a user
 */
export function signIn(email: string, password: string): User {
  const users = getUsers();
  const user = users.find(u => u.email === email && (u as any).password === password);

  if (!user) {
    throw new Error('Invalid email or password');
  }

  const { password: _, ...userWithoutPassword } = user as any;
  const currentUser: User = userWithoutPassword;

  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(currentUser));
  return currentUser;
}

/**
 * Sign out the current user
 */
export function signOut(): void {
  localStorage.removeItem(CURRENT_USER_KEY);
}

/**
 * Get the current signed-in user
 */
export function getCurrentUser(): User | null {
  try {
    const data = localStorage.getItem(CURRENT_USER_KEY);
    if (!data) {
      return null;
    }
    return JSON.parse(data) as User;
  } catch (error) {
    return null;
  }
}

/**
 * Get all users (for internal use)
 */
function getUsers(): any[] {
  try {
    const data = localStorage.getItem(USERS_KEY);
    if (!data) {
      return [];
    }
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return getCurrentUser() !== null;
}

