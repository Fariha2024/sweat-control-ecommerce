
/**
 * Shared Error Classes
 * Used across all microservices for consistent error handling
 */

class AppError extends Error {
  constructor(message, statusCode, errorCode = null) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

class NotFoundError extends AppError {
  constructor(resource, id = null) {
    const message = id 
      ? `${resource} with ID ${id} not found`
      : `${resource} not found`;
    super(message, 404, 'RESOURCE_NOT_FOUND');
    this.resource = resource;
    this.resourceId = id;
  }
}

class ValidationError extends AppError {
  constructor(message, details = null) {
    super(message, 400, 'VALIDATION_ERROR');
    this.details = details;
  }
}

class UnauthorizedError extends AppError {
  constructor(message = 'Authentication required') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

class ForbiddenError extends AppError {
  constructor(message = 'Access forbidden') {
    super(message, 403, 'FORBIDDEN');
  }
}

class ConflictError extends AppError {
  constructor(message, field = null) {
    super(message, 409, 'CONFLICT');
    this.field = field;
  }
}

class ServiceUnavailableError extends AppError {
  constructor(service, message = null) {
    const msg = message || `${service} service is currently unavailable`;
    super(msg, 503, 'SERVICE_UNAVAILABLE');
    this.service = service;
  }
}

class DatabaseError extends AppError {
  constructor(message, originalError = null) {
    super(message || 'Database operation failed', 500, 'DATABASE_ERROR');
    this.originalError = originalError;
  }
}

class BusinessRuleError extends AppError {
  constructor(message, rule = null) {
    super(message, 422, 'BUSINESS_RULE_VIOLATION');
    this.rule = rule;
  }
}

function isAppError(error) {
  return error instanceof AppError;
}

function formatError(error) {
  if (error instanceof AppError) {
    return {
      success: false,
      error: {
        type: error.name,
        message: error.message,
        code: error.errorCode,
        ...(error.details && { details: error.details }),
        ...(error.resource && { resource: error.resource }),
        ...(error.field && { field: error.field })
      },
      timestamp: new Date().toISOString()
    };
  }
  
  // Unknown error
  return {
    success: false,
    error: {
      type: 'InternalServerError',
      message: process.env.NODE_ENV === 'production' 
        ? 'An unexpected error occurred' 
        : error.message,
      code: 'INTERNAL_ERROR'
    },
    timestamp: new Date().toISOString()
  };
}

module.exports = {
  AppError,
  NotFoundError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  ConflictError,
  ServiceUnavailableError,
  DatabaseError,
  BusinessRuleError,
  isAppError,
  formatError
};
