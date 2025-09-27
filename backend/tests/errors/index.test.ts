import CustomError from "../../src/errors";

describe("Custom Errors", () => {
  describe("UnauthenticatedError", () => {
    test("should create error with message and correct status code", () => {
      const message = "Authentication Invalid";
      const error = new CustomError.UnauthenticatedError(message);

      expect(error.message).toBe(message);
      expect(error.statusCode).toBe(401);
    });

    test("should create error with custom message", () => {
      const customMessage = "Token expired";
      const error = new CustomError.UnauthenticatedError(customMessage);

      expect(error.message).toBe(customMessage);
      expect(error.statusCode).toBe(401);
    });
  });

  describe("UnauthorizedError", () => {
    test("should create error with message and correct status code", () => {
      const message = "Unauthorized to access this route";
      const error = new CustomError.UnauthorizedError(message);

      expect(error.message).toBe(message);
      expect(error.statusCode).toBe(403);
    });

    test("should create error with custom message", () => {
      const customMessage = "Admin access required";
      const error = new CustomError.UnauthorizedError(customMessage);

      expect(error.message).toBe(customMessage);
      expect(error.statusCode).toBe(403);
    });
  });

  describe("NotFoundError", () => {
    test("should create error with message and correct status code", () => {
      const message = "Resource not found";
      const error = new CustomError.NotFoundError(message);

      expect(error.message).toBe(message);
      expect(error.statusCode).toBe(404);
    });

    test("should create error with custom message", () => {
      const customMessage = "User not found";
      const error = new CustomError.NotFoundError(customMessage);

      expect(error.message).toBe(customMessage);
      expect(error.statusCode).toBe(404);
    });
  });

  describe("BadRequestError", () => {
    test("should create error with message and correct status code", () => {
      const message = "Bad request";
      const error = new CustomError.BadRequestError(message);

      expect(error.message).toBe(message);
      expect(error.statusCode).toBe(400);
    });

    test("should create error with custom message", () => {
      const customMessage = "Invalid input data";
      const error = new CustomError.BadRequestError(customMessage);

      expect(error.message).toBe(customMessage);
      expect(error.statusCode).toBe(400);
    });
  });

  describe("InternalServerError", () => {
    test("should create error with message and correct status code", () => {
      const message = "Internal server error";
      const error = new CustomError.InternalServerError(message);

      expect(error.message).toBe(message);
      expect(error.statusCode).toBe(500);
    });

    test("should create error with custom message", () => {
      const customMessage = "Database connection failed";
      const error = new CustomError.InternalServerError(customMessage);

      expect(error.message).toBe(customMessage);
      expect(error.statusCode).toBe(500);
    });
  });
});
