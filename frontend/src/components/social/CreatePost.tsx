"use client";

import React, { useState } from "react";
import { Post, CreatePostData } from "../../types/social";
import Avatar from "../ui/Avatar";
import { postApi } from "../../api/social/socialApi";
import { useUserStore } from "../../store/userStore";

interface CreatePostProps {
  onPostCreated: (post: Post) => void;
}

const CreatePost: React.FC<CreatePostProps> = ({ onPostCreated }) => {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useUserStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const currentUser = user;
    if (!content.trim() || !currentUser || isSubmitting) return;

    try {
      setIsSubmitting(true);
      const postData: CreatePostData = {
        content: content.trim(),
      };

      const response = await postApi.createPost(postData);
      onPostCreated(response.data.post);
      setContent("");
    } catch (error) {
      console.error("Failed to create post:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentUser = user;

  if (!currentUser) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6 text-center">
        <p className="text-gray-600">Please sign in to create a post.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6 shadow-sm">
      <form onSubmit={handleSubmit}>
        <div className="flex space-x-3">
          <Avatar
            initials={
              currentUser.full_name
                ? currentUser.full_name
                    .split(" ")
                    .map((n: string) => n[0])
                    .join("")
                    .toUpperCase()
                : "U"
            }
            size="md"
          />
          <div className="flex-1">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's on your mind?"
              rows={3}
              maxLength={1000}
              className="text-black w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-lg placeholder-gray-500"
            />

            <div className="flex justify-between items-center mt-3">
              <span className="text-sm text-gray-500">
                {content.length}/1000
              </span>

              <button
                type="submit"
                disabled={!content.trim() || isSubmitting}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {isSubmitting ? "Posting..." : "Post"}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreatePost;
