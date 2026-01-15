// Extend Express Request type to include authenticated user
// This file properly augments the Express namespace and passport User type

export interface AuthenticatedUser {
  userId: string;
  email: string;
  role: string;
  // Passport SAML user properties (from deserialized user)
  id?: string;
  name?: string;
  ssoProvider?: string;
  lastLoginAt?: Date;
  createdAt?: Date;
}

declare global {
  namespace Express {
    // Augment passport's User interface
    interface User extends AuthenticatedUser {}
  }
}

// This is needed to make this file a module
export {};
