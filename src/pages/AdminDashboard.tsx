import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LogOut, BarChart3, FileText, Bell, Settings, Code, Globe, Package } from 'lucide-react';
import { ProjectForm } from '@/components/admin/ProjectForm';
import { NotificationForm } from '@/components/admin/NotificationForm';
import { SkillsManager } from '@/components/admin/SkillsManager';
import { TemplatesManager } from '@/components/admin/TemplatesManager';
import { WebsiteManager } from '@/components/admin/WebsiteManager';
import { TopNavigationBar } from '@/components/TopNavigationBar';
import { useToast } from '@/hooks/use-toast';

interface Statistics {
  projectsCount: number;
  templatesCount: number;
  websitesCount: number;
  notificationsCount: number;
  totalLikes: number;
  totalDownloads: number;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [statistics, setStatistics] = useState<Statistics>({
    projectsCount: 0,
    templatesCount: 0,
    websitesCount: 0,
    notificationsCount: 0,
    totalLikes: 0,
    totalDownloads: 0,
  });

  // Project form state
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [editingProject, setEditingProject] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [technologies, setTechnologies] = useState('');
  const [htmlContent, setHtmlContent] = useState('');
  const [cssContent, setCssContent] = useState('');
  const [jsContent, setJsContent] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [displayOrder, setDisplayOrder] = useState(0);
  const [projectStatus, setProjectStatus] = useState('active');

  // Notification form state
  const [showNotificationForm, setShowNotificationForm] = useState(false);
  const [notificationTitle, setNotificationTitle] = useState('');
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationType, setNotificationType] = useState<'info' | 'success' | 'warning'>('info');
  const [expirationHours, setExpirationHours] = useState('24');

  useEffect(() => {
    checkUser();
    loadStatistics();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/admin');
        return;
      }
      setUser(user);
    } catch (error) {
      console.error('Error checking user:', error);
      navigate('/admin');
    } finally {
      setLoading(false);
    }
  };

  const loadStatistics = async () => {
    try {
      // جلب إحصائيات المشاريع
      const { data: projects } = await supabase
        .from('projects')
        .select('*');

      // حساب المشاريع العادية والقوالب
      const regularProjects = projects?.filter(p => !p.is_template) || [];
      const templates = projects?.filter(p => p.is_template) || [];

      // حساب إجمالي الإعجابات والتنزيلات
      const totalLikes = projects?.reduce((sum, p) => sum + (p.like_count || 0), 0) || 0;
      const totalDownloads = projects?.reduce((sum, p) => sum + (p.download_count || 0), 0) || 0;

      // جلب عدد المواقع المنشورة
      const { data: websites } = await supabase
        .from('website_previews')
        .select('id')
        .eq('is_active', true);

      // جلب عدد الإشعارات النشطة
      const { data: notifications } = await supabase
        .from('notifications')
        .select('id')
        .gt('expires_at', new Date().toISOString());

      setStatistics({
        projectsCount: regularProjects.length,
        templatesCount: templates.length,
        websitesCount: websites?.length || 0,
        notificationsCount: notifications?.length || 0,
        totalLikes,
        totalDownloads,
      });
    } catch (error) {
      console.error('Error loading statistics:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: 'تم تسجيل الخروج',
        description: 'تم تسجيل خروجك بنجاح',
      });
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: 'خطأ',
        description: 'فشل في تسجيل الخروج',
        variant: 'destructive',
      });
    }
  };

  const handleProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const projectData = {
        title,
        description,
        technologies: technologies.split(',').map(t => t.trim()),
        html_content: htmlContent,
        css_content: cssContent,
        js_content: jsContent,
        is_featured: isFeatured,
        display_order: displayOrder,
        project_status: projectStatus,
        is_template: false
      };

      const { error } = await supabase
        .from('projects')
        .insert([projectData]);

      if (error) throw error;

      toast({
        title: 'نجح',
        description: 'تم حفظ المشروع بنجاح',
      });

      handleProjectCancel();
      loadStatistics();
    } catch (error) {
      console.error('Error saving project:', error);
      toast({
        title: 'خطأ',
        description: 'فشل في حفظ المشروع',
        variant: 'destructive',
      });
    }
  };

  const handleNotificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const expirationDate = new Date();
      expirationDate.setHours(expirationDate.getHours() + parseInt(expirationHours));

      const { error } = await supabase
        .from('notifications')
        .insert([{
          title: notificationTitle,
          message: notificationMessage,
          type: notificationType,
          expires_at: expirationDate.toISOString()
        }]);

      if (error) throw error;

      toast({
        title: 'نجح',
        description: 'تم نشر التحديث بنجاح',
      });

      handleNotificationCancel();
      loadStatistics();
    } catch (error) {
      console.error('Error creating notification:', error);
      toast({
        title: 'خطأ',
        description: 'فشل في نشر التحديث',
        variant: 'destructive',
      });
    }
  };

  const handleProjectCancel = () => {
    setShowProjectForm(false);
    setEditingProject(false);
    setTitle('');
    setDescription('');
    setTechnologies('');
    setHtmlContent('');
    setCssContent('');
    setJsContent('');
    setIsFeatured(false);
    setDisplayOrder(0);
    setProjectStatus('active');
  };

  const handleNotificationCancel = () => {
    setShowNotificationForm(false);
    setNotificationTitle('');
    setNotificationMessage('');
    setNotificationType('info');
    setExpirationHours('24');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <TopNavigationBar />
      
      <div className="pt-16">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">لوحة التحكم</h1>
              <p className="text-muted-foreground">مرحباً بك في لوحة إدارة الموقع</p>
            </div>
            <Button 
              onClick={handleSignOut}
              variant="outline"
              className="hover:bg-destructive hover:text-destructive-foreground"
            >
              <LogOut className="h-4 w-4 mr-2" />
              تسجيل الخروج
            </Button>
          </div>

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-6 lg:w-auto lg:grid-cols-6">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">نظرة عامة</span>
              </TabsTrigger>
              <TabsTrigger value="projects" className="flex items-center gap-2">
                <Code className="h-4 w-4" />
                <span className="hidden sm:inline">المشاريع</span>
              </TabsTrigger>
              <TabsTrigger value="templates" className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                <span className="hidden sm:inline">القوالب</span>
              </TabsTrigger>
              <TabsTrigger value="websites" className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                <span className="hidden sm:inline">المواقع</span>
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                <span className="hidden sm:inline">الإشعارات</span>
              </TabsTrigger>
              <TabsTrigger value="skills" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">المهارات</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">إجمالي المشاريع</CardTitle>
                    <Code className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{statistics.projectsCount}</div>
                    <p className="text-xs text-muted-foreground">المشاريع العادية المنشورة</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">القوالب الجاهزة</CardTitle>
                    <Package className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{statistics.templatesCount}</div>
                    <p className="text-xs text-muted-foreground">القوالب المتاحة للبيع</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">المواقع المنشورة</CardTitle>
                    <Globe className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{statistics.websitesCount}</div>
                    <p className="text-xs text-muted-foreground">المواقع النشطة</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">الإشعارات النشطة</CardTitle>
                    <Bell className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{statistics.notificationsCount}</div>
                    <p className="text-xs text-muted-foreground">الإشعارات المعروضة حالياً</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">إجمالي الإعجابات</CardTitle>
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{statistics.totalLikes}</div>
                    <p className="text-xs text-muted-foreground">على جميع المشاريع والقوالب</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">إجمالي التنزيلات</CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{statistics.totalDownloads}</div>
                    <p className="text-xs text-muted-foreground">للمشاريع والقوالب</p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="projects">
              <Card>
                <CardHeader>
                  <CardTitle>إدارة المشاريع</CardTitle>
                  <CardDescription>
                    إضافة وتعديل وحذف المشاريع المعروضة في الموقع
                  </CardDescription>
                  <Button onClick={() => setShowProjectForm(true)}>
                    إضافة مشروع جديد
                  </Button>
                </CardHeader>
                <CardContent>
                  <ProjectForm
                    showForm={showProjectForm}
                    editingProject={editingProject}
                    title={title}
                    setTitle={setTitle}
                    description={description}
                    setDescription={setDescription}
                    technologies={technologies}
                    setTechnologies={setTechnologies}
                    htmlContent={htmlContent}
                    setHtmlContent={setHtmlContent}
                    cssContent={cssContent}
                    setCssContent={setCssContent}
                    jsContent={jsContent}
                    setJsContent={setJsContent}
                    isFeatured={isFeatured}
                    setIsFeatured={setIsFeatured}
                    displayOrder={displayOrder}
                    setDisplayOrder={setDisplayOrder}
                    projectStatus={projectStatus}
                    setProjectStatus={setProjectStatus}
                    onSubmit={handleProjectSubmit}
                    onCancel={handleProjectCancel}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="templates">
              <TemplatesManager />
            </TabsContent>

            <TabsContent value="websites">
              <WebsiteManager />
            </TabsContent>

            <TabsContent value="notifications">
              <Card>
                <CardHeader>
                  <CardTitle>إدارة الإشعارات</CardTitle>
                  <CardDescription>
                    إنشاء وإدارة الإشعارات المعروضة للزوار
                  </CardDescription>
                  <Button onClick={() => setShowNotificationForm(true)}>
                    إضافة إشعار جديد
                  </Button>
                </CardHeader>
                <CardContent>
                  <NotificationForm
                    showForm={showNotificationForm}
                    title={notificationTitle}
                    setTitle={setNotificationTitle}
                    message={notificationMessage}
                    setMessage={setNotificationMessage}
                    type={notificationType}
                    setType={setNotificationType}
                    expirationHours={expirationHours}
                    setExpirationHours={setExpirationHours}
                    onSubmit={handleNotificationSubmit}
                    onCancel={handleNotificationCancel}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="skills">
              <Card>
                <CardHeader>
                  <CardTitle>إدارة المهارات</CardTitle>
                  <CardDescription>
                    إضافة وتعديل المهارات المعروضة في الصفحة الرئيسية
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <SkillsManager />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
