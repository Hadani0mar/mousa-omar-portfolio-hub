import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Settings, 
  Code, 
  Bell, 
  Globe, 
  Users, 
  BarChart3, 
  Plus, 
  Edit, 
  Trash2, 
  Save,
  Eye,
  Monitor,
  ExternalLink
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { ProjectForm } from '@/components/admin/ProjectForm';
import { NotificationForm } from '@/components/admin/NotificationForm';
import { SkillsManager } from '@/components/admin/SkillsManager';

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
  created_at: string;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  expires_at: string;
  created_at: string;
}

interface WebsitePreview {
  id: string;
  title: string;
  description: string;
  url: string;
  screenshot_url?: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
}

export default function AdminDashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [websites, setWebsites] = useState<WebsitePreview[]>([]);
  const [loading, setLoading] = useState(true);
  
  // AI Settings
  const [systemPrompt, setSystemPrompt] = useState('');
  const [weeklyInstructions, setWeeklyInstructions] = useState('');
  const [monthlyInstructions, setMonthlyInstructions] = useState('');
  const [modelName, setModelName] = useState('gemini');
  
  // Site Settings
  const [showTerminal, setShowTerminal] = useState(true);
  
  // Forms
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [showNotificationForm, setShowNotificationForm] = useState(false);
  const [showWebsiteForm, setShowWebsiteForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  
  // Project Form States
  const [projectTitle, setProjectTitle] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [projectTechnologies, setProjectTechnologies] = useState('');
  const [projectHtmlContent, setProjectHtmlContent] = useState('');
  const [projectCssContent, setProjectCssContent] = useState('');
  const [projectJsContent, setProjectJsContent] = useState('');
  const [projectIsFeatured, setProjectIsFeatured] = useState(false);
  const [projectDisplayOrder, setProjectDisplayOrder] = useState(0);
  const [projectStatus, setProjectStatus] = useState('active');

  // Notification Form States
  const [notificationTitle, setNotificationTitle] = useState('');
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationType, setNotificationType] = useState<'info' | 'success' | 'warning'>('info');
  const [notificationExpirationHours, setNotificationExpirationHours] = useState('24');
  
  // Website Form States
  const [websiteTitle, setWebsiteTitle] = useState('');
  const [websiteDescription, setWebsiteDescription] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [websiteScreenshot, setWebsiteScreenshot] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load projects
      const { data: projectsData } = await supabase
        .from('projects')
        .select('*')
        .order('display_order', { ascending: true });
      
      if (projectsData) setProjects(projectsData);

      // Load notifications
      const { data: notificationsData } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (notificationsData) setNotifications(notificationsData);

      // Load websites
      const { data: websitesData } = await supabase
        .from('website_previews')
        .select('*')
        .order('display_order', { ascending: true });
      
      if (websitesData) setWebsites(websitesData);

      // Load AI settings
      const { data: aiSettings } = await supabase
        .from('ai_model_settings')
        .select('*')
        .limit(1)
        .single();

      if (aiSettings) {
        setSystemPrompt(aiSettings.system_prompt || '');
        setWeeklyInstructions(aiSettings.weekly_instructions || '');
        setMonthlyInstructions(aiSettings.monthly_instructions || '');
        setModelName(aiSettings.model_name || 'gemini');
      }

      // Load site config
      const { data: siteConfig } = await supabase
        .from('site_config')
        .select('*')
        .limit(1)
        .single();

      if (siteConfig) {
        setShowTerminal(siteConfig.show_terminal ?? true);
      }

    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveAISettings = async () => {
    try {
      const { error } = await supabase
        .from('ai_model_settings')
        .upsert({
          model_name: modelName,
          system_prompt: systemPrompt,
          weekly_instructions: weeklyInstructions,
          monthly_instructions: monthlyInstructions,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'model_name'
        });

      if (error) throw error;
      
      alert('تم حفظ إعدادات الذكاء الاصطناعي بنجاح');
    } catch (error) {
      console.error('Error saving AI settings:', error);
      alert('فشل في حفظ الإعدادات');
    }
  };

  const updateTerminalSetting = async (show: boolean) => {
    try {
      const { error } = await supabase
        .from('site_config')
        .upsert({ id: 1, show_terminal: show, updated_at: new Date().toISOString() });

      if (error) throw error;
      setShowTerminal(show);
    } catch (error) {
      console.error('Error updating terminal setting:', error);
    }
  };

  const saveWebsite = async () => {
    try {
      if (!websiteTitle.trim() || !websiteUrl.trim()) {
        alert('يرجى إدخال عنوان الموقع والرابط');
        return;
      }

      const websiteData = {
        title: websiteTitle.trim(),
        description: websiteDescription.trim() || websiteTitle.trim(),
        url: websiteUrl.trim(),
        screenshot_url: websiteScreenshot.trim() || null,
        is_active: true,
        display_order: websites.length + 1,
      };

      const { error } = await supabase
        .from('website_previews')
        .insert(websiteData);

      if (error) throw error;

      resetWebsiteForm();
      loadData();
      
      alert('تم إضافة الموقع بنجاح');
    } catch (error) {
      console.error('Error saving website:', error);
      alert('فشل في إضافة الموقع: ' + (error as any).message);
    }
  };

  const resetWebsiteForm = () => {
    setShowWebsiteForm(false);
    setWebsiteTitle('');
    setWebsiteDescription('');
    setWebsiteUrl('');
    setWebsiteScreenshot('');
  };

  const deleteNotification = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id);

      if (error) throw error;
      loadData();
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const deleteWebsite = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الموقع؟')) return;
    
    try {
      const { error } = await supabase
        .from('website_previews')
        .delete()
        .eq('id', id);

      if (error) throw error;
      loadData();
    } catch (error) {
      console.error('Error deleting website:', error);
    }
  };

  const handleProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const projectData = {
        title: projectTitle,
        description: projectDescription,
        technologies: projectTechnologies.split(',').map(t => t.trim()).filter(t => t),
        html_content: projectHtmlContent,
        css_content: projectCssContent || null,
        js_content: projectJsContent || null,
        is_featured: projectIsFeatured,
        display_order: projectDisplayOrder,
        project_status: projectStatus,
      };

      if (editingProject) {
        const { error } = await supabase
          .from('projects')
          .update(projectData)
          .eq('id', editingProject.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('projects')
          .insert(projectData);
        if (error) throw error;
      }

      resetProjectForm();
      loadData();
      alert(editingProject ? 'تم تحديث المشروع بنجاح' : 'تم إضافة المشروع بنجاح');
    } catch (error) {
      console.error('Error saving project:', error);
      alert('فشل في حفظ المشروع');
    }
  };

  const handleNotificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const expirationDate = new Date();
      expirationDate.setHours(expirationDate.getHours() + parseInt(notificationExpirationHours));

      const notificationData = {
        title: notificationTitle,
        message: notificationMessage,
        type: notificationType,
        expires_at: expirationDate.toISOString(),
      };

      const { error } = await supabase
        .from('notifications')
        .insert(notificationData);

      if (error) throw error;

      resetNotificationForm();
      loadData();
      alert('تم إضافة الإشعار بنجاح');
    } catch (error) {
      console.error('Error saving notification:', error);
      alert('فشل في إضافة الإشعار');
    }
  };

  const resetProjectForm = () => {
    setShowProjectForm(false);
    setEditingProject(null);
    setProjectTitle('');
    setProjectDescription('');
    setProjectTechnologies('');
    setProjectHtmlContent('');
    setProjectCssContent('');
    setProjectJsContent('');
    setProjectIsFeatured(false);
    setProjectDisplayOrder(0);
    setProjectStatus('active');
  };

  const resetNotificationForm = () => {
    setShowNotificationForm(false);
    setNotificationTitle('');
    setNotificationMessage('');
    setNotificationType('info');
    setNotificationExpirationHours('24');
  };

  const editProject = (project: Project) => {
    setEditingProject(project);
    setProjectTitle(project.title);
    setProjectDescription(project.description);
    setProjectTechnologies(project.technologies?.join(', ') || '');
    setProjectHtmlContent(project.html_content);
    setProjectCssContent(project.css_content || '');
    setProjectJsContent(project.js_content || '');
    setProjectIsFeatured(project.is_featured);
    setProjectDisplayOrder(project.display_order);
    setProjectStatus(project.project_status);
    setShowProjectForm(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            لوحة التحكم الإدارية
          </h1>
          <p className="text-muted-foreground">إدارة شاملة لموقع موسى عمر</p>
        </div>

        <Tabs defaultValue="projects" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-6 h-auto p-1 bg-muted">
            <TabsTrigger value="projects" className="flex items-center gap-2 p-3 github-button">
              <Code className="h-4 w-4" />
              <span className="hidden sm:inline">المشاريع</span>
            </TabsTrigger>
            <TabsTrigger value="websites" className="flex items-center gap-2 p-3 github-button">
              <Globe className="h-4 w-4" />
              <span className="hidden sm:inline">المواقع</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2 p-3 github-button">
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">الإشعارات</span>
            </TabsTrigger>
            <TabsTrigger value="skills" className="flex items-center gap-2 p-3 github-button">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">المهارات</span>
            </TabsTrigger>
            <TabsTrigger value="ai" className="flex items-center gap-2 p-3 github-button">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">الذكاء الاصطناعي</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2 p-3 github-button">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">الإعدادات</span>
            </TabsTrigger>
          </TabsList>

          {/* Projects Tab */}
          <TabsContent value="projects" className="space-y-6">
            <Card className="border-border">
              <CardHeader className="flex flex-row items-center justify-between border-b border-border">
                <CardTitle>إدارة المشاريع</CardTitle>
                <Button onClick={() => setShowProjectForm(true)} className="github-button">
                  <Plus className="h-4 w-4 mr-2" />
                  إضافة مشروع
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
                  {projects.map((project) => (
                    <Card key={project.id} className="hover:shadow-md transition-shadow github-button border-border">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{project.title}</CardTitle>
                          <Badge variant={project.is_featured ? "default" : "secondary"}>
                            {project.is_featured ? "مميز" : "عادي"}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {project.description}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {project.technologies?.map((tech) => (
                            <Badge key={tech} variant="outline" className="text-xs">
                              {tech}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => editProject(project)}
                            className="github-button"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button size="sm" variant="outline" className="github-button">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl w-full max-h-[90vh]">
                              <DialogHeader>
                                <DialogTitle>{project.title}</DialogTitle>
                              </DialogHeader>
                              <div className="w-full h-[70vh] border rounded-lg overflow-hidden border-border">
                                <iframe
                                  srcDoc={`
                                    <html>
                                      <head>
                                        <style>${project.css_content || ''}</style>
                                      </head>
                                      <body>
                                        ${project.html_content}
                                        <script>${project.js_content || ''}</script>
                                      </body>
                                    </html>
                                  `}
                                  className="w-full h-full border-0"
                                  title={`معاينة ${project.title}`}
                                />
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            {showProjectForm && (
              <ProjectForm
                showForm={showProjectForm}
                editingProject={!!editingProject}
                title={projectTitle}
                setTitle={setProjectTitle}
                description={projectDescription}
                setDescription={setProjectDescription}
                technologies={projectTechnologies}
                setTechnologies={setProjectTechnologies}
                htmlContent={projectHtmlContent}
                setHtmlContent={setProjectHtmlContent}
                cssContent={projectCssContent}
                setCssContent={setProjectCssContent}
                jsContent={projectJsContent}
                setJsContent={setProjectJsContent}
                isFeatured={projectIsFeatured}
                setIsFeatured={setProjectIsFeatured}
                displayOrder={projectDisplayOrder}
                setDisplayOrder={setProjectDisplayOrder}
                projectStatus={projectStatus}
                setProjectStatus={setProjectStatus}
                onSubmit={handleProjectSubmit}
                onCancel={resetProjectForm}
              />
            )}
          </TabsContent>

          {/* Websites Tab */}
          <TabsContent value="websites" className="space-y-6">
            <Card className="border-border">
              <CardHeader className="flex flex-row items-center justify-between border-b border-border">
                <CardTitle>إدارة المواقع المنشورة</CardTitle>
                <Button onClick={() => setShowWebsiteForm(true)} className="github-button">
                  <Plus className="h-4 w-4 mr-2" />
                  إضافة موقع
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
                  {websites.map((website) => (
                    <Card key={website.id} className="hover:shadow-md transition-shadow github-button border-border">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg">{website.title}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {website.description}
                        </p>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" asChild className="github-button">
                            <a href={website.url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4 mr-1" />
                              زيارة
                            </a>
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => deleteWebsite(website.id)}
                            className="github-button hover:bg-destructive hover:text-destructive-foreground"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            {showWebsiteForm && (
              <Card className="border-border">
                <CardHeader className="border-b border-border">
                  <CardTitle>إضافة موقع جديد</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 p-6">
                  <div>
                    <Label htmlFor="website-title">عنوان الموقع *</Label>
                    <Input
                      id="website-title"
                      value={websiteTitle}
                      onChange={(e) => setWebsiteTitle(e.target.value)}
                      placeholder="اسم الموقع..."
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="website-description">وصف الموقع</Label>
                    <Textarea
                      id="website-description"
                      value={websiteDescription}
                      onChange={(e) => setWebsiteDescription(e.target.value)}
                      placeholder="وصف مختصر للموقع..."
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="website-url">رابط الموقع *</Label>
                    <Input
                      id="website-url"
                      value={websiteUrl}
                      onChange={(e) => setWebsiteUrl(e.target.value)}
                      placeholder="https://example.com"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="website-screenshot">رابط صورة الموقع (اختياري)</Label>
                    <Input
                      id="website-screenshot"
                      value={websiteScreenshot}
                      onChange={(e) => setWebsiteScreenshot(e.target.value)}
                      placeholder="https://example.com/screenshot.png"
                      className="mt-1"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={saveWebsite} className="github-button">
                      <Save className="h-4 w-4 mr-2" />
                      حفظ
                    </Button>
                    <Button variant="outline" onClick={resetWebsiteForm} className="github-button">
                      إلغاء
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <Card className="border-border">
              <CardHeader className="flex flex-row items-center justify-between border-b border-border">
                <CardTitle>إدارة الإشعارات</CardTitle>
                <Button onClick={() => setShowNotificationForm(true)} className="github-button">
                  <Plus className="h-4 w-4 mr-2" />
                  إضافة إشعار
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-4 p-6">
                  {notifications.map((notification) => (
                    <Card key={notification.id} className="github-button border-border">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium">{notification.title}</h4>
                            <p className="text-sm text-muted-foreground mt-1">
                              {notification.message}
                            </p>
                            <div className="flex gap-2 mt-2">
                              <Badge variant="outline">{notification.type}</Badge>
                              <Badge variant="secondary">
                                ينتهي: {new Date(notification.expires_at).toLocaleDateString('ar-LY')}
                              </Badge>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => deleteNotification(notification.id)}
                            className="github-button hover:bg-destructive hover:text-destructive-foreground"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            {showNotificationForm && (
              <NotificationForm
                showForm={showNotificationForm}
                title={notificationTitle}
                setTitle={setNotificationTitle}
                message={notificationMessage}
                setMessage={setNotificationMessage}
                type={notificationType}
                setType={setNotificationType}
                expirationHours={notificationExpirationHours}
                setExpirationHours={setNotificationExpirationHours}
                onSubmit={handleNotificationSubmit}
                onCancel={resetNotificationForm}
              />
            )}
          </TabsContent>

          {/* Skills Tab */}
          <TabsContent value="skills">
            <SkillsManager />
          </TabsContent>

          {/* AI Settings Tab */}
          <TabsContent value="ai" className="space-y-6">
            <Card className="border-border">
              <CardHeader className="border-b border-border">
                <CardTitle>إعدادات الذكاء الاصطناعي</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 p-6">
                <div>
                  <Label htmlFor="system-prompt">النص الأساسي للنظام</Label>
                  <Textarea
                    id="system-prompt"
                    value={systemPrompt}
                    onChange={(e) => setSystemPrompt(e.target.value)}
                    placeholder="أدخل النص الأساسي للذكاء الاصطناعي..."
                    rows={4}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="weekly-instructions">التعليمات الأسبوعية</Label>
                  <Textarea
                    id="weekly-instructions"
                    value={weeklyInstructions}
                    onChange={(e) => setWeeklyInstructions(e.target.value)}
                    placeholder="التعليمات الأسبوعية..."
                    rows={3}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="monthly-instructions">التعليمات الشهرية</Label>
                  <Textarea
                    id="monthly-instructions"
                    value={monthlyInstructions}
                    onChange={(e) => setMonthlyInstructions(e.target.value)}
                    placeholder="التعليمات الشهرية..."
                    rows={3}
                    className="mt-1"
                  />
                </div>
                <Button onClick={saveAISettings} className="w-full github-button">
                  <Save className="h-4 w-4 mr-2" />
                  حفظ إعدادات الذكاء الاصطناعي
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Site Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card className="border-border">
              <CardHeader className="border-b border-border">
                <CardTitle>إعدادات الموقع</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="show-terminal">عرض الطرفية</Label>
                    <p className="text-sm text-muted-foreground">
                      تفعيل أو إلغاء تفعيل صفحة الطرفية
                    </p>
                  </div>
                  <Switch
                    id="show-terminal"
                    checked={showTerminal}
                    onCheckedChange={updateTerminalSetting}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
