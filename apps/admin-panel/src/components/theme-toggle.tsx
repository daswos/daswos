import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/providers/theme-provider";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="w-8 h-8 p-0 fixed top-4 left-4 z-50 bg-transparent rounded-full flex items-center justify-center"
    >
      {theme === "dark" ? (
        <Sun className="h-4 w-4 text-gray-400" />
      ) : (
        <Moon className="h-4 w-4 text-gray-400" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}