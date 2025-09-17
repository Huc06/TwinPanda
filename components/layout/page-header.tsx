"use client";

import { ReactNode } from "react";
import { Button } from "../ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  actions?: ReactNode;
  backHref?: string;
  backLabel?: string;
}

export function PageHeader({
  title,
  description,
  icon,
  actions,
  backHref,
  backLabel = "Back",
}: PageHeaderProps) {
  return (
    <div className="flex items-center gap-4 mb-8">
      {backHref && (
        <Link href={backHref}>
          <Button variant="ghost" size="sm" className="text-white">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {backLabel}
          </Button>
        </Link>
      )}
      <div className="flex-1">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          {icon}
          {title}
        </h1>
        {description && <p className="text-slate-300">{description}</p>}
      </div>
      {actions}
    </div>
  );
}
