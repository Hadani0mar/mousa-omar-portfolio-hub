
import React, { useState, useEffect } from 'react';
import { Bell, X, Info, AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { supabase } from '@/integrations/supabase/client';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  expires_at: string;
  created_at: string;
}

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'success':
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case 'warning':
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    case 'error':
      return <AlertCircle className="h-4 w-4 text-red-500" />;
    default:
      return <Info className="h-4 w-4 text-blue-500" />;
  }
};

const getNotificationBadgeVariant = (type: string): "default" | "secondary" | "destructive" | "outline" => {
  switch (type) {
    case 'success':
      return 'default';
    case 'warning':
      return 'secondary';
    case 'error':
      return 'destructive';
    default:
      return 'outline';
  }
};

export default function NotificationsPopup() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(10);

      if (data) {
        setNotifications(data);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'الآن';
    if (diffInMinutes < 60) return `منذ ${diffInMinutes} دقيقة`;
    if (diffInMinutes < 1440) return `منذ ${Math.floor(diffInMinutes / 60)} ساعة`;
    return `منذ ${Math.floor(diffInMinutes / 1440)} يوم`;
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative h-8 w-8 smooth-interaction hover:bg-accent"
          title="الإشعارات"
        >
          <Bell className="h-4 w-4" />
          {notifications.length > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-4 w-4 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {notifications.length > 9 ? '9+' : notifications.length}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      
      <PopoverContent 
        className="w-80 max-w-[calc(100vw-2rem)] p-0 shadow-lg border"
        align="end"
        sideOffset={8}
      >
        <Card className="border-0 shadow-none">
          <CardHeader className="pb-3 bg-muted/50">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Bell className="h-4 w-4" />
                الإشعارات
              </CardTitle>
              <div className="flex items-center gap-2">
                {notifications.length > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {notifications.length}
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-0">
            {loading ? (
              <div className="p-6 text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                <p className="text-sm text-muted-foreground mt-2">جاري التحميل...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-6 text-center">
                <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                <p className="text-sm text-muted-foreground">لا توجد إشعارات جديدة</p>
              </div>
            ) : (
              <ScrollArea className="max-h-80">
                <div className="p-2 space-y-2">
                  {notifications.map((notification, index) => (
                    <div
                      key={notification.id}
                      className="p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer animate-fade-in smooth-interaction"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-0.5">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <h4 className="font-medium text-sm truncate">{notification.title}</h4>
                            <Badge 
                              variant={getNotificationBadgeVariant(notification.type)}
                              className="text-xs flex-shrink-0"
                            >
                              {notification.type}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                            {notification.message}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(notification.created_at)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
            
            {notifications.length > 0 && (
              <div className="p-3 border-t bg-muted/30">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full text-sm github-button"
                  onClick={loadNotifications}
                >
                  تحديث الإشعارات
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
}
