class DomainError extends Error {
  constructor(message, status = 400, code = 'DOMAIN_ERROR', details = undefined) {
    super(message);
    this.name = this.constructor.name;
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

class ValidationError extends DomainError {
  constructor(message, details = undefined) {
    super(message, 422, 'VALIDATION_ERROR', details);
  }
}

class BadRequestError extends DomainError {
  constructor(message, details = undefined) {
    super(message, 400, 'BAD_REQUEST', details);
  }
}

class NotFoundError extends DomainError {
  constructor(message) {
    super(message, 404, 'NOT_FOUND');
  }
}

class ConflictError extends DomainError {
  constructor(message) {
    super(message, 409, 'CONFLICT');
  }
}

module.exports = { DomainError, ValidationError, BadRequestError, NotFoundError, ConflictError };
