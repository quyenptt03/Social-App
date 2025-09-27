"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useUserStore } from "@/store/userStore";
import InputField from "@/components/form-controls/InputField";
import { profileApi, ProfileResponse } from "@/api/auth/profileApi";

const ProfileSchema = z.object({
  full_name: z
    .string()
    .min(2, { message: "Full name must be at least 2 characters" })
    .max(100, { message: "Full name is too long" }),
  display_name: z
    .string()
    .max(50, { message: "Display name is too long" })
    .optional(),
  email: z.string().email({
    message: "Must be a valid email",
  }),
});

type ProfileFormData = z.infer<typeof ProfileSchema>;

const ProfilePage: React.FC = () => {
  const { user, setCredentials } = useUserStore();
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateMessage, setUpdateMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [profileData, setProfileData] = useState<
    ProfileResponse["data"] | null
  >(null);

  // Handle nested user structure from store
  const currentUser = profileData || user;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(ProfileSchema),
    defaultValues: {
      full_name: currentUser?.full_name || "",
      display_name: currentUser?.display_name || "",
      email: currentUser?.email || "",
    },
  });

  // Fetch profile data when component loads
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        const response = await profileApi.getCurrentProfile();
        setProfileData(response.data);

        // Update the form with fetched data
        reset({
          full_name: response.data.full_name || "",
          display_name: response.data.display_name || "",
          email: response.data.email || "",
        });
      } catch (error) {
        console.error("Failed to fetch profile:", error);
        setUpdateMessage("Failed to load profile data.");
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchProfile();
    } else {
      setIsLoading(false);
    }
  }, [user, reset]);

  // Update form when profile data changes
  useEffect(() => {
    if (currentUser) {
      reset({
        full_name: currentUser.full_name || "",
        display_name: currentUser.display_name || "",
        email: currentUser.email || "",
      });
    }
  }, [currentUser, reset]);

  const onSubmit = async (data: ProfileFormData) => {
    try {
      setIsUpdating(true);
      setUpdateMessage(null);

      const response = await profileApi.updateProfile(data);

      // Update the local profile data and store
      const updatedUser = response.data;
      setProfileData(updatedUser);
      setCredentials(updatedUser);

      setUpdateMessage("Profile updated successfully!");
    } catch (error) {
      console.error("Failed to update profile:", error);
      setUpdateMessage("Failed to update profile. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!user || !currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Please log in to access your profile.</p>
          <a
            href="/auth/login"
            className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Log In
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto py-8 px-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Edit Profile</h1>
            <p className="text-gray-600 mt-1">
              Update your personal information
            </p>
          </div>

          {/* Profile Form */}
          <div className="px-6 py-6">
            {updateMessage && (
              <div
                className={`mb-4 p-4 rounded-lg ${
                  updateMessage.includes("successfully")
                    ? "bg-green-50 border border-green-200 text-green-700"
                    : "bg-red-50 border border-red-200 text-red-700"
                }`}
              >
                {updateMessage}
                {updateMessage.includes("Failed to load") && (
                  <button
                    onClick={() => window.location.reload()}
                    className="ml-2 text-red-600 underline hover:no-underline"
                  >
                    Retry
                  </button>
                )}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label
                  htmlFor="full_name"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Full Name
                </label>
                <InputField<ProfileFormData>
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
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Display Name
                  <span className="text-gray-400 font-normal ml-1">
                    (How others see you)
                  </span>
                </label>
                <InputField<ProfileFormData>
                  type="text"
                  placeholder="Johnny"
                  name="display_name"
                  register={register}
                  error={errors.display_name}
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Email Address
                </label>
                <InputField<ProfileFormData>
                  type="email"
                  placeholder="john@example.com"
                  name="email"
                  register={register}
                  error={errors.email}
                />
              </div>

              <div className="flex items-center justify-between pt-6">
                <div>
                  <p className="text-sm text-gray-600">
                    Username:{" "}
                    <span className="font-medium">{currentUser.username}</span>
                  </p>
                  <p className="text-sm text-gray-600">
                    Role:{" "}
                    <span className="font-medium capitalize">
                      {currentUser.role}
                    </span>
                  </p>
                </div>

                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => window.history.back()}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isUpdating ? "Updating..." : "Update Profile"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
