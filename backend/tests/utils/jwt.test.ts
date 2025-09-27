import { createJWT, isTokenValid } from "../../src/utils/jwt";
import CustomError from "../../src/errors";

describe("JWT Utilities", () => {
  beforeAll(() => {
    // Ensure JWT_SECRET is set for tests
    process.env.JWT_SECRET = "test-jwt-secret-key";
  });

  describe("createJWT", () => {
    test("should create a valid JWT token", () => {
      const payload = { userId: "test-id", username: "testuser" };
      const token = createJWT({ payload });

      expect(token).toBeDefined();
      expect(typeof token).toBe("string");
      expect(token.split(".")).toHaveLength(3); // JWT has 3 parts
    });

    test("should include payload data in token", () => {
      const payload = { userId: "test-id", username: "testuser", role: "user" };
      const token = createJWT({ payload });
      const decoded = isTokenValid(token);

      expect((decoded as any).userId).toBe("test-id");
      expect((decoded as any).username).toBe("testuser");
      expect((decoded as any).role).toBe("user");
    });
  });

  describe("isTokenValid", () => {
    test("should validate a valid token", () => {
      const payload = { userId: "test-id", username: "testuser" };
      const token = createJWT({ payload });

      const decoded = isTokenValid(token);

      expect(decoded).toBeDefined();
      expect((decoded as any).userId).toBe("test-id");
      expect((decoded as any).username).toBe("testuser");
    });

    test("should throw UnauthenticatedError for invalid token", () => {
      const invalidToken = "invalid.token.here";

      expect(() => {
        isTokenValid(invalidToken);
      }).toThrow(CustomError.UnauthenticatedError);
    });

    test("should throw UnauthenticatedError for malformed token", () => {
      const malformedToken = "not.a.token";

      expect(() => {
        isTokenValid(malformedToken);
      }).toThrow(CustomError.UnauthenticatedError);
    });
  });
});
