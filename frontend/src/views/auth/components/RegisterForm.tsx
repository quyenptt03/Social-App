"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { RegisterFormData, RegisterSchema } from "@/types/auth";
import { useSignUp } from "@/api/auth/query";
import InputField from "@/components/form-controls/InputField";
import { useForm } from "react-hook-form";

function RegisterForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      role: "user",
    },
  });

  const signUp = useSignUp();

  const onSubmit = async (data: RegisterFormData) => {
    signUp.mutate(data);
  };

  return (
    <div className="w-full">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Create Account
        </h2>
        <p className="text-gray-600">Fill in your information to get started</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-4">
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Username
            </label>
            <InputField<RegisterFormData>
              type="text"
              placeholder="Username"
              name="username"
              register={register}
              error={errors.username}
            />
          </div>

          <div>
            <label
              htmlFor="full_name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Full Name
            </label>
            <InputField<RegisterFormData>
              type="text"
              placeholder="John Doe"
              name="full_name"
              register={register}
              error={errors.full_name}
            />
          </div>

          <div>
            <label
              htmlFor="display_name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Display Name <span className="text-gray-400">(Optional)</span>
            </label>
            <InputField<RegisterFormData>
              type="text"
              placeholder="How others see you"
              name="display_name"
              register={register}
              error={errors.display_name}
            />
          </div>

          <div>
            <label
              htmlFor="role"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Account Type
            </label>
            <select
              {...register("role")}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
            {errors.role && (
              <p className="text-red-600 text-sm mt-1">{errors.role.message}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email Address
            </label>
            <InputField<RegisterFormData>
              type="email"
              placeholder="john@example.com"
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
            <InputField<RegisterFormData>
              type="password"
              placeholder="Enter your password"
              name="password"
              register={register}
              error={errors.password}
            />
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Confirm Password
            </label>
            <InputField<RegisterFormData>
              type="password"
              placeholder="Confirm your password"
              name="confirmPassword"
              register={register}
              error={errors.confirmPassword}
            />
          </div>
        </div>

        <div className="mt-6">
          <button
            type="submit"
            disabled={signUp.isPending}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {signUp.isPending ? "Creating Account..." : "Create Account"}
          </button>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <a
              href="/auth/login"
              className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
            >
              Sign in here
            </a>
          </p>
        </div>
      </form>
    </div>
  );
}

export default RegisterForm;
