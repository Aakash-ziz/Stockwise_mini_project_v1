export abstract class CustomError extends Error {
  abstract readonly statusCode: number;

  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
  }

  abstract serializeErrors(): {
    message: string;
    field?: string;
  }[];
}

export class BadRequestError extends CustomError {
  readonly statusCode = 400;

  constructor(public message: string) {
    super(message);
  }

  serializeErrors() {
    return [];
  }
}

export class NotFoundError extends CustomError {
  readonly statusCode = 404;

  constructor(public message: string = 'Resource not found') {
    super(message);
  }

  serializeErrors() {
    return [];
  }
}

export class ConflictError extends CustomError {
  readonly statusCode = 409;

  constructor(public message: string) {
    super(message);
  }

  serializeErrors() {
    return [];
  }
}

export class ValidationError extends CustomError {
  readonly statusCode = 422;

  constructor(
    public message: string,
    public errors: { field: string; message: string }[]
  ) {
    super(message);
  }

  serializeErrors() {
    return this.errors.map((err) => ({ message: err.message, field: err.field }));
  }
}

export class UnauthorizedError extends CustomError {
  readonly statusCode = 401;

  constructor(public message: string = 'Unauthorized access') {
    super(message);
  }

  serializeErrors() {
    return [];
  }
}

export class ForbiddenError extends CustomError {
  readonly statusCode = 403;

  constructor(public message: string = 'Forbidden resource access') {
    super(message);
  }

  serializeErrors() {
    return [];
  }
}
