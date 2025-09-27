import * as AuthService from "../../src/services/auth.service";
import UserModel from "../../src/models/User";
import CustomError from "../../src/errors";
import { createTestUser } from "../helpers";

// Mock UserModel
jest.mock("../../src/models/User");
const mockedUserModel = UserModel as jest.Mocked<typeof UserModel>;

describe("Auth Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("login", () => {
    it("should login user with valid email and password", async () => {
      const testUser = createTestUser();
      const loginCredentials = {
        email: "test@example.com",
        password: "password123",
      };

      mockedUserModel.findByEmailOrUsername.mockResolvedValue({
        ...testUser,
        comparePassword: jest.fn().mockResolvedValue(true),
      } as any);

      const result = await AuthService.login(loginCredentials);

      expect(result).toBeDefined();
      expect(result.user.email).toBe(testUser.email);
      expect(result.token).toBeDefined();
      expect(mockedUserModel.findByEmailOrUsername).toHaveBeenCalledWith(
        "test@example.com"
      );
    });

    it("should login user with valid username and password", async () => {
      const testUser = createTestUser();
      const loginCredentials = {
        email: "testuser", // username
        password: "password123",
      };

      mockedUserModel.findByEmailOrUsername.mockResolvedValue({
        ...testUser,
        comparePassword: jest.fn().mockResolvedValue(true),
      } as any);

      const result = await AuthService.login(loginCredentials);

      expect(result).toBeDefined();
      expect(result.user.username).toBe(testUser.username);
      expect(result.token).toBeDefined();
    });

    it("should throw UnauthenticatedError for non-existent user", async () => {
      const loginCredentials = {
        email: "nonexistent@example.com",
        password: "password123",
      };

      mockedUserModel.findByEmailOrUsername.mockResolvedValue(null);

      await expect(AuthService.login(loginCredentials)).rejects.toThrow(
        CustomError.UnauthenticatedError
      );

      expect(mockedUserModel.findByEmailOrUsername).toHaveBeenCalledWith(
        "nonexistent@example.com"
      );
    });

    it("should throw UnauthenticatedError for invalid password", async () => {
      const testUser = createTestUser();
      const loginCredentials = {
        email: "test@example.com",
        password: "wrongpassword",
      };

      mockedUserModel.findByEmailOrUsername.mockResolvedValue({
        ...testUser,
        comparePassword: jest.fn().mockResolvedValue(false),
      } as any);

      await expect(AuthService.login(loginCredentials)).rejects.toThrow(
        CustomError.UnauthenticatedError
      );
    });
  });

  describe("register", () => {
    it("should register new user successfully", async () => {
      const registerData = {
        username: "newuser",
        email: "newuser@example.com",
        password: "password123",
        full_name: "New User",
      };

      const createdUser = {
        ...createTestUser(),
        ...registerData,
        id: "new-user-id",
      };

      mockedUserModel.create.mockResolvedValue(createdUser as any);

      const result = await AuthService.register(registerData);

      expect(result).toBeDefined();
      expect(result.user.username).toBe(registerData.username);
      expect(result.user.email).toBe(registerData.email);
      expect(result.token).toBeDefined();
      expect(mockedUserModel.create).toHaveBeenCalledWith(registerData);
    });

    it("should throw BadRequestError for duplicate email", async () => {
      const registerData = {
        username: "newuser",
        email: "existing@example.com",
        password: "password123",
        full_name: "New User",
      };

      const error = new Error("duplicate key value violates unique constraint");
      (error as any).code = "23505";
      mockedUserModel.create.mockRejectedValue(error);

      await expect(AuthService.register(registerData)).rejects.toThrow(
        CustomError.BadRequestError
      );
    });

    it("should throw BadRequestError for duplicate username", async () => {
      const registerData = {
        username: "existinguser",
        email: "new@example.com",
        password: "password123",
        full_name: "New User",
      };

      const error = new Error("duplicate key value violates unique constraint");
      (error as any).code = "23505";
      (error as any).detail = "Key (username)=(existinguser) already exists.";
      mockedUserModel.create.mockRejectedValue(error);

      await expect(AuthService.register(registerData)).rejects.toThrow(
        CustomError.BadRequestError
      );
    });
  });
});
