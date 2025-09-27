"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Post as PostType } from "../../types/social";
import { postApi } from "../../api/social/socialApi";

interface SearchBoxProps {
  onSearchResults: (
    results: PostType[],
    isSearching: boolean,
    searchTerm: string
  ) => void;
  onClearSearch: () => void;
}

const SearchBox: React.FC<SearchBoxProps> = ({
  onSearchResults,
  onClearSearch,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isDebouncing, setIsDebouncing] = useState(false);

  // Debounce search to avoid too many API calls
  const debounceSearch = useCallback(
    (term: string) => {
      setIsDebouncing(true);
      const timeoutId = setTimeout(async () => {
        if (term.trim().length > 0) {
          try {
            setIsSearching(true);
            const response = await postApi.searchPosts(term.trim(), 1, 50);
            onSearchResults(response.data.posts, true, term);
          } catch (error) {
            console.error("Search failed:", error);
            onSearchResults([], true, term);
          } finally {
            setIsSearching(false);
          }
        } else {
          onClearSearch();
        }
        setIsDebouncing(false);
      }, 300);

      return () => clearTimeout(timeoutId);
    },
    [onSearchResults, onClearSearch]
  );

  useEffect(() => {
    const cleanup = debounceSearch(searchTerm);
    return cleanup;
  }, [searchTerm, debounceSearch]);

  const handleClearSearch = () => {
    setSearchTerm("");
    onClearSearch();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // The debounced search will handle the actual search
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4 shadow-sm w-full">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative flex items-center">
          <div className="absolute left-3 text-gray-400">
            <svg
              className="w-5 h-5"
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
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search posts by content or username..."
            className="w-full text-black pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
          />

          {(searchTerm || isSearching || isDebouncing) && (
            <div className="absolute right-3 flex items-center space-x-2">
              {(isSearching || isDebouncing) && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              )}

              {searchTerm && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  title="Clear search"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
            </div>
          )}
        </div>
      </form>
    </div>
  );
};

export default SearchBox;
