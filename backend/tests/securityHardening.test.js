import { setSecurityHeaders, sanitizeInput } from "../middlewares/securityMiddleware.js";

describe("Security Middleware & Input Sanitization", () => {
  test("setSecurityHeaders sets key HTTP security headers", () => {
    const req = {};
    const headers = {};
    const res = {
      setHeader: (key, val) => {
        headers[key] = val;
      },
      removeHeader: (key) => {
        delete headers[key];
      }
    };
    const next = jest.fn();

    setSecurityHeaders(req, res, next);

    expect(headers["X-Frame-Options"]).toBe("DENY");
    expect(headers["X-Content-Type-Options"]).toBe("nosniff");
    expect(headers["Strict-Transport-Security"]).toBeDefined();
    expect(headers["Permissions-Policy"]).toBeDefined();
    expect(headers["Content-Security-Policy"]).toBeDefined();
    expect(next).toHaveBeenCalled();
  });

  test("sanitizeInput strips Mongo NoSQL injection operators", () => {
    const req = {
      body: {
        username: "admin",
        password: { "$gt": "" },
        "nested.key": "malicious"
      },
      query: {
        filter: { "$ne": null }
      }
    };
    const res = {};
    const next = jest.fn();

    sanitizeInput(req, res, next);

    expect(req.body.username).toBe("admin");
    expect(req.body.password["$gt"]).toBeUndefined();
    expect(req.query.filter["$ne"]).toBeUndefined();
    expect(next).toHaveBeenCalled();
  });
});
