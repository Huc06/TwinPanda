"use client";

import { ReactNode } from "react";
import { useAuth, UserRole } from "@/contexts/auth-context";
import { PageLayout } from "./page-layout";
import { LoadingSpinner } from "../ui/loading-spinner";
import { EmptyState } from "../ui/empty-state";
import { AlertTriangle, Wallet } from "lucide-react";
import { Button } from "../ui/button";
import Link from "next/link";

interface AuthGuardProps {
  children: ReactNode;
  roles?: UserRole[];
  showLoading?: boolean;
}

export function AuthGuard({
  children,
  roles,
  showLoading = true,
}: AuthGuardProps) {
  const { user, isAuthenticated, isLoading, hasRole } = useAuth();

  // Show loading state
  if (isLoading && showLoading) {
    return (
      <PageLayout>
        <LoadingSpinner
          message="Please sign the message in your wallet to authenticate..."
          className="min-h-[60vh]"
        />
      </PageLayout>
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    return (
      <PageLayout>
        <div className="max-w-2xl mx-auto">
          <EmptyState
            icon={<Wallet className="w-16 h-16" />}
            title={isLoading ? "Authenticating..." : "Authentication Required"}
            description={
              isLoading
                ? "Please sign the message in your wallet to authenticate..."
                : "Please connect your wallet using the navbar to continue"
            }
            className="min-h-[60vh]"
          />
        </div>
      </PageLayout>
    );
  }

  // Check role permissions
  if (roles && !hasRole(roles)) {
    return (
      <PageLayout>
        <div className="max-w-2xl mx-auto">
          <EmptyState
            icon={<AlertTriangle className="w-16 h-16 text-yellow-400" />}
            title="Access Denied"
            description={`You need ${roles.join(
              " or "
            )} privileges to access this page`}
            action={
              <Link href="/dashboard">
                <Button variant="outline">Back to Dashboard</Button>
              </Link>
            }
            className="min-h-[60vh]"
          />
        </div>
      </PageLayout>
    );
  }

  return <>{children}</>;
}
