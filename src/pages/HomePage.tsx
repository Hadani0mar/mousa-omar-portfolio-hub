import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Phone, MapPin, Bell, X, MessageCircle, Terminal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/ThemeToggle';
import { SEO } from '@/components/SEO';
import { AIAssistant } from '@/components/AIAssistant';
import { ProjectSlider } from '@/components/ProjectSlider';
import { ProjectCard } from '@/components/ProjectCard';
import { supabase } from '@/integrations/supabase/client';

// Lazy load Analytics for better performance
const Analytics = lazy(() => 
  import('@vercel/analytics/react').then(module => ({ default: module.Analytics }))
);

interface Project {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  html_content: string;
  css_content?: string;
  js_content?: string;
  is_featured: boolean;
  display_order: number;
  project_status: string;
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

interface AdvancedSetting {
  setting_key: string;
  setting_value: string;
  setting_type: string;
}

interface Skill {
  id: string;
  name: string;
  display_order: number;
  is_active: boolean;
}

export default function HomePage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>({ show_terminal: true });
  const [advancedSettings, setAdvancedSettings] = useState<AdvancedSetting[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(false); // Changed to false for faster initial load
  const [showAIAssistant, setShowAIAssistant] = useState(false);

  useEffect(() => {
    // Load data without showing loading state for better UX
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load all data in parallel for better performance
      const [projectsRes, notificationsRes, settingsRes, advancedSettingsRes, skillsRes] = await Promise.all([
        supabase.from('projects').select('*').eq('project_status', 'active').order('display_order', { ascending: true }),
        supabase.from('notifications').select('*').gt('expires_at', new Date().toISOString()).order('created_at', { ascending: false }),
        supabase.from('site_config').select('*').single(),
        supabase.from('advanced_settings').select('*'),
        supabase.from('skills').select('*').eq('is_active', true).order('display_order', { ascending: true })
      ]);

      // Process results
      if (projectsRes.data) setProjects(projectsRes.data);
      
      if (notificationsRes.data) {
        const typedNotifications = notificationsRes.data.map(notification => ({
          ...notification,
          type: notification.type as 'info' | 'success' | 'warning'
        }));
        setNotifications(typedNotifications);
      }
      
      if (settingsRes.data) setSiteSettings({ show_terminal: settingsRes.data.show_terminal });
      if (advancedSettingsRes.data) setAdvancedSettings(advancedSettingsRes.data);
      if (skillsRes.data) setSkills(skillsRes.data);
      
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAdvancedSetting = (key: string, defaultValue: string = '') => {
    const setting = advancedSettings.find(s => s.setting_key === key);
    return setting ? setting.setting_value : defaultValue;
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
    return date.toLocaleDateString('en-GB', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const handleNotificationToggle = () => {
    if (!showNotifications) {
      markNotificationsAsRead();
    }
    setShowNotifications(!showNotifications);
  };

  const unreadNotifications = notifications.filter(notif => !notif.read);

  // Show simple loading only for data fetching, not blocking entire UI
  if (loading && projects.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <SEO />
        {/* Header */}
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto flex h-16 items-center justify-between px-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold text-blue-600 cursor-pointer">
                موسى عمر
              </h1>
            </div>
            <ThemeToggle />
          </div>
        </header>
        
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-sm text-muted-foreground">جاري التحميل...</p>
          </div>
        </div>
      </div>
    );
  }

  // Get dynamic settings
  const heroTitle = getAdvancedSetting('hero_title', 'مرحباً، أنا موسى عمر');
  const heroSubtitle = getAdvancedSetting('hero_subtitle', '  مطور مواقع ليبي متخصص  في تطوير واجهات المستخدم الحديثة والتفاعلية وانشاء مشاريع التخرج التقنية باحدث اطر العمل والاساليب');
  const projectsPerSlide = parseInt(getAdvancedSetting('projects_per_slide', '3'));
  const autoSlideInterval = parseInt(getAdvancedSetting('auto_slide_interval', '5000'));
  const showProjectSlider = getAdvancedSetting('show_project_slider', 'true') === 'true';
  const maxFeaturedProjects = parseInt(getAdvancedSetting('max_featured_projects', '6'));

  // Filter featured projects
  const featuredProjects = projects.filter(p => p.is_featured).slice(0, maxFeaturedProjects);
  const displayProjects = showProjectSlider ? projects : featuredProjects;

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="موسى عمر - مطور مواقع ليبي | أفضل خدمات تطوير المواقع في ليبيا"
        description="مطور مواقع ليبي محترف متخصص في React, Next.js, TypeScript. أقدم خدمات تطوير مواقع احترافية وحديثة في ليبيا. تواصل معي لتطوير موقعك الإلكتروني."
        keywords="مطور مواقع ليبيا, تطوير مواقع احترافية, React Developer Libya, Next.js Libya,Bn0marDev مطور ويب ليبي, برمجة مواقع ليبيا, موسى عمر"
        url="https://www.m0usa.ly/"
      />
      
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold text-blue-600 cursor-pointer">
              موسى عمر 
            </h1>
          </div>
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            {/* Terminal Link */}
            {siteSettings.show_terminal && (
              <Button variant="ghost" size="icon" asChild>
                <Link to="/terminal">
                  <Terminal className="h-5 w-5" />
                </Link>
              </Button>
            )}
            
            {/* Enhanced Notification Bell */}
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleNotificationToggle}
                className="relative transition-all duration-200 hover:scale-105"
                aria-label="عرض الإشعارات"
              >
                <Bell className="h-5 w-5" />
                {unreadNotifications.length > 0 && !showNotifications && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-xs text-white flex items-center justify-center animate-pulse min-w-[16px]">
                    {unreadNotifications.length > 9 ? '9+' : unreadNotifications.length}
                  </span>
                )}
              </Button>

              {/* Enhanced Responsive Notifications Dropdown */}
              {showNotifications && (
                <>
                  <div 
                    className="fixed inset-0 bg-black/20 z-40 md:hidden"
                    onClick={() => setShowNotifications(false)}
                  />
                  
                  <div className="absolute right-0 top-12 w-screen max-w-[calc(100vw-2rem)] sm:w-80 md:w-96 bg-background border rounded-lg shadow-lg z-50 max-h-[70vh] overflow-y-auto md:max-h-96 transform transition-all duration-200 animate-in slide-in-from-top-2">
                    <div className="p-4 border-b bg-card rounded-t-lg">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-lg">التحديثات</h3>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowNotifications(false)}
                          className="h-8 w-8 p-0 hover:bg-accent/50"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-muted-foreground">
                        <Bell className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>لا توجد تحديثات جديدة</p>
                      </div>
                    ) : (
                      <div className="space-y-1 p-2">
                        {notifications.map((notification) => (
                          <div key={notification.id} className="p-3 border rounded-lg relative bg-card hover:bg-accent/30 transition-all duration-200 group">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => dismissNotification(notification.id)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                            <div className="pr-8">
                              <h4 className="font-medium text-sm mb-1 line-clamp-2">{notification.title}</h4>
                              <p className="text-sm text-muted-foreground mb-3 line-clamp-3 whitespace-pre-wrap break-words">
                                {notification.message}
                              </p>
                              <div className="flex items-center justify-between text-xs">
                                <Badge 
                                  variant={
                                    notification.type === 'success' ? 'default' : 
                                    notification.type === 'warning' ? 'destructive' : 
                                    'secondary'
                                  } 
                                  className="text-xs px-2 py-0.5"
                                >
                                  {notification.type === 'info' ? 'معلومة' : notification.type === 'success' ? 'نجاح' : 'تحذير'}
                                </Badge>
                                <span className="text-muted-foreground">{formatDate(notification.created_at)}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
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
              {heroTitle.split(' ').map((word, index) => (
                <span key={index}>
                  {word === 'موسى' || word === 'عمر' ? (
                    <span className="text-blue-600">{word}</span>
                  ) : (
                    word
                  )}
                  {index < heroTitle.split(' ').length - 1 ? ' ' : ''}
                </span>
              ))}
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
              {heroSubtitle}
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

        {/* Enhanced Skills Section */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold text-center">المهارات التقنية</h2>
          <div className="flex flex-wrap justify-center gap-3">
            {skills.map((skill) => (
              <Badge key={skill.id} variant="secondary" className="text-sm px-3 py-1 hover:bg-accent transition-colors">
                {skill.name}
              </Badge>
            ))}
          </div>
        </section>

        {/* Projects Section */}
        <section className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold">
              {showProjectSlider ? 'جميع المشاريع' : 'المشاريع المميزة'}
            </h2>
            <p className="text-muted-foreground">
              مجموعة من مشاريع تخرج او قوالب من اعمالي متاحة للتنزيل مجانا
            </p>
          </div>

          {showProjectSlider ? (
            <ProjectSlider 
              projects={displayProjects}
              projectsPerSlide={projectsPerSlide}
              autoSlideInterval={autoSlideInterval}
              showAutoSlide={true}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
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
              بدء محادثة
            </a>
          </Button>
        </section>
      </main>

      {/* AI Assistant */}
      <AIAssistant 
        isOpen={showAIAssistant} 
        onToggle={() => setShowAIAssistant(!showAIAssistant)} 
      />

      {/* Lazy load Analytics */}
      <Suspense fallback={null}>
        <Analytics />
      </Suspense>
    </div>
  );
}
