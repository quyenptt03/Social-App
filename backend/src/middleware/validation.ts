import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import validator from "validator";
import CustomError from "../errors";
import { z } from "zod";
import Errors from "../errors";

const { BadRequestError } = Errors;

/**
 * Validation middleware for user registration
 */
export const validateRegistration = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { username, email, password, full_name } = req.body;

    // Required fields validation
    const requiredFields = { username, email, password, full_name };
    const missingFields = Object.entries(requiredFields)
      .filter(
        ([key, value]) => !value || (typeof value === "string" && !value.trim())
      )
      .map(([key]) => key);

    if (missingFields.length > 0) {
      throw new CustomError.BadRequestError(
        `Missing required fields: ${missingFields.join(", ")}`
      );
    }

    // Email validation
    if (!validator.isEmail(email)) {
      throw new CustomError.BadRequestError(
        "Please provide a valid email address"
      );
    }

    // Password validation
    if (password.length < 6) {
      throw new CustomError.BadRequestError(
        "Password must be at least 6 characters long"
      );
    }

    // Username validation
    if (username.length < 3 || username.length > 50) {
      throw new CustomError.BadRequestError(
        "Username must be between 3 and 50 characters"
      );
    }

    // Full name validation
    if (full_name.length > 100) {
      throw new CustomError.BadRequestError(
        "Full name cannot be more than 100 characters"
      );
    }

    // Username format validation (only alphanumeric and underscores)
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      throw new CustomError.BadRequestError(
        "Username can only contain letters, numbers, and underscores"
      );
    }

    next();
  } catch (error: any) {
    if (error instanceof CustomError.BadRequestError) {
      res.status(StatusCodes.BAD_REQUEST).json({
        message: error.message,
      });
    } else {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: "Validation failed",
      });
    }
  }
};

/**
 * Validation middleware for user login
 */
export const validateLogin = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;

    if (!email || !email.trim()) {
      throw new CustomError.BadRequestError("Please provide email or username");
    }

    if (!password || !password.trim()) {
      throw new CustomError.BadRequestError("Please provide password");
    }

    next();
  } catch (error: any) {
    if (error instanceof CustomError.BadRequestError) {
      res.status(StatusCodes.BAD_REQUEST).json({
        message: error.message,
      });
    } else {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: "Validation failed",
      });
    }
  }
};

/**
 * Validation middleware for profile update
 */
export const validateProfileUpdate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { display_name, full_name, email } = req.body;

    // At least one field should be provided
    if (!display_name && !full_name && !email) {
      throw new CustomError.BadRequestError(
        "Please provide at least one field to update"
      );
    }

    // Validate email if provided
    if (email && !validator.isEmail(email)) {
      throw new CustomError.BadRequestError(
        "Please provide a valid email address"
      );
    }

    // Validate full_name length if provided
    if (full_name && full_name.length > 100) {
      throw new CustomError.BadRequestError(
        "Full name cannot be more than 100 characters"
      );
    }

    // Validate display_name length if provided
    if (display_name && display_name.length > 100) {
      throw new CustomError.BadRequestError(
        "Display name cannot be more than 100 characters"
      );
    }

    next();
  } catch (error: any) {
    if (error instanceof CustomError.BadRequestError) {
      res.status(StatusCodes.BAD_REQUEST).json({
        message: error.message,
      });
    } else {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: "Validation failed",
      });
    }
  }
};

/**
 * Validation middleware for password change
 */
export const validatePasswordChange = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !currentPassword.trim()) {
      throw new CustomError.BadRequestError("Please provide current password");
    }

    if (!newPassword || !newPassword.trim()) {
      throw new CustomError.BadRequestError("Please provide new password");
    }

    if (newPassword.length < 6) {
      throw new CustomError.BadRequestError(
        "New password must be at least 6 characters long"
      );
    }

    if (currentPassword === newPassword) {
      throw new CustomError.BadRequestError(
        "New password must be different from current password"
      );
    }

    next();
  } catch (error: any) {
    if (error instanceof CustomError.BadRequestError) {
      res.status(StatusCodes.BAD_REQUEST).json({
        message: error.message,
      });
    } else {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: "Validation failed",
      });
    }
  }
};

/**
 * Validation middleware for search queries
 */
export const validateSearch = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { q: searchTerm, limit, offset } = req.query;

    if (
      !searchTerm ||
      typeof searchTerm !== "string" ||
      searchTerm.trim().length < 2
    ) {
      throw new CustomError.BadRequestError(
        "Search term must be at least 2 characters long"
      );
    }

    // Validate pagination parameters
    if (
      limit &&
      (isNaN(Number(limit)) || Number(limit) < 1 || Number(limit) > 100)
    ) {
      throw new CustomError.BadRequestError(
        "Limit must be a number between 1 and 100"
      );
    }

    if (offset && (isNaN(Number(offset)) || Number(offset) < 0)) {
      throw new CustomError.BadRequestError(
        "Offset must be a non-negative number"
      );
    }

    next();
  } catch (error: any) {
    if (error instanceof CustomError.BadRequestError) {
      res.status(StatusCodes.BAD_REQUEST).json({
        message: error.message,
      });
    } else {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: "Validation failed",
      });
    }
  }
};

export const validateRequest = (schema: z.ZodSchema<any>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({
        body: req.body,
        params: req.params,
        query: req.query,
      });
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessages = error.issues.map((err) => {
          const path = err.path.join(".");
          return `${path}: ${err.message}`;
        });
        throw new BadRequestError(
          `Validation failed: ${errorMessages.join(", ")}`
        );
      }
      next(error);
    }
  };
};
