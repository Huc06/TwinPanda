"use client";

import { ReactNode } from "react";
import { Card, CardContent } from "./card";
import { Button } from "./button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

interface ActionCardProps {
  title: string;
  subtitle: string;
  icon: ReactNode;
  iconColor?: string;
  buttonText: string;
  buttonColor?: string;
  href: string;
  className?: string;
}

export function ActionCard({
  title,
  subtitle,
  icon,
  iconColor = "text-purple-400",
  buttonText,
  buttonColor = "bg-purple-600 hover:bg-purple-700",
  href,
  className,
}: ActionCardProps) {
  return (
    <Card
      className={`bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-colors ${
        className || ""
      }`}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-slate-300 text-sm">{subtitle}</p>
            <p className="text-white font-semibold">{title}</p>
          </div>
          <div className={`w-8 h-8 ${iconColor}`}>{icon}</div>
        </div>
        <Link href={href}>
          <Button className={`w-full mt-4 ${buttonColor}`}>
            {buttonText}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
