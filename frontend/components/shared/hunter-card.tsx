"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface HunterCardProps {
  children: ReactNode;
  className?: string;
  title?: string;
  description?: string;
  headerAction?: ReactNode;
  variant?: 'default' | 'penalty' | 'side' | 'system' | 'looks';
}

export function HunterCard({ children, className, title, description, headerAction, variant = 'default' }: HunterCardProps) {
  const variants = {
    default: "bg-zinc-900/40 border-zinc-800",
    penalty: "bg-red-900/10 border-red-600 shadow-red-900/20",
    side: "bg-amber-900/10 border-amber-500 shadow-amber-900/20",
    system: "bg-zinc-900/40 border-primary shadow-primary/5",
    looks: "bg-zinc-900/40 border-cyan-500/20"
  };

  return (
    <Card className={cn("glass-card border transition-all duration-500 shadow-2xl overflow-hidden", variants[variant], className)}>
      {(title || headerAction) && (
        <CardHeader className="pb-4">
          <div className="flex justify-between items-start">
            <div>
              {title && <CardTitle className="text-xl font-bold italic tracking-tight">{title}</CardTitle>}
              {description && <CardDescription className="text-zinc-500">{description}</CardDescription>}
            </div>
            {headerAction && <div className="shrink-0">{headerAction}</div>}
          </div>
        </CardHeader>
      )}
      <CardContent className={cn("p-6", (title || headerAction) ? "pt-0" : "")}>
        {children}
      </CardContent>
    </Card>
  );
}
