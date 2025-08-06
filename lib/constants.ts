// App configuration constants
export const APP_CONFIG = {
  name: 'SkillLoop',
  description: 'Decentralized Learning Platform',
  version: '1.0.0',
  supportEmail: 'support@skillloop.xyz',
  maxFileSize: 5 * 1024 * 1024, // 5MB
  allowedImageTypes: ['image/jpeg', 'image/png', 'image/webp'],
} as const;

// Token configuration
export const TOKEN_CONFIG = {
  symbol: 'SKL',
  decimals: 18,
  initialUserBalance: 200,
  minHourlyRate: 5,
  maxHourlyRate: 20,
  minSessionDuration: 30, // minutes
  maxSessionDuration: 180, // minutes
} as const;

// Session configuration
export const SESSION_CONFIG = {
  minProgressForCompletion: 70, // percentage
  minAttendanceRate: 80, // percentage
  cancellationWindowHours: 24,
  maxSessionsPerDay: 5,
} as const;

// Pagination defaults
export const PAGINATION = {
  defaultLimit: 10,
  maxLimit: 100,
  defaultSkip: 0,
} as const;

// Validation patterns
export const VALIDATION_PATTERNS = {
  ethereumAddress: /^0x[a-fA-F0-9]{40}$/,
  username: /^[a-zA-Z0-9_-]{3,30}$/,
  skillName: /^[a-zA-Z0-9\s\-\.]{1,100}$/,
} as const;

// Error messages
export const ERROR_MESSAGES = {
  WALLET_NOT_CONNECTED: 'Please connect your wallet to continue',
  INSUFFICIENT_BALANCE: 'Insufficient token balance',
  SESSION_NOT_FOUND: 'Session not found',
  UNAUTHORIZED: 'You are not authorized to perform this action',
  VALIDATION_FAILED: 'Invalid data provided',
  DATABASE_ERROR: 'Database operation failed',
  NETWORK_ERROR: 'Network connection failed',
} as const;