
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Facebook, ExternalLink, Phone, MapPin, Bell, X, MessageCircle, Terminal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/ThemeToggle';
import { supabase } from '@/integrations/supabase/client';

interface Project {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  html_content: string;
  css_content?: string;
  js_content?: string;
  is_featured: boolean;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning';
  expires_at: string;
  created_at: string;
  read?: boolean;
}

interface SiteSettings {
  show_terminal: boolean;
}

export default function HomePage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>({ show_terminal: true });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load projects
      const { data: projectsData } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (projectsData) {
        setProjects(projectsData);
      }

      // Load active notifications
      const { data: notificationsData } = await supabase
        .from('notifications')
        .select('*')
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (notificationsData) {
        // تحويل النوع إلى النوع المطلوب
        const typedNotifications = notificationsData.map(notification => ({
          ...notification,
          type: notification.type as 'info' | 'success' | 'warning'
        }));
        setNotifications(typedNotifications);
      }

      // Load site settings
      const { data: settingsData } = await supabase
        .from('site_config')
        .select('*')
        .single();

      if (settingsData) {
        setSiteSettings({ show_terminal: settingsData.show_terminal });
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const markNotificationsAsRead = () => {
    setNotifications(notifications.map(notif => ({ ...notif, read: true })));
  };

  const dismissNotification = (id: string) => {
    setNotifications(notifications.filter(notif => notif.id !== id));
  };

  const createWhatsAppLink = (message: string) => {
    const phoneNumber = "+218931303032";
    const encodedMessage = encodeURIComponent(message);
    return `https://wa.me/${phoneNumber.replace('+', '')}?text=${encodedMessage}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const handleNotificationToggle = () => {
    if (!showNotifications) {
      markNotificationsAsRead();
    }
    setShowNotifications(!showNotifications);
  };

  const unreadNotifications = notifications.filter(notif => !notif.read);

  const skills = [
    'Next.js', 'React.js', 'HTML', 'CSS', 'JavaScript', 'TypeScript',
    'Tailwind CSS', 'Node.js', 'Git', 'Responsive Design'
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">جاري تحميل المحتوى...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent cursor-pointer">
              موسى عمر
            </h1>
          </div>
          <div className="flex items-center space-x-2">
            {/* Terminal Link */}
            {siteSettings.show_terminal && (
              <Button variant="ghost" size="icon" asChild>
                <Link to="/terminal">
                  <Terminal className="h-5 w-5" />
                </Link>
              </Button>
            )}
            
            {/* Notification Bell */}
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleNotificationToggle}
                className="relative"
              >
                <Bell className="h-5 w-5" />
                {unreadNotifications.length > 0 && !showNotifications && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-xs text-white flex items-center justify-center animate-pulse">
                    {unreadNotifications.length}
                  </span>
                )}
              </Button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 top-12 w-72 sm:w-80 md:w-96 bg-background border rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
                  <div className="p-4 border-b">
                    <h3 className="font-semibold">التحديثات</h3>
                  </div>
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-muted-foreground">
                      لا توجد تحديثات جديدة
                    </div>
                  ) : (
                    <div className="space-y-2 p-2">
                      {notifications.map((notification) => (
                        <div key={notification.id} className="p-3 border rounded-lg relative bg-card hover:bg-accent/50 transition-colors">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-1 right-1 h-6 w-6"
                            onClick={() => dismissNotification(notification.id)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                          <div className="pr-8">
                            <h4 className="font-medium text-sm mb-1">{notification.title}</h4>
                            <p className="text-sm text-muted-foreground mb-2">{notification.message}</p>
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <Badge variant={notification.type === 'success' ? 'default' : notification.type === 'warning' ? 'destructive' : 'secondary'} className="text-xs">
                                {notification.type === 'info' ? 'معلومة' : notification.type === 'success' ? 'نجاح' : 'تحذير'}
                              </Badge>
                              <span>{formatDate(notification.created_at)}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-16">
        {/* Hero Section */}
        <section className="text-center space-y-6 py-12">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              مرحباً، أنا <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">موسى عمر</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
              مطور مواقع ليبي متخصص في تطوير واجهات المستخدم الحديثة والتفاعلية
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="lg">
              <a href={createWhatsAppLink("مرحباً موسى، أود التواصل معك حول مشروع")}>
                <MessageCircle className="h-5 w-5 mr-2" />
                بدء محادثة
              </a>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <a href="https://www.facebook.com/mousa.0mar" target="_blank" rel="noopener noreferrer">
                <Facebook className="h-5 w-5 mr-2" />
                Facebook
              </a>
            </Button>
          </div>

          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>ليبيا</span>
          </div>
        </section>

        {/* Skills Section */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold text-center">المهارات التقنية</h2>
          <div className="flex flex-wrap justify-center gap-3">
            {skills.map((skill) => (
              <Badge key={skill} variant="secondary" className="text-sm px-3 py-1">
                {skill}
              </Badge>
            ))}
          </div>
        </section>

        {/* Featured Projects */}
        <section className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold">المشاريع المميزة</h2>
            <p className="text-muted-foreground">
              مجموعة من أحدث أعمالي في تطوير المواقع والتطبيقات
            </p>
          </div>

          {projects.length === 0 ? (
            <Card className="text-center p-12">
              <CardContent>
                <p className="text-muted-foreground">لا توجد مشاريع متاحة حالياً</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <Card key={project.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{project.title}</CardTitle>
                      {project.is_featured && (
                        <Badge variant="default">مميز</Badge>
                      )}
                    </div>
                    <CardDescription className="line-clamp-3">
                      {project.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      {project.technologies.slice(0, 3).map((tech) => (
                        <Badge key={tech} variant="outline" className="text-xs">
                          {tech}
                        </Badge>
                      ))}
                      {project.technologies.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{project.technologies.length - 3}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      <Button asChild size="sm" className="flex-1">
                        <Link to={`/project/${project.id}`}>
                          عرض مباشر
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <a href={createWhatsAppLink(`مرحباً موسى، أود طلب مشروع مثل: ${project.title}`)}>
                          <MessageCircle className="h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* Contact Section */}
        <section className="text-center space-y-6 py-12">
          <h2 className="text-3xl font-bold">هل لديك مشروع؟</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            أحب العمل على المشاريع المثيرة والتحديات التقنية الجديدة. 
            تواصل معي ولنناقش كيف يمكنني مساعدتك في تحقيق أهدافك.
          </p>
          <Button asChild size="lg">
            <a href={createWhatsAppLink("مرحباً موسى، أود التواصل معك حول مشروع")}>
              بدء محادثе
            </a>
          </Button>
        </section>
      </main>
    </div>
  );
}
