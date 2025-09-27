"use client";

import React, { useState, useEffect, useRef } from "react";
import { Post as PostType, Comment } from "../../types/social";
import Avatar from "../ui/Avatar";
import CommentSection from "./CommentSection";
import ConfirmationModal from "../ui/ConfirmationModal";
import { commentApi, postApi } from "../../api/social/socialApi";
import { useUserStore } from "../../store/userStore";

interface PostProps {
  post: PostType;
  onPostUpdate?: (updatedPost: PostType) => void;
  onPostDelete?: (postId: string) => void;
}

const Post: React.FC<PostProps> = ({ post, onPostUpdate, onPostDelete }) => {
  const [isCommentsExpanded, setIsCommentsExpanded] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentLoading, setCommentLoading] = useState(false);
  const [commentPage, setCommentPage] = useState(1);
  const [hasMoreComments, setHasMoreComments] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { user } = useUserStore();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDropdown]);

  const formatDate = (dateString: Date) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800)
      return `${Math.floor(diffInSeconds / 86400)}d ago`;

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  };

  const loadComments = async () => {
    if (commentLoading) return;

    try {
      setCommentLoading(true);
      const response = await commentApi.getCommentsByPostId(
        post.id,
        commentPage,
        10
      );

      if (commentPage === 1) {
        setComments(response.data.comments);
      } else {
        setComments((prev) => [...prev, ...response.data.comments]);
      }

      setHasMoreComments(response.data.pagination.hasMore);
    } catch (error) {
      console.error("Failed to load comments:", error);
    } finally {
      setCommentLoading(false);
    }
  };

  const handleToggleComments = () => {
    // Don't allow comment interactions on deleted posts
    if (post.is_deleted) {
      return;
    }

    setIsCommentsExpanded(!isCommentsExpanded);

    if (!isCommentsExpanded && comments.length === 0) {
      loadComments();
    }
  };

  const handleLoadMoreComments = () => {
    setCommentPage((prev) => prev + 1);
    loadComments();
  };

  const handleCommentAdded = (newComment: Comment) => {
    setComments((prev) => [newComment, ...prev]);
    // Update post comment count
    if (onPostUpdate) {
      const updatedPost = {
        ...post,
        comment_count: (post.comment_count || 0) + 1,
      };
      onPostUpdate(updatedPost);
    }
  };

  const handleCommentDeleted = (commentId: string) => {
    setComments((prev) => prev.filter((comment) => comment.id !== commentId));
    // Update post comment count
    if (onPostUpdate) {
      const updatedPost = {
        ...post,
        comment_count: Math.max((post.comment_count || 0) - 1, 0),
      };
      onPostUpdate(updatedPost);
    }
  };

  const handleCommentUpdated = (updatedComment: Comment) => {
    setComments((prev) =>
      prev.map((comment) =>
        comment.id === updatedComment.id ? updatedComment : comment
      )
    );
  };

  // Handle nested user structure from store
  const currentUser = user;
  const canEditPost =
    currentUser &&
    !post.is_deleted &&
    (currentUser.id === post.user_id || currentUser.role === "admin");
  const canDeletePost =
    currentUser &&
    !post.is_deleted &&
    (currentUser.id === post.user_id || currentUser.role === "admin");

  const handleEditPost = () => {
    setIsEditing(true);
    setEditContent(post.content);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditContent(post.content);
  };

  const handleUpdatePost = async () => {
    if (!editContent.trim() || isUpdating) return;

    try {
      setIsUpdating(true);
      const response = await postApi.updatePost(post.id, {
        content: editContent.trim(),
      });

      if (onPostUpdate) {
        onPostUpdate(response.data.post);
      }
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update post:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeletePost = () => {
    setShowDeleteModal(true);
  };

  const confirmDeletePost = () => {
    if (!canDeletePost || !onPostDelete) return;

    onPostDelete(post.id);
    setShowDeleteModal(false);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4 shadow-sm">
      {/* Post Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <Avatar initials={post.avatar_initials || "U"} size="md" />
          <div>
            <h3 className="font-semibold text-gray-900">
              {post.display_name || post.full_name || post.username}
            </h3>
            <p className="text-sm text-gray-500">
              @{post.username} · {formatDate(post.created_at)}
              {post.updated_at &&
                new Date(post.updated_at).getTime() !==
                  new Date(post.created_at).getTime() && (
                  <span className="ml-2 text-xs text-gray-400">
                    · edited
                    {post.edited_by && post.edited_by !== post.user_id && (
                      <span className="text-blue-600"> by admin</span>
                    )}
                  </span>
                )}
            </p>
          </div>
        </div>

        {(canEditPost || canDeletePost) && (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-full hover:bg-gray-100"
              title="More options"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
              </svg>
            </button>

            {showDropdown && (
              <div className="absolute right-0 top-8 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                <div className="py-1">
                  {canEditPost && !isEditing && (
                    <button
                      onClick={() => {
                        handleEditPost();
                        setShowDropdown(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
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
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                      <span>Edit Post</span>
                    </button>
                  )}

                  {canDeletePost && (
                    <button
                      onClick={() => {
                        handleDeletePost();
                        setShowDropdown(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>Delete Post</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Post Content */}
      <div className="mb-4">
        {/* Deleted Badge */}
        {post.is_deleted && currentUser?.role === "admin" && (
          <div className="mb-3">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
              <svg
                className="w-3 h-3 mr-1"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              Deleted
              {post.deleted_at && (
                <span className="ml-1 text-xs">
                  on {new Date(post.deleted_at).toLocaleDateString()}
                </span>
              )}
            </span>
          </div>
        )}

        {isEditing ? (
          <div className="space-y-3">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              placeholder="What's on your mind?"
              rows={3}
              maxLength={1000}
              className="text-black w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">
                {editContent.length}/1000
              </span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleCancelEdit}
                  disabled={isUpdating}
                  className="px-3 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdatePost}
                  disabled={!editContent.trim() || isUpdating}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isUpdating ? "Updating..." : "Update"}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div
            className={`${
              post.is_deleted && currentUser?.role === "admin"
                ? "opacity-60"
                : ""
            }`}
          >
            <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
              {post.content}
            </p>
          </div>
        )}
      </div>

      {/* Post Actions */}
      <div className="flex items-center space-x-4 pt-2 border-t border-gray-100">
        <button
          onClick={handleToggleComments}
          disabled={post.is_deleted}
          className={`flex items-center space-x-2 transition-colors ${
            post.is_deleted
              ? "text-gray-400 cursor-not-allowed"
              : "text-gray-600 hover:text-blue-600"
          }`}
          title={
            post.is_deleted
              ? "Comments are disabled for deleted posts"
              : "View comments"
          }
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
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          <span className="text-sm">
            {post.comment_count || 0}{" "}
            {(post.comment_count || 0) === 1 ? "comment" : "comments"}
          </span>
          {post.is_deleted && (
            <svg
              className="w-4 h-4 text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728"
              />
            </svg>
          )}
        </button>
      </div>

      {/* Comment Section */}
      {isCommentsExpanded && !post.is_deleted && (
        <CommentSection
          postId={post.id}
          comments={comments}
          loading={commentLoading}
          hasMore={hasMoreComments}
          onCommentAdded={handleCommentAdded}
          onCommentDeleted={handleCommentDeleted}
          onCommentUpdated={handleCommentUpdated}
          onLoadMore={handleLoadMoreComments}
        />
      )}

      {/* Deleted Post Comment Notice */}
      {isCommentsExpanded && post.is_deleted && (
        <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="flex items-center space-x-2 text-gray-600">
            <svg
              className="w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="text-sm">
              Comments are not available for deleted posts.
            </span>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        title="Delete Post"
        message="Are you sure you want to delete this post? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        confirmVariant="danger"
        onConfirm={confirmDeletePost}
        onCancel={() => setShowDeleteModal(false)}
      />
    </div>
  );
};

export default Post;
