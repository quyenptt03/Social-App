import "dotenv/config";
import jwt, { SignOptions } from "jsonwebtoken";
import { Response } from "express";
import CustomError from "../errors";

const createJWT = ({ payload }: { payload: object }) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in environment variables");
  }

  const secret = process.env.JWT_SECRET as string;

  const token = jwt.sign(payload, secret, {
    expiresIn: process.env.JWT_LIFE_TIME || "1d",
  } as SignOptions);
  return token;
};

const isTokenValid = (token: string) => {
  try {
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not defined in environment variables");
    }

    const secret = process.env.JWT_SECRET as string;
    const payload = jwt.verify(token, secret);
    return payload;
  } catch (error) {
    throw new CustomError.UnauthenticatedError("Authentication invalid");
  }
};

const attachCookiesToResponse = ({
  res,
  user,
}: {
  res: Response;
  user: any;
}) => {
  // Create consistent token payload structure
  const tokenPayload = {
    userId: user.id,
    username: user.username,
    role: user.role,
  };
  const token = createJWT({ payload: tokenPayload });
  const oneDay = 1000 * 60 * 60 * 24;
  res.cookie("token", token, {
    expires: new Date(Date.now() + oneDay),
    secure: process.env.NODE_ENV === "production",
    signed: true,
  });
  return token;
};

export { createJWT, isTokenValid, attachCookiesToResponse };
