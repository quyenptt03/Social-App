import { z } from "zod";
//@ts-ignore
import { AxiosError } from "axios";
import { useUserStore } from "../../store/userStore";
import { useMutation, useQuery } from "@tanstack/react-query";
import { AuthAPI } from "./query-slice";
import { useState, useEffect } from "react";
import {
  SignInAPIResponseSchema,
  FormData,
  SignUpAPIResponseSchema,
  SignOutAPIResponseSchema,
  LoginFormData,
  RegisterFormData,
} from "../../types/auth";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { toast } from "react-hot-toast";

interface ErrorResponse {
  message: string;
}

export function useSignIn() {
  const router = useRouter();
  const { setCredentials } = useUserStore();
  return useMutation<
    z.infer<typeof SignInAPIResponseSchema>,
    AxiosError<ErrorResponse>,
    LoginFormData
  >({
    mutationFn: (user) => AuthAPI.signIn(user),
    onSuccess: (res) => {
      const { data, message, accessToken } = res;
      setCredentials(data);

      Cookies.set("token", accessToken, { expires: 1 });

      toast.success(message);
      router.push("/");
    },
    onError: (error) => {
      const errorMessage = error.response?.data.message || "An error occurred";
      toast.error(errorMessage);
    },
  });
}

export function useSignUp() {
  const router = useRouter();
  const { setCredentials } = useUserStore();
  return useMutation<
    z.infer<typeof SignUpAPIResponseSchema>,
    AxiosError<ErrorResponse>,
    RegisterFormData
  >({
    mutationFn: (user) => AuthAPI.signUp(user),
    onSuccess: (res) => {
      const { data, message, accessToken } = res;
      setCredentials(data);

      Cookies.set("token", accessToken, { expires: 1 });

      toast.success(message);
      router.push("/");
    },
    onError: (error) => {
      const errorMessage = error.response?.data.message || "An error occurred";
      toast.error(errorMessage);
    },
  });
}

export function useSignOut() {
  const router = useRouter();
  const { removeCredentials } = useUserStore();
  return useMutation<
    z.infer<typeof SignOutAPIResponseSchema>,
    AxiosError<ErrorResponse>
  >({
    mutationFn: (user) => AuthAPI.signOut(user),
    onSuccess: (res) => {
      const { message } = res;

      removeCredentials();
      Cookies.remove("token");
      toast.success(message);
      router.push("/login");
    },
    onError: (error) => {
      const errorMessage = error.response?.data.message || "An error occurred";
      toast.error(errorMessage);
    },
  });
}

// Admin hooks
export function useGetAllUsers() {
  return useQuery({
    queryKey: ["users", "all"],
    queryFn: () => AuthAPI.getAllUsers({}),
    retry: 1,
  });
}

// Custom hook for debouncing
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export function useSearchUsers(searchTerm: string, enabled: boolean = true) {
  // Debounce the search term with 300ms delay
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  return useQuery({
    queryKey: ["users", "search", debouncedSearchTerm],
    queryFn: () => AuthAPI.searchUsers({ q: debouncedSearchTerm }),
    enabled: enabled && debouncedSearchTerm.length >= 2,
    retry: 1,
  });
}
