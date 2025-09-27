"use client";

import React, { useState } from "react";
import { useGetAllUsers, useSearchUsers } from "../../api/auth/query";
import { useUserStore } from "../../store/userStore";
import { useHydration } from "../../hooks/useHydration";
import { useRouter } from "next/navigation";
import Avatar from "../../components/ui/Avatar";

const AdminPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchEnabled, setSearchEnabled] = useState(false);
  const { user } = useUserStore();
  const isHydrated = useHydration();
  const router = useRouter();

  // Fetch all users by default
  const {
    data: allUsersData,
    isLoading: allUsersLoading,
    error: allUsersError,
  } = useGetAllUsers();

  // Search users when search term is at least 2 characters
  const {
    data: searchUsersData,
    isLoading: searchUsersLoading,
    error: searchUsersError,
  } = useSearchUsers(searchTerm, true); // Let the hook handle the debouncing and length check
  console.log({ searchTerm });

  // Check if user is admin
  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    router.push("/auth/login");
    return null;
  }

  if (user.role !== "admin") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Access Denied
          </h1>
          <p className="text-gray-600 mb-4">
            You don't have permission to access this page.
          </p>
          <button
            onClick={() => router.push("/")}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    setSearchEnabled(value.length >= 2);
  };

  const clearSearch = () => {
    setSearchTerm("");
    setSearchEnabled(false);
  };

  // Determine which data to show - only use search data if we have valid search results
  const isSearching = searchTerm.length >= 2 && searchUsersData;
  const currentData = isSearching ? searchUsersData : allUsersData;
  const isLoading = isSearching ? searchUsersLoading : allUsersLoading;
  const error = isSearching ? searchUsersError : allUsersError;

  const users = currentData?.data || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="md:flex md:items-center md:justify-between mb-6">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              Admin Panel - User Management
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage all users in the system
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <label htmlFor="search" className="sr-only">
                  Search users
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg
                      className="h-5 w-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                  <input
                    id="search"
                    name="search"
                    type="text"
                    placeholder="Search users by name, username, or email..."
                    className="text-black focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md"
                    value={searchTerm}
                    onChange={handleSearch}
                  />
                </div>
              </div>
              {searchTerm && (
                <button
                  onClick={clearSearch}
                  className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Users List */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600">Loading users...</span>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <div className="text-red-500 mb-2">
                  <svg
                    className="mx-auto h-12 w-12"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Error loading users
                </h3>
                <p className="text-gray-600">
                  {(error as any)?.response?.data?.message ||
                    "An error occurred"}
                </p>
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-2">
                  <svg
                    className="mx-auto h-12 w-12"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No users found
                </h3>
                <p className="text-gray-600">
                  {isSearching
                    ? "No users match your search criteria."
                    : "No users are available."}
                </p>
              </div>
            ) : (
              <>
                <div className="mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    {isSearching ? "Search Results" : "All Users"} (
                    {currentData?.count || users.length})
                  </h3>
                </div>
                <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                  <table className="min-w-full divide-y divide-gray-300">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                          User
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                          Role
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                          Joined
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {users.map((user: any) => (
                        <tr key={user.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <Avatar
                                initials={user.avatar_initials}
                                size="sm"
                              />
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {user.display_name || user.full_name}
                                </div>
                                <div className="text-sm text-gray-500">
                                  @{user.username}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {user.email}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                user.role === "admin"
                                  ? "bg-purple-100 text-purple-800"
                                  : "bg-green-100 text-green-800"
                              }`}
                            >
                              {user.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                user.is_active
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {user.is_active ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(user.created_at).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
