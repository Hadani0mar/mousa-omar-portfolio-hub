
import React from 'react';
import { Terminal, Bell, Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/components/ThemeProvider';
import { useNavigate } from 'react-router-dom';
import NotificationsPopup from './NotificationsPopup';

export function TopNavigationBar() {
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="flex items-center justify-between px-4 py-2">
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-semibold text-foreground">موسى عمر</h1>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/terminal')}
            className="h-8 w-8 text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
            title="الطرفية"
          >
            <Terminal className="h-4 w-4" />
          </Button>
          
          <NotificationsPopup />
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            className="h-8 w-8 text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
            title="تبديل النمط"
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>
        </div>
      </div>
    </div>
  );
}
