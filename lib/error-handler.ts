export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

export const handleApiError = (error: any) => {
  console.error('API Error:', error);
  
  if (error instanceof AppError) {
    return {
      message: error.message,
      statusCode: error.statusCode,
    };
  }
  
  // MongoDB connection errors
  if (error.name === 'MongoNetworkError' || error.name === 'MongoTimeoutError') {
    return {
      message: 'Database connection failed. Please try again later.',
      statusCode: 503,
    };
  }
  
  // Validation errors
  if (error.name === 'ValidationError') {
    return {
      message: 'Invalid data provided.',
      statusCode: 400,
    };
  }
  
  // Default error
  return {
    message: 'An unexpected error occurred.',
    statusCode: 500,
  };
};

export const asyncHandler = (fn: Function) => {
  return (req: any, res: any, next?: any) => {
    Promise.resolve(fn(req, res, next)).catch((error) => {
      const { message, statusCode } = handleApiError(error);
      
      if (res.json) {
        return res.status(statusCode).json({ error: message });
      }
      
      if (next) {
        next(error);
      }
    });
  };
};