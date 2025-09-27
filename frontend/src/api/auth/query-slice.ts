import { api } from "../apiHelper";
import { API_ENDPOINT } from "../endpoint_containts";
import {
  SignInAPIResponseSchema,
  LoginSchema,
  RegisterSchema,
  SignUpAPIResponseSchema,
  SignOutAPIResponseSchema,
} from "../../types/auth";
import { z } from "zod";

const SignInRequest = LoginSchema;
const SignInResponse = SignInAPIResponseSchema;
const SignUpRequest = RegisterSchema;
const SignUpResponse = SignUpAPIResponseSchema;
const SignOutResponse = SignOutAPIResponseSchema;

// Admin API schemas
const GetAllUsersResponse = z.object({
  message: z.string(),
  data: z.array(
    z.object({
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
    })
  ),
  count: z.number(),
});

const SearchUsersResponse = z.object({
  message: z.string(),
  data: z.array(
    z.object({
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
    })
  ),
  count: z.number(),
});

const signIn = api({
  method: "POST",
  path: API_ENDPOINT.SIGN_IN,
  requestSchema: SignInRequest,
  responseSchema: SignInResponse,
  type: "public",
});

const signUp = api({
  method: "POST",
  path: API_ENDPOINT.SIGN_UP,
  requestSchema: SignUpRequest,
  responseSchema: SignUpResponse,
  type: "public",
});

const signOut = api({
  method: "GET",
  path: API_ENDPOINT.SIGN_OUT,
  responseSchema: SignOutResponse,
  type: "private",
});

// Admin APIs
const getAllUsers = api({
  method: "GET",
  path: API_ENDPOINT.GET_ALL_USERS,
  responseSchema: GetAllUsersResponse,
  type: "private",
});

const SearchUsersRequest = z.object({
  q: z.string(),
  limit: z.number().optional(),
  offset: z.number().optional(),
});

const searchUsers = api({
  method: "GET",
  path: API_ENDPOINT.SEARCH_USERS,
  requestSchema: SearchUsersRequest,
  responseSchema: SearchUsersResponse,
  type: "private",
});

export const AuthAPI = {
  signIn,
  signUp,
  signOut,
  getAllUsers,
  searchUsers,
};
