import { describe, it, expect, vi } from "vitest";
import { setSecurityHeaders, sanitizeInput } from "../middlewares/securityMiddleware.js";

const mockReq = (overrides = {}) => ({
  body: {},
  query: {},
  params: {},
  ...overrides
});

const mockRes = () => {
  const headers = {};
  return {
    setHeader: vi.fn((key, val) => { headers[key] = val; }),
    removeHeader: vi.fn((key) => { delete headers[key]; }),
    _headers: headers
  };
};

const mockNext = vi.fn();

describe("setSecurityHeaders Middleware", () => {
  it("should set all essential HTTP security headers", () => {
    const req = mockReq();
    const res = mockRes();

    setSecurityHeaders(req, res, mockNext);

    expect(res.setHeader).toHaveBeenCalledWith("X-Frame-Options", "DENY");
    expect(res.setHeader).toHaveBeenCalledWith("X-Content-Type-Options", "nosniff");
    expect(res.setHeader).toHaveBeenCalledWith("X-XSS-Protection", "1; mode=block");
    expect(res.setHeader).toHaveBeenCalledWith("Referrer-Policy", "strict-origin-when-cross-origin");
    expect(res.removeHeader).toHaveBeenCalledWith("X-Powered-By");
    expect(mockNext).toHaveBeenCalled();
  });
});

describe("sanitizeInput Middleware", () => {
  it("should remove keys starting with '$' to prevent NoSQL injections", () => {
    const req = mockReq({
      body: {
        username: "admin",
        password: { "$gt": "" }
      }
    });
    const res = mockRes();

    sanitizeInput(req, res, mockNext);

    expect(req.body).toEqual({
      username: "admin",
      password: {}
    });
    expect(mockNext).toHaveBeenCalled();
  });

  it("should remove keys containing '.'", () => {
    const req = mockReq({
      query: {
        "user.role": "admin",
        normalKey: "value"
      }
    });
    const res = mockRes();

    sanitizeInput(req, res, mockNext);

    expect(req.query).toEqual({
      normalKey: "value"
    });
  });
});
