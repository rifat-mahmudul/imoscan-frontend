"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ModeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  if (!mounted) {
    return (
      <button
        className="relative h-10 w-10 rounded-full border border-border bg-background p-2 md:h-12 md:w-12"
        aria-label="Toggle theme"
      >
        <div className="relative h-full w-full">
          <div className="h-full w-full" />
        </div>
      </button>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className="relative h-8 w-8 rounded-full border border-border bg-background p-2 transition-all hover:bg-accent md:h-10 md:w-10"
      aria-label="Toggle theme"
    >
      <div className="relative h-full w-full">
        <Sun
          className={`absolute inset-0 h-full w-full transition-all duration-300 ${
            theme === "dark"
              ? "rotate-90 scale-0 opacity-0"
              : "rotate-0 scale-100 opacity-100"
          }`}
        />
        <Moon
          className={`absolute inset-0 h-full w-full transition-all duration-300 ${
            theme === "dark"
              ? "rotate-0 scale-100 opacity-100"
              : "-rotate-90 scale-0 opacity-0"
          }`}
        />
      </div>
      <span className="sr-only">Toggle theme</span>
    </button>
  );
}
