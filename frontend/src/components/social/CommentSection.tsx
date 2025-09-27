"use client";

import React, { useState, useEffect, useRef } from "react";
import { Comment, CreateCommentData } from "../../types/social";
import Avatar from "../ui/Avatar";
import ConfirmationModal from "../ui/ConfirmationModal";
import { commentApi } from "../../api/social/socialApi";
import { useUserStore } from "../../store/userStore";

interface CommentSectionProps {
  postId: string;
  comments: Comment[];
  loading: boolean;
  hasMore: boolean;
  onCommentAdded: (comment: Comment) => void;
  onCommentDeleted: (commentId: string) => void;
  onCommentUpdated?: (updatedComment: Comment) => void;
  onLoadMore: () => void;
}

const CommentSection: React.FC<CommentSectionProps> = ({
  postId,
  comments,
  loading,
  hasMore,
  onCommentAdded,
  onCommentDeleted,
  onCommentUpdated,
  onLoadMore,
}) => {
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [dropdownCommentId, setDropdownCommentId] = useState<string | null>(
    null
  );
  const [deleteCommentId, setDeleteCommentId] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user } = useUserStore();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownCommentId(null);
      }
    };

    if (dropdownCommentId) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownCommentId]);

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

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();

    const currentUser = user;
    if (!newComment.trim() || !currentUser || isSubmitting) return;

    try {
      setIsSubmitting(true);
      const commentData: CreateCommentData = {
        post_id: postId,
        content: newComment.trim(),
      };

      const response = await commentApi.createComment(commentData);
      onCommentAdded(response.data.comment);
      setNewComment("");
    } catch (error) {
      console.error("Failed to create comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditComment = (comment: Comment) => {
    setEditingCommentId(comment.id);
    setEditingContent(comment.content);
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditingContent("");
  };

  const handleUpdateComment = async (commentId: string) => {
    if (!editingContent.trim() || isUpdating) return;

    try {
      setIsUpdating(true);
      const response = await commentApi.updateComment(commentId, {
        content: editingContent.trim(),
      });

      if (onCommentUpdated) {
        onCommentUpdated(response.data.comment);
      }
      setEditingCommentId(null);
      setEditingContent("");
    } catch (error) {
      console.error("Failed to update comment:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteComment = (commentId: string) => {
    setDeleteCommentId(commentId);
  };

  const confirmDeleteComment = async () => {
    if (!deleteCommentId) return;

    try {
      await commentApi.deleteComment(deleteCommentId);
      onCommentDeleted(deleteCommentId);
    } catch (error) {
      console.error("Failed to delete comment:", error);
    } finally {
      setDeleteCommentId(null);
    }
  };

  const canEditComment = (comment: Comment) => {
    const currentUser = user;
    return (
      currentUser &&
      (currentUser.id === comment.user_id || currentUser.role === "admin")
    );
  };

  const canDeleteComment = (comment: Comment) => {
    const currentUser = user;
    return (
      currentUser &&
      (currentUser.id === comment.user_id || currentUser.role === "admin")
    );
  };

  const currentUser = user;

  return (
    <div className="mt-4 pt-4 border-t border-gray-100">
      {/* Comment Form */}
      {currentUser && (
        <form onSubmit={handleSubmitComment} className="mb-4">
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
              size="sm"
            />
            <div className="flex-1">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                rows={2}
                maxLength={500}
                className="w-full px-3 py-2 text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
              <div className="flex justify-between items-center mt-2">
                <span className="text-xs text-gray-500">
                  {newComment.length}/500
                </span>
                <button
                  type="submit"
                  disabled={!newComment.trim() || isSubmitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? "Posting..." : "Comment"}
                </button>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* Comments List */}
      <div className="space-y-3">
        {comments.map((comment) => (
          <div key={comment.id} className="flex space-x-3">
            <Avatar initials={comment.avatar_initials || "U"} size="sm" />
            <div className="flex-1 bg-gray-50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-sm text-gray-900">
                    {comment.display_name ||
                      comment.full_name ||
                      comment.username}
                  </span>
                  <span className="text-xs text-gray-500">
                    {formatDate(comment.created_at)}
                    {comment.updated_at &&
                      new Date(comment.updated_at).getTime() !==
                        new Date(comment.created_at).getTime() && (
                        <span className="ml-1 text-xs text-gray-400">
                          · edited
                          {comment.edited_by &&
                            comment.edited_by !== comment.user_id && (
                              <span className="text-blue-600"> by admin</span>
                            )}
                        </span>
                      )}
                  </span>
                </div>

                {(canEditComment(comment) || canDeleteComment(comment)) && (
                  <div
                    className="relative"
                    ref={dropdownCommentId === comment.id ? dropdownRef : null}
                  >
                    <button
                      onClick={() =>
                        setDropdownCommentId(
                          dropdownCommentId === comment.id ? null : comment.id
                        )
                      }
                      className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
                      title="More options"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                      </svg>
                    </button>

                    {dropdownCommentId === comment.id && (
                      <div className="absolute right-0 top-6 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                        <div className="py-1">
                          {canEditComment(comment) &&
                            editingCommentId !== comment.id && (
                              <button
                                onClick={() => {
                                  handleEditComment(comment);
                                  setDropdownCommentId(null);
                                }}
                                className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                              >
                                <svg
                                  className="w-3 h-3"
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
                                <span>Edit</span>
                              </button>
                            )}

                          {canDeleteComment(comment) && (
                            <button
                              onClick={() => {
                                handleDeleteComment(comment.id);
                                setDropdownCommentId(null);
                              }}
                              className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                            >
                              <svg
                                className="w-3 h-3"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              <span>Delete</span>
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {editingCommentId === comment.id ? (
                <div className="space-y-2 mt-2">
                  <textarea
                    value={editingContent}
                    onChange={(e) => setEditingContent(e.target.value)}
                    rows={2}
                    maxLength={500}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      {editingContent.length}/500
                    </span>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={handleCancelEdit}
                        disabled={isUpdating}
                        className="px-2 py-1 text-xs text-gray-600 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleUpdateComment(comment.id)}
                        disabled={!editingContent.trim() || isUpdating}
                        className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {isUpdating ? "Updating..." : "Update"}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  {/* Deleted Badge for Comments */}
                  {comment.is_deleted && currentUser?.role === "admin" && (
                    <div className="mb-2">
                      <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-700">
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
                      </span>
                    </div>
                  )}
                  <p
                    className={`text-sm text-gray-800 whitespace-pre-wrap ${
                      comment.is_deleted && currentUser?.role === "admin"
                        ? "opacity-60"
                        : ""
                    }`}
                  >
                    {comment.content}
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Loading More Comments */}
      {loading && (
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* Load More Button */}
      {hasMore && !loading && comments.length > 0 && (
        <div className="flex justify-center mt-4">
          <button
            onClick={onLoadMore}
            className="text-blue-600 hover:text-blue-700 font-medium text-sm"
          >
            Load more comments
          </button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!deleteCommentId}
        title="Delete Comment"
        message="Are you sure you want to delete this comment? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        confirmVariant="danger"
        onConfirm={confirmDeleteComment}
        onCancel={() => setDeleteCommentId(null)}
      />
    </div>
  );
};

export default CommentSection;
