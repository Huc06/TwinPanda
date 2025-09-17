"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn("flex items-center justify-center", className)}>
      <div className="text-center">
        {icon && <div className="mx-auto mb-6">{icon}</div>}
        <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
        {description && (
          <p className="text-slate-400 mb-6 max-w-md mx-auto">{description}</p>
        )}
        {action}
      </div>
    </div>
  );
}
