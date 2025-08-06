import { z } from 'zod';

// User validation schemas
export const createUserSchema = z.object({
  address: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address'),
  username: z.string().min(3).max(50).optional(),
  bio: z.string().max(500).optional(),
  avatar: z.string().url().optional(),
  skills: z.array(z.object({
    name: z.string().min(1).max(100),
    level: z.enum(['beginner', 'intermediate', 'expert']),
    description: z.string().min(1).max(500),
    hourlyRate: z.number().min(5).max(20).optional(),
  })).optional(),
  learning: z.array(z.string().min(1).max(100)).optional(),
});

export const updateUserSchema = createUserSchema.partial().omit({ address: true });

// Session validation schemas
export const createSessionSchema = z.object({
  tutorAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid tutor address'),
  learnerAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid learner address'),
  skillName: z.string().min(1).max(100),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  duration: z.number().min(30).max(180),
  tokenAmount: z.number().min(2.5).max(60), // 5-20 SKL/hr for 30-180 min sessions
  description: z.string().min(1).max(1000),
});

// Learning request validation schemas
export const createLearningRequestSchema = z.object({
  userAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid user address'),
  skillName: z.string().min(1).max(100),
  description: z.string().min(10).max(1000),
  preferredDuration: z.number().min(30).max(180),
  maxBudget: z.number().min(5).max(100),
  preferredSchedule: z.string().min(1).max(50),
});

// Bid validation schemas
export const createBidSchema = z.object({
  tutorAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid tutor address'),
  proposedRate: z.number().min(5).max(20),
  proposedDuration: z.number().min(30).max(180),
  message: z.string().min(10).max(500),
  availableSlots: z.array(z.string()).optional(),
});

// Review validation schemas
export const createReviewSchema = z.object({
  reviewerAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid reviewer address'),
  rating: z.number().min(1).max(5),
  comment: z.string().min(1).max(500),
});

export const validateRequest = <T>(schema: z.ZodSchema<T>, data: any): T => {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const messages = error.errors.map(err => `${err.path.join('.')}: ${err.message}`);
      throw new Error(`Validation failed: ${messages.join(', ')}`);
    }
    throw error;
  }
};