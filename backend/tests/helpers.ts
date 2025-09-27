import { createJWT } from "../src/utils/jwt";

export const createTestToken = (payload: any) => {
  return createJWT({ payload });
};

export const createTestUser = () => ({
  id: "test-user-id",
  username: "testuser",
  email: "test@example.com",
  full_name: "Test User",
  role: "user" as const,
  avatar_initials: "TU",
});

export const createTestAdmin = () => ({
  id: "test-admin-id",
  username: "testadmin",
  email: "admin@example.com",
  full_name: "Test Admin",
  role: "admin" as const,
  avatar_initials: "TA",
});

export const mockQueryResult = {
  rows: [],
  rowCount: 0,
  command: "SELECT",
  oid: 0,
  fields: [],
};
