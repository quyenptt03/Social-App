import React from "react";

interface AvatarProps {
  initials: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const Avatar: React.FC<AvatarProps> = ({
  initials,
  size = "md",
  className = "",
}) => {
  const sizeClasses = {
    sm: "w-8 h-8 text-sm",
    md: "w-10 h-10 text-base",
    lg: "w-12 h-12 text-lg",
  };

  return (
    <div
      className={`${sizeClasses[size]} bg-blue-500 text-white rounded-full flex items-center justify-center font-medium ${className}`}
    >
      {initials}
    </div>
  );
};

export default Avatar;
