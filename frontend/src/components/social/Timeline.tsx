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
        <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading timeline...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
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
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-blue-900">
                Search Results for "{currentSearchTerm}"
              </h3>
              <p className="text-sm text-blue-700">
                {searchResults.length}{" "}
                {searchResults.length === 1 ? "post" : "posts"} found
              </p>
            </div>
            <button
              onClick={handleClearSearch}
              className="text-blue-600 hover:text-blue-800 font-medium text-sm"
            >
              Back to Timeline
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
            {loadingMore ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Loading...</span>
              </div>
            ) : (
              "Load More Posts"
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default Timeline;
