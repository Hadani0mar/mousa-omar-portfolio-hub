
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Trash2, Edit2, Plus, Globe, Settings, Code, Bell, Brain, Users } from 'lucide-react';
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
  download_count?: number;
  like_count?: number;
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
  is_active: boolean;
  display_order: number;
}

interface AISettings {
  system_prompt: string;
  weekly_instructions?: string;
  monthly_instructions?: string;
}

export default function AdminDashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [websites, setWebsites] = useState<WebsitePreview[]>([]);
  const [aiSettings, setAiSettings] = useState<AISettings>({
    system_prompt: '',
    weekly_instructions: '',
    monthly_instructions: ''
  });
  
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [showNotificationForm, setShowNotificationForm] = useState(false);
  const [showWebsiteForm, setShowWebsiteForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [editingWebsite, setEditingWebsite] = useState<WebsitePreview | null>(null);
  
  // Website form states
  const [websiteTitle, setWebsiteTitle] = useState('');
  const [websiteDescription, setWebsiteDescription] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  
  const { toast } = useToast();

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    await Promise.all([
      loadProjects(),
      loadNotifications(),
      loadWebsites(),
      loadAISettings()
    ]);
  };

  const loadProjects = async () => {
    try {
      const { data } = await supabase
        .from('projects')
        .select('*')
        .order('display_order', { ascending: true });
      if (data) setProjects(data);
    } catch (error) {
      console.error('Error loading projects:', error);
    }
  };

  const loadNotifications = async () => {
    try {
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false });
      if (data) setNotifications(data);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const loadWebsites = async () => {
    try {
      const { data } = await supabase
        .from('website_previews')
        .select('*')
        .order('display_order', { ascending: true });
      if (data) setWebsites(data);
    } catch (error) {
      console.error('Error loading websites:', error);
    }
  };

  const loadAISettings = async () => {
    try {
      const { data } = await supabase
        .from('ai_model_settings')
        .select('*')
        .single();
      
      if (data) {
        setAiSettings({
          system_prompt: data.system_prompt || '',
          weekly_instructions: data.weekly_instructions || '',
          monthly_instructions: data.monthly_instructions || ''
        });
      }
    } catch (error) {
      console.error('Error loading AI settings:', error);
    }
  };

  const saveAISettings = async () => {
    try {
      const { error } = await supabase
        .from('ai_model_settings')
        .upsert({
          system_prompt: aiSettings.system_prompt,
          weekly_instructions: aiSettings.weekly_instructions,
          monthly_instructions: aiSettings.monthly_instructions,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: "تم الحفظ",
        description: "تم حفظ إعدادات الذكاء الاصطناعي بنجاح",
      });
    } catch (error) {
      console.error('Error saving AI settings:', error);
      toast({
        title: "خطأ",
        description: "فشل في حفظ الإعدادات",
        variant: "destructive",
      });
    }
  };

  const deleteProject = async (id: string) => {
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setProjects(projects.filter(p => p.id !== id));
      toast({
        title: "تم الحذف",
        description: "تم حذف المشروع بنجاح",
      });
    } catch (error) {
      console.error('Error deleting project:', error);
      toast({
        title: "خطأ",
        description: "فشل في حذف المشروع",
        variant: "destructive",
      });
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setNotifications(notifications.filter(n => n.id !== id));
      toast({
        title: "تم الحذف",
        description: "تم حذف الإشعار بنجاح",
      });
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast({
        title: "خطأ",
        description: "فشل في حذف الإشعار",
        variant: "destructive",
      });
    }
  };

  const handleWebsiteSubmit = async () => {
    try {
      const websiteData = {
        title: websiteTitle,
        description: websiteDescription,
        url: websiteUrl,
        is_active: true,
        display_order: websites.length
      };

      if (editingWebsite) {
        const { error } = await supabase
          .from('website_previews')
          .update(websiteData)
          .eq('id', editingWebsite.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('website_previews')
          .insert([websiteData]);

        if (error) throw error;
      }

      await loadWebsites();
      resetWebsiteForm();
      toast({
        title: "تم الحفظ",
        description: editingWebsite ? "تم تحديث الموقع" : "تم إضافة الموقع",
      });
    } catch (error) {
      console.error('Error saving website:', error);
      toast({
        title: "خطأ",
        description: "فشل في حفظ الموقع",
        variant: "destructive",
      });
    }
  };

  const deleteWebsite = async (id: string) => {
    try {
      const { error } = await supabase
        .from('website_previews')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await loadWebsites();
      toast({
        title: "تم الحذف",
        description: "تم حذف الموقع بنجاح",
      });
    } catch (error) {
      console.error('Error deleting website:', error);
      toast({
        title: "خطأ",
        description: "فشل في حذف الموقع",
        variant: "destructive",
      });
    }
  };

  const editWebsite = (website: WebsitePreview) => {
    setEditingWebsite(website);
    setWebsiteTitle(website.title);
    setWebsiteDescription(website.description);
    setWebsiteUrl(website.url);
    setShowWebsiteForm(true);
  };

  const resetWebsiteForm = () => {
    setShowWebsiteForm(false);
    setEditingWebsite(null);
    setWebsiteTitle('');
    setWebsiteDescription('');
    setWebsiteUrl('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            لوحة التحكم
          </h1>
          <p className="text-muted-foreground text-lg">إدارة المحتوى والإعدادات</p>
        </div>

        <Tabs defaultValue="projects" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 bg-white/50 backdrop-blur-sm">
            <TabsTrigger value="projects" className="flex items-center gap-2">
              <Code className="h-4 w-4" />
              المشاريع
            </TabsTrigger>
            <TabsTrigger value="websites" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              المواقع
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              الإشعارات
            </TabsTrigger>
            <TabsTrigger value="skills" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              المهارات
            </TabsTrigger>
            <TabsTrigger value="ai-settings" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              إعدادات AI
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              الإعدادات
            </TabsTrigger>
          </TabsList>

          {/* Projects Tab */}
          <TabsContent value="projects" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">إدارة المشاريع</h2>
              <Button 
                onClick={() => setShowProjectForm(true)}
                className="bg-gradient-to-r from-blue-600 to-purple-600"
              >
                <Plus className="h-4 w-4 mr-2" />
                إضافة مشروع
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <Card key={project.id} className="hover:shadow-lg transition-all">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{project.title}</CardTitle>
                      {project.is_featured && (
                        <Badge variant="default">مميز</Badge>
                      )}
                    </div>
                    <CardDescription className="line-clamp-2">
                      {project.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-1 mb-4">
                      {project.technologies.slice(0, 3).map((tech) => (
                        <Badge key={tech} variant="outline" className="text-xs">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex justify-between items-center text-sm text-muted-foreground mb-4">
                      <span>تحميلات: {project.download_count || 0}</span>
                      <span>إعجابات: {project.like_count || 0}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingProject(project);
                          setShowProjectForm(true);
                        }}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteProject(project.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {showProjectForm && (
              <ProjectForm
                showForm={showProjectForm}
                editingProject={editingProject}
                onCancel={() => {
                  setShowProjectForm(false);
                  setEditingProject(null);
                }}
                onSave={loadProjects}
              />
            )}
          </TabsContent>

          {/* Websites Tab */}
          <TabsContent value="websites" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">إدارة المواقع المنشورة</h2>
              <Button 
                onClick={() => setShowWebsiteForm(true)}
                className="bg-gradient-to-r from-green-600 to-blue-600"
              >
                <Plus className="h-4 w-4 mr-2" />
                إضافة موقع
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {websites.map((website) => (
                <Card key={website.id} className="hover:shadow-lg transition-all">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Globe className="h-5 w-5" />
                      {website.title}
                    </CardTitle>
                    <CardDescription>{website.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="text-sm text-muted-foreground">
                        <strong>الرابط:</strong> {website.url}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => editWebsite(website)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteWebsite(website.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                        >
                          <a href={website.url} target="_blank" rel="noopener noreferrer">
                            <Globe className="h-4 w-4" />
                          </a>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {showWebsiteForm && (
              <Card className="max-w-md mx-auto">
                <CardHeader>
                  <CardTitle>
                    {editingWebsite ? 'تعديل الموقع' : 'إضافة موقع جديد'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="website-title">عنوان الموقع</Label>
                    <Input
                      id="website-title"
                      value={websiteTitle}
                      onChange={(e) => setWebsiteTitle(e.target.value)}
                      placeholder="اسم الموقع"
                    />
                  </div>
                  <div>
                    <Label htmlFor="website-description">الوصف</Label>
                    <Textarea
                      id="website-description"
                      value={websiteDescription}
                      onChange={(e) => setWebsiteDescription(e.target.value)}
                      placeholder="وصف مختصر للموقع"
                    />
                  </div>
                  <div>
                    <Label htmlFor="website-url">رابط الموقع</Label>
                    <Input
                      id="website-url"
                      type="url"
                      value={websiteUrl}
                      onChange={(e) => setWebsiteUrl(e.target.value)}
                      placeholder="https://example.com"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleWebsiteSubmit} className="flex-1">
                      {editingWebsite ? 'حفظ التغييرات' : 'إضافة الموقع'}
                    </Button>
                    <Button variant="outline" onClick={resetWebsiteForm}>
                      إلغاء
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">إدارة الإشعارات</h2>
              <Button 
                onClick={() => setShowNotificationForm(true)}
                className="bg-gradient-to-r from-orange-600 to-red-600"
              >
                <Plus className="h-4 w-4 mr-2" />
                إضافة إشعار
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {notifications.map((notification) => (
                <Card key={notification.id} className="hover:shadow-lg transition-all">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{notification.title}</CardTitle>
                      <Badge variant={
                        notification.type === 'success' ? 'default' :
                        notification.type === 'warning' ? 'secondary' :
                        notification.type === 'error' ? 'destructive' : 'outline'
                      }>
                        {notification.type}
                      </Badge>
                    </div>
                    <CardDescription>{notification.message}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center text-sm text-muted-foreground mb-4">
                      <span>ينتهي: {new Date(notification.expires_at).toLocaleDateString('ar')}</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteNotification(notification.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {showNotificationForm && (
              <NotificationForm
                showForm={showNotificationForm}
                onCancel={() => setShowNotificationForm(false)}
                onSave={loadNotifications}
              />
            )}
          </TabsContent>

          {/* Skills Tab */}
          <TabsContent value="skills">
            <SkillsManager />
          </TabsContent>

          {/* AI Settings Tab */}
          <TabsContent value="ai-settings" className="space-y-6">
            <div className="max-w-2xl mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5" />
                    إعدادات الذكاء الاصطناعي
                  </CardTitle>
                  <CardDescription>
                    تخصيص سلوك وتعليمات الذكاء الاصطناعي
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label htmlFor="system-prompt">التعليمات الأساسية للنظام</Label>
                    <Textarea
                      id="system-prompt"
                      value={aiSettings.system_prompt}
                      onChange={(e) => setAiSettings({
                        ...aiSettings,
                        system_prompt: e.target.value
                      })}
                      placeholder="أدخل التعليمات الأساسية للذكاء الاصطناعي..."
                      className="min-h-[120px]"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="weekly-instructions">التعليمات الأسبوعية</Label>
                    <Textarea
                      id="weekly-instructions"
                      value={aiSettings.weekly_instructions || ''}
                      onChange={(e) => setAiSettings({
                        ...aiSettings,
                        weekly_instructions: e.target.value
                      })}
                      placeholder="تعليمات خاصة لهذا الأسبوع..."
                      className="min-h-[80px]"
                    />
                  </div>

                  <div>
                    <Label htmlFor="monthly-instructions">التعليمات الشهرية</Label>
                    <Textarea
                      id="monthly-instructions"
                      value={aiSettings.monthly_instructions || ''}
                      onChange={(e) => setAiSettings({
                        ...aiSettings,
                        monthly_instructions: e.target.value
                      })}
                      placeholder="تعليمات خاصة لهذا الشهر..."
                      className="min-h-[80px]"
                    />
                  </div>

                  <Button 
                    onClick={saveAISettings}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600"
                  >
                    حفظ إعدادات الذكاء الاصطناعي
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>إعدادات عامة</CardTitle>
                <CardDescription>إعدادات الموقع العامة</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">قريباً...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
