"use client";

import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  message?: string;
  className?: string;
}

export function LoadingSpinner({
  size = "md",
  message,
  className,
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-16 w-16",
  };

  return (
    <div className={cn("flex items-center justify-center", className)}>
      <div className="text-white text-center">
        <div
          className={cn(
            "animate-spin rounded-full border-b-2 border-white mx-auto mb-4",
            sizeClasses[size]
          )}
        />
        {message && <p className="text-slate-300">{message}</p>}
      </div>
    </div>
  );
}
