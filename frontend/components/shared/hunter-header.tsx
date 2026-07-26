"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface HunterHeaderProps {
  title: string;
  className?: string;
  onBack?: () => void;
  showBack?: boolean;
}

export function HunterHeader({ title, className, onBack, showBack = true }: HunterHeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <header className={cn("flex items-center mb-6 pt-[env(safe-area-inset-top)]", className)}>
      {showBack && (
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handleBack} 
          className="mr-2 hover:bg-zinc-800"
        >
          <ChevronLeft className="w-6 h-6" />
        </Button>
      )}
      <h1 className="text-xl font-black italic tracking-tighter uppercase">{title}</h1>
    </header>
  );
}
