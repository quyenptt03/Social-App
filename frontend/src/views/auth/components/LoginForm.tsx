"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { LoginFormData, LoginSchema } from "@/types/auth";
import { useSignIn } from "@/api/auth/query";
import InputField from "@/components/form-controls/InputField";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

function LoginForm() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(LoginSchema),
  });

  const signIn = useSignIn();

  const onSubmit = async (data: LoginFormData) => {
    signIn.mutate(data);
  };

  // Redirect on successful login
  useEffect(() => {
    if (signIn.isSuccess) {
      router.push("/");
    }
  }, [signIn.isSuccess, router]);

  return (
    <div className="w-full">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h2>
        <p className="text-gray-600">Sign in to your account to continue</p>
      </div>

      {signIn.error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">
            {signIn.error.message ||
              "Login failed. Please check your credentials."}
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email/Username
            </label>
            <InputField<LoginFormData>
              type="text"
              placeholder="Enter your email/username"
              name="email"
              register={register}
              error={errors.email}
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Password
            </label>
            <InputField<LoginFormData>
              type="password"
              placeholder="Enter your password"
              name="password"
              register={register}
              error={errors.password}
            />
          </div>
        </div>

        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label
              htmlFor="remember-me"
              className="ml-2 block text-sm text-gray-700"
            >
              Remember me
            </label>
          </div>

          <div className="text-sm">
            <a
              href="#"
              className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
            >
              Forgot your password?
            </a>
          </div>
        </div>

        <div className="mt-6">
          <button
            type="submit"
            disabled={signIn.isPending}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {signIn.isPending ? (
              <div className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Signing in...
              </div>
            ) : (
              "Sign In"
            )}
          </button>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{" "}
            <a
              href="/auth/register"
              className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
            >
              Create one here
            </a>
          </p>
        </div>
      </form>
    </div>
  );
}

export default LoginForm;
