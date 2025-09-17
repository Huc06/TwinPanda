"use client";

import { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./card";

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: ReactNode;
  valueColor?: string;
  className?: string;
}

export function StatsCard({
  title,
  value,
  description,
  icon,
  valueColor = "text-white",
  className,
}: StatsCardProps) {
  return (
    <Card className={`bg-slate-800/50 border-slate-700 ${className || ""}`}>
      <CardHeader>
        <CardTitle className="text-white text-lg flex items-center gap-2">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className={`text-3xl font-bold mb-2 ${valueColor}`}>{value}</div>
        {description && <p className="text-slate-300 text-sm">{description}</p>}
      </CardContent>
    </Card>
  );
}
