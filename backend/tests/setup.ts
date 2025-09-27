// Test setup file
process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test-jwt-secret-key";
process.env.JWT_LIFETIME = "1d";
process.env.DB_URI = "postgresql://test:test@localhost:5432/test_db";
process.env.CLOUDINARY_NAME = "test";
process.env.CLOUDINARY_KEY = "test";
process.env.CLOUDINARY_SECRET = "test";

// Mock console methods to reduce test output noise
const mockConsole = {
  log: () => {},
  error: () => {},
  warn: () => {},
  info: () => {},
};

global.console = {
  ...console,
  ...mockConsole,
};
