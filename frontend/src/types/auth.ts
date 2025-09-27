import { FieldError, UseFormRegister, FieldValues } from "react-hook-form";
import { z, ZodType } from "zod";

const passwordValidation = new RegExp(
  /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/
);

// Define schemas first
export const RegisterSchema = z
  .object({
    username: z
      .string()
      .min(3, { message: "Username must be at least 3 characters" })
      .max(30, { message: "Username is too long" })
      .regex(/^[a-zA-Z0-9_]+$/, {
        message: "Username can only contain letters, numbers, and underscores",
      }),
    full_name: z
      .string()
      .min(2, { message: "Full name must be at least 2 characters" })
      .max(100, { message: "Full name is too long" }),
    display_name: z
      .string()
      .max(50, { message: "Display name is too long" })
      .optional(),
    role: z.enum(["user", "admin"], {
      message: "Role must be either 'user' or 'admin'",
    }),
    email: z.string().email({
      message: "Must be a valid email",
    }),
    password: z
      .string()
      .min(8, { message: "Password is too short" })
      .max(50, { message: "Password is too long" })
      .regex(passwordValidation, {
        message:
          "Your password at least 8 characters, must contain at least 1 uppercase letter, 1 number and 1 special character",
      }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const LoginSchema = z.object({
  email: z.string().min(2, { message: "Please provide email/username" }),
  password: z
    .string()
    .min(8, { message: "Password is too short" })
    .max(50, { message: "Password is too long" }),
});

// Infer types from schemas
export type RegisterFormData = z.infer<typeof RegisterSchema>;
export type LoginFormData = z.infer<typeof LoginSchema>;
export type SignInAPIResponse = z.infer<typeof SignInAPIResponseSchema>;
export type SignUpAPIResponse = z.infer<typeof SignUpAPIResponseSchema>;
export type UserProfile = z.infer<typeof SignInAPIResponseSchema>["data"];

// Define base form data type for backward compatibility
export type FormData = {
  email: string;
  password: string;
  confirmPassword?: string;
};

export type FormFieldProps<T extends FieldValues = FormData> = {
  type: string;
  placeholder: string;
  name: keyof T;
  register: UseFormRegister<T>;
  error: FieldError | undefined;
  valueAsNumber?: boolean;
};

export type ValidFieldNames = keyof FormData;

export const SignInAPIResponseSchema = z.object({
  message: z.string(),
  data: z.object({
    id: z.string().uuid(),
    username: z.string(),
    email: z.string(),
    full_name: z.string(),
    display_name: z.string().nullable(),
    role: z.string(),
    is_active: z.boolean(),
    created_at: z.string(),
    updated_at: z.string(),
    avatar_initials: z.string(),
  }),
  accessToken: z.string(),
});

export const SignUpAPIResponseSchema = z.object({
  message: z.string(),
  data: z.object({
    id: z.string().uuid(),
    username: z.string(),
    email: z.string(),
    full_name: z.string(),
    display_name: z.string().nullable(),
    role: z.string(),
    is_active: z.boolean(),
    created_at: z.string(),
    updated_at: z.string(),
    avatar_initials: z.string(),
  }),
  accessToken: z.string(),
});

export const SignOutAPIResponseSchema = z.object({
  message: z.string(),
});
