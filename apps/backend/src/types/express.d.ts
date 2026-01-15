// Extend Express Request type to include authenticated user
// This file properly augments the Express namespace and passport User type
// This is an ambient declaration file - it doesn't need to be imported

declare namespace Express {
  interface User {
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
}
