/**
 * Unit tests for errorHandler middleware
 * Tests MongoDB error classification, JWT error classification, and operational error handling.
 *
 * Run: node --experimental-vm-modules node_modules/.bin/jest backend/tests/errorHandler.test.js
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AppError, errorHandler, asyncHandler, notFoundHandler } from '../middlewares/errorHandler.js';

// Mock req, res, next helpers
const mockReq = (overrides = {}) => ({
  originalUrl: '/api/test',
  method: 'GET',
  ...overrides
});

const mockRes = () => {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
};

const mockNext = vi.fn();

describe('AppError', () => {
  it('should create operational error with status code', () => {
    const err = new AppError('Not found', 404, 'RESOURCE_NOT_FOUND');
    expect(err.message).toBe('Not found');
    expect(err.statusCode).toBe(404);
    expect(err.errorCode).toBe('RESOURCE_NOT_FOUND');
    expect(err.isOperational).toBe(true);
  });

  it('should default errorCode to null when not provided', () => {
    const err = new AppError('Bad request', 400);
    expect(err.errorCode).toBeNull();
  });
});

describe('notFoundHandler', () => {
  it('should forward 404 AppError for unknown routes', () => {
    const req = mockReq({ originalUrl: '/api/unknown' });
    const res = mockRes();
    const next = vi.fn();

    notFoundHandler(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.objectContaining({
      statusCode: 404,
      errorCode: 'ROUTE_NOT_FOUND',
      isOperational: true
    }));
  });
});

describe('errorHandler — Mongo errors', () => {
  const OLD_ENV = process.env.NODE_ENV;

  beforeEach(() => {
    process.env.NODE_ENV = 'production';
  });

  afterEach(() => {
    process.env.NODE_ENV = OLD_ENV;
  });

  it('should handle CastError (invalid ObjectId)', () => {
    const err = { name: 'CastError', path: '_id', value: 'bad-id', statusCode: 500 };
    const req = mockReq();
    const res = mockRes();

    errorHandler(err, req, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ errorCode: 'INVALID_FIELD' }));
  });

  it('should handle duplicate key error (code 11000)', () => {
    const err = { code: 11000, keyValue: { email: 'test@test.com' }, statusCode: 500 };
    const req = mockReq();
    const res = mockRes();

    errorHandler(err, req, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ errorCode: 'DUPLICATE_ENTRY' }));
  });

  it('should handle Mongoose ValidationError', () => {
    const err = {
      name: 'ValidationError',
      errors: { cgpa: { message: 'CGPA must be between 0 and 10' } },
      statusCode: 500
    };
    const req = mockReq();
    const res = mockRes();

    errorHandler(err, req, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(422);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ errorCode: 'VALIDATION_ERROR' }));
  });
});

describe('errorHandler — JWT errors', () => {
  beforeEach(() => {
    process.env.NODE_ENV = 'production';
  });

  it('should handle JsonWebTokenError', () => {
    const err = { name: 'JsonWebTokenError', statusCode: 500 };
    const req = mockReq();
    const res = mockRes();

    errorHandler(err, req, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ errorCode: 'INVALID_TOKEN' }));
  });

  it('should handle TokenExpiredError', () => {
    const err = { name: 'TokenExpiredError', statusCode: 500 };
    const req = mockReq();
    const res = mockRes();

    errorHandler(err, req, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ errorCode: 'TOKEN_EXPIRED' }));
  });
});

describe('errorHandler — Operational AppErrors', () => {
  it('should return correct status and errorCode for AppError', () => {
    process.env.NODE_ENV = 'production';
    const err = new AppError('Resource not found', 404, 'RESOURCE_NOT_FOUND');
    const req = mockReq();
    const res = mockRes();

    errorHandler(err, req, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      status: 'error',
      message: 'Resource not found',
      errorCode: 'RESOURCE_NOT_FOUND'
    });
  });
});

describe('asyncHandler', () => {
  it('should forward async errors to next()', async () => {
    const err = new Error('Async failure');
    const handler = asyncHandler(async () => { throw err; });

    const req = mockReq();
    const res = mockRes();
    const next = vi.fn();

    await handler(req, res, next);

    expect(next).toHaveBeenCalledWith(err);
  });

  it('should pass through when async resolves', async () => {
    const handler = asyncHandler(async (req, res) => { res.status(200).json({ ok: true }); });

    const req = mockReq();
    const res = mockRes();
    const next = vi.fn();

    await handler(req, res, next);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(next).not.toHaveBeenCalled();
  });
});
