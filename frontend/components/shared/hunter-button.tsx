"use client";

import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface HunterButtonProps extends Omit<ButtonProps, 'variant'> {
  glow?: boolean;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | "hunter";
}

export function HunterButton({ className, glow, variant = "default", ...props }: HunterButtonProps) {
  const isHunter = variant === "hunter";
  
  return (
    <Button
      variant={isHunter ? "default" : variant}
      className={cn(
        "font-black italic tracking-tighter uppercase transition-all duration-300",
        isHunter && "bg-primary hover:bg-primary/90 text-black",
        glow && "shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_25px_rgba(139,92,246,0.5)]",
        className
      )}
      {...props}
    />
  );
}
