"use client";

import React, { useState, useEffect } from "react";
import { Post as PostType } from "../../types/social";
import Post from "./Post";
import CreatePost from "./CreatePost";
import SearchBox from "./SearchBox";
import { postApi } from "../../api/social/socialApi";
import { useUserStore } from "../../store/userStore";

const Timeline: React.FC = () => {
  const [posts, setPosts] = useState<PostType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [searchResults, setSearchResults] = useState<PostType[]>([]);
  const [currentSearchTerm, setCurrentSearchTerm] = useState("");
  const [isAdminMode, setIsAdminMode] = useState(false);

  const { user } = useUserStore();
  const currentUser = user;

  const loadPosts = async (pageNum: number = 1, append: boolean = false) => {
    try {
      if (pageNum === 1) setLoading(true);
      else setLoadingMore(true);

      // Use admin timeline if user is admin and admin mode is enabled
      const response =
        currentUser?.role === "admin" && isAdminMode
          ? await postApi.getAdminTimeline(pageNum, 12, true)
          : await postApi.getTimeline(pageNum, 12);

      if (append) {
        setPosts((prev) => [...prev, ...response.data.posts]);
      } else {
        setPosts(response.data.posts);
      }

      setHasMore(response.data.pagination.hasMore);
      setError(null);
    } catch (err) {
      setError("Failed to load posts. Please try again.");
      console.error("Error loading posts:", err);
    } finally {
      if (pageNum === 1) setLoading(false);
      else setLoadingMore(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  // Reload posts when admin mode changes
  useEffect(() => {
    if (currentUser?.role === "admin") {
      setPage(1);
      loadPosts(1, false);
    }
  }, [isAdminMode]);

  const handlePostCreated = (newPost: PostType) => {
    setPosts((prev) => [newPost, ...prev]);
    // Don't add to search results automatically
  };

  const handlePostUpdate = (updatedPost: PostType) => {
    setPosts((prev) =>
      prev.map((post) => (post.id === updatedPost.id ? updatedPost : post))
    );

    if (isSearchMode) {
      setSearchResults((prev) =>
        prev.map((post) => (post.id === updatedPost.id ? updatedPost : post))
      );
    }
  };

  const handlePostDelete = async (postId: string) => {
    try {
      await postApi.deletePost(postId);
      if (isSearchMode) {
        setSearchResults((prev) => prev.filter((post) => post.id !== postId));
      } else {
        setPosts((prev) => prev.filter((post) => post.id !== postId));
      }
    } catch (error) {
      console.error("Failed to delete post:", error);
    }
  };

  const handleSearchResults = (
    results: PostType[],
    searching: boolean,
    searchTerm: string
  ) => {
    setSearchResults(results);
    setIsSearchMode(searching);
    setCurrentSearchTerm(searchTerm);
  };

  const handleClearSearch = () => {
    setIsSearchMode(false);
    setSearchResults([]);
    setCurrentSearchTerm("");
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadPosts(nextPage, true);
  };

  const handleRefresh = () => {
    setPage(1);
    loadPosts(1, false);
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <div className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-2xl p-8 text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
            <div className="absolute inset-0 rounded-full bg-blue-50 animate-ping opacity-20"></div>
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Loading Your Timeline
          </h3>
          <p className="text-gray-600">Fetching the latest posts for you...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <div className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-2xl p-6 text-center shadow-lg">
          <div className="text-red-500 mb-4">
            <svg
              className="w-16 h-16 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-red-800 mb-2">
            Oops! Something went wrong
          </h3>
          <p className="text-red-600 mb-6">{error}</p>
          <button
            onClick={handleRefresh}
            className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all duration-200 transform hover:scale-105 font-medium shadow-lg"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      {/* Header */}
      <div className="mb-6 flex justify-between items-center gap-4">
        <SearchBox
          onSearchResults={handleSearchResults}
          onClearSearch={handleClearSearch}
        />
        <div className="flex items-center justify-between ">
          <div className="flex items-center space-x-4">
            {/* Admin Mode Toggle */}
            {currentUser?.role === "admin" && (
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={isAdminMode}
                  onChange={(e) => setIsAdminMode(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
                  Admin View
                </span>
              </label>
            )}
          </div>
        </div>
      </div>

      {/* Create Post - Only show in normal timeline mode */}
      {!isSearchMode && <CreatePost onPostCreated={handlePostCreated} />}

      {/* Search Results Header */}
      {isSearchMode && (
        <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border border-blue-200 rounded-2xl p-6 mb-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="text-blue-600">
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-blue-900">
                  Search Results for "{currentSearchTerm}"
                </h3>
                <p className="text-sm text-blue-700 flex items-center space-x-1">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                    {searchResults.length}
                  </span>
                  <span>
                    {searchResults.length === 1 ? "post" : "posts"} found
                  </span>
                </p>
              </div>
            </div>
            <button
              onClick={handleClearSearch}
              className="flex items-center space-x-2 bg-white text-blue-600 hover:text-blue-800 font-medium text-sm px-4 py-2 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-blue-200"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              <span>Back to Timeline</span>
            </button>
          </div>
        </div>
      )}

      {/* Posts Feed */}
      <div className="space-y-4">
        {(isSearchMode ? searchResults : posts).length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
            <div className="text-gray-400 mb-4">
              <svg
                className="w-16 h-16 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {isSearchMode ? "No posts found" : "No posts yet"}
            </h3>
            <p className="text-gray-600">
              {isSearchMode
                ? `No posts match "${currentSearchTerm}". Try a different search term.`
                : "Be the first to share something!"}
            </p>
          </div>
        ) : (
          <>
            {(isSearchMode ? searchResults : posts).map((post) => (
              <Post
                key={post.id}
                post={post}
                onPostUpdate={handlePostUpdate}
                onPostDelete={handlePostDelete}
              />
            ))}
          </>
        )}
      </div>

      {/* Load More - Only show in normal timeline mode */}
      {!isSearchMode && hasMore && posts.length > 0 && (
        <div className="flex justify-center mt-6">
          <button
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-indigo-700 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative flex items-center space-x-3">
              {loadingMore ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  <span>Loading more posts...</span>
                </>
              ) : (
                <>
                  <span>Load More Posts</span>
                  <svg
                    className="w-5 h-5 transform group-hover:translate-y-0.5 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 14l-7 7m0 0l-7-7m7 7V3"
                    />
                  </svg>
                </>
              )}
            </div>
          </button>
        </div>
      )}

      {/* Bottom spacing */}
      <div className="h-8"></div>
    </div>
  );
};

export default Timeline;
