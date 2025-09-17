"use client";

import { ReactNode } from "react";
import { Card, CardContent, CardHeader } from "./card";

interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  iconColor?: string;
  className?: string;
}

export function FeatureCard({
  icon,
  title,
  description,
  iconColor = "text-purple-400",
  className,
}: FeatureCardProps) {
  return (
    <Card className={`bg-slate-800/30 border-slate-700 ${className || ""}`}>
      <CardHeader>
        <div className={`w-8 h-8 ${iconColor} mb-2`}>{icon}</div>
        <h3 className="text-white text-lg font-semibold">{title}</h3>
      </CardHeader>
      <CardContent>
        <p className="text-slate-300 text-sm">{description}</p>
      </CardContent>
    </Card>
  );
}
