import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, Eye, Bell, Calendar, Clock, LogOut, Settings, Bot, Sliders } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ThemeToggle } from '@/components/ThemeToggle';

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
}

interface AIInstruction {
  id: string;
  instruction_key: string;
  instruction_value: string;
  description?: string;
}

interface AdvancedSetting {
  id: string;
  setting_key: string;
  setting_value: string;
  setting_type: string;
  description?: string;
}

interface SiteSettings {
  show_terminal: boolean;
}

export default function AdminDashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [aiInstructions, setAiInstructions] = useState<AIInstruction[]>([]);
  const [advancedSettings, setAdvancedSettings] = useState<AdvancedSetting[]>([]);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [showNotificationForm, setShowNotificationForm] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Project form state
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
  const [notificationTitle, setNotificationTitle] = useState('');
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationType, setNotificationType] = useState<'info' | 'success' | 'warning'>('info');
  const [expirationHours, setExpirationHours] = useState('24');
  const [siteSettings, setSiteSettings] = useState<SiteSettings>({ show_terminal: true });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    await Promise.all([
      loadProjects(), 
      loadNotifications(), 
      loadSiteSettings(), 
      loadAIInstructions(),
      loadAdvancedSettings()
    ]);
  };

  const loadProjects = async () => {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error loading projects:', error);
    } else {
      setProjects(data || []);
    }
  };

  const loadNotifications = async () => {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading notifications:', error);
    } else {
      const typedNotifications = (data || []).map(notification => ({
        ...notification,
        type: notification.type as 'info' | 'success' | 'warning'
      }));
      setNotifications(typedNotifications);
    }
  };

  const loadSiteSettings = async () => {
    const { data, error } = await supabase
      .from('site_config')
      .select('*')
      .single();

    if (error) {
      console.error('Error loading site settings:', error);
    } else if (data) {
      setSiteSettings({ show_terminal: data.show_terminal });
    }
  };

  const loadAIInstructions = async () => {
    const { data, error } = await supabase
      .from('ai_instructions')
      .select('*')
      .order('instruction_key', { ascending: true });

    if (error) {
      console.error('Error loading AI instructions:', error);
    } else {
      setAiInstructions(data || []);
    }
  };

  const loadAdvancedSettings = async () => {
    const { data, error } = await supabase
      .from('advanced_settings')
      .select('*')
      .order('setting_key', { ascending: true });

    if (error) {
      console.error('Error loading advanced settings:', error);
    } else {
      setAdvancedSettings(data || []);
    }
  };

  const updateSiteSettings = async (newSettings: Partial<SiteSettings>) => {
    const updatedSettings = { ...siteSettings, ...newSettings };
    
    const { error } = await supabase
      .from('site_config')
      .update(updatedSettings)
      .eq('id', 1);

    if (error) {
      console.error('Error updating settings:', error);
      toast({
        title: "خطأ",
        description: "فشل في تحديث الإعدادات",
        variant: "destructive",
      });
    } else {
      setSiteSettings(updatedSettings);
      toast({
        title: "تم التحديث",
        description: "تم تحديث إعدادات الموقع بنجاح",
      });
    }
  };

  const updateAIInstruction = async (id: string, newValue: string) => {
    const { error } = await supabase
      .from('ai_instructions')
      .update({ 
        instruction_value: newValue,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) {
      console.error('Error updating AI instruction:', error);
      toast({
        title: "خطأ",
        description: "فشل في تحديث تعليمات الذكاء الاصطناعي",
        variant: "destructive",
      });
    } else {
      toast({
        title: "تم التحديث",
        description: "تم تحديث تعليمات الذكاء الاصطناعي بنجاح",
      });
      loadAIInstructions();
    }
  };

  const updateAdvancedSetting = async (id: string, newValue: string) => {
    const { error } = await supabase
      .from('advanced_settings')
      .update({ 
        setting_value: newValue,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) {
      console.error('Error updating advanced setting:', error);
      toast({
        title: "خطأ",
        description: "فشل في تحديث الإعدادات المتقدمة",
        variant: "destructive",
      });
    } else {
      toast({
        title: "تم التحديث",
        description: "تم تحديث الإعدادات المتقدمة بنجاح",
      });
      loadAdvancedSettings();
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin');
  };

  const resetProjectForm = () => {
    setTitle('');
    setDescription('');
    setTechnologies('');
    setHtmlContent('');
    setCssContent('');
    setJsContent('');
    setIsFeatured(false);
    setDisplayOrder(0);
    setProjectStatus('active');
    setEditingProject(null);
    setShowProjectForm(false);
  };

  const handleProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !description.trim() || !htmlContent.trim()) {
      toast({
        title: "خطأ",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive",
      });
      return;
    }

    const projectData = {
      title: title.trim(),
      description: description.trim(),
      technologies: technologies.split(',').map(tech => tech.trim()).filter(tech => tech),
      html_content: htmlContent,
      css_content: cssContent || null,
      js_content: jsContent || null,
      is_featured: isFeatured,
      display_order: displayOrder || Math.floor(Date.now() / 1000),
      project_status: projectStatus,
    };

    try {
      if (editingProject) {
        const { error } = await supabase
          .from('projects')
          .update(projectData)
          .eq('id', editingProject.id);

        if (error) throw error;

        toast({
          title: "تم التحديث",
          description: "تم تحديث المشروع بنجاح",
        });
      } else {
        const { error } = await supabase
          .from('projects')
          .insert([projectData]);

        if (error) throw error;

        toast({
          title: "تم الإنشاء",
          description: "تم إنشاء المشروع بنجاح",
        });
      }

      resetProjectForm();
      loadProjects();
    } catch (error) {
      console.error('Error saving project:', error);
      toast({
        title: "خطأ",
        description: "فشل في حفظ المشروع",
        variant: "destructive",
      });
    }
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setTitle(project.title);
    setDescription(project.description);
    setTechnologies(project.technologies.join(', '));
    setHtmlContent(project.html_content);
    setCssContent(project.css_content || '');
    setJsContent(project.js_content || '');
    setIsFeatured(project.is_featured);
    setDisplayOrder(project.display_order || 0);
    setProjectStatus(project.project_status || 'active');
    setShowProjectForm(true);
  };

  const handleDeleteProject = async (id: string) => {
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "تم الحذف",
        description: "تم حذف المشروع بنجاح",
      });
      loadProjects();
    } catch (error) {
      console.error('Error deleting project:', error);
      toast({
        title: "خطأ",
        description: "فشل في حذف المشروع",
        variant: "destructive",
      });
    }
  };

  const handleNotificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!notificationTitle.trim() || !notificationMessage.trim()) {
      toast({
        title: "خطأ",
        description: "يرجى ملء جميع حقول التحديث",
        variant: "destructive",
      });
      return;
    }

    const expirationDate = new Date();
    expirationDate.setHours(expirationDate.getHours() + parseInt(expirationHours));

    const newNotification = {
      title: notificationTitle.trim(),
      message: notificationMessage.trim(),
      type: notificationType,
      expires_at: expirationDate.toISOString(),
    };

    try {
      const { error } = await supabase
        .from('notifications')
        .insert([newNotification]);

      if (error) throw error;

      setNotificationTitle('');
      setNotificationMessage('');
      setNotificationType('info');
      setExpirationHours('24');
      setShowNotificationForm(false);

      toast({
        title: "تم النشر",
        description: "تم نشر التحديث بنجاح",
      });
      loadNotifications();
    } catch (error) {
      console.error('Error creating notification:', error);
      toast({
        title: "خطأ",
        description: "فشل في نشر التحديث",
        variant: "destructive",
      });
    }
  };

  const handleDeleteNotification = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "تم الحذف",
        description: "تم حذف التحديث بنجاح",
      });
      loadNotifications();
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast({
        title: "خطأ",
        description: "فشل في حذف التحديث",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <h1 className="text-xl font-bold">لوحة تحكم المدير</h1>
          <div className="flex items-center space-x-2">
            <ThemeToggle />
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              تسجيل الخروج
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="projects" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="projects">إدارة المشاريع</TabsTrigger>
            <TabsTrigger value="notifications">التحديثات</TabsTrigger>
            <TabsTrigger value="ai-settings">تعليمات الـ AI</TabsTrigger>
            <TabsTrigger value="advanced-settings">الإعدادات المتقدمة</TabsTrigger>
            <TabsTrigger value="site-settings">إعدادات الموقع</TabsTrigger>
          </TabsList>

          {/* Projects Tab */}
          <TabsContent value="projects" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">المشاريع</h2>
              <Button onClick={() => setShowProjectForm(!showProjectForm)}>
                <Plus className="h-4 w-4 mr-2" />
                إضافة مشروع جديد
              </Button>
            </div>

            {/* Project Form */}
            {showProjectForm && (
              <Card>
                <CardHeader>
                  <CardTitle>{editingProject ? 'تعديل المشروع' : 'إضافة مشروع جديد'}</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleProjectSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="title">اسم المشروع *</Label>
                        <Input
                          id="title"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="technologies">التقنيات المستخدمة (مفصولة بفاصلة)</Label>
                        <Input
                          id="technologies"
                          value={technologies}
                          onChange={(e) => setTechnologies(e.target.value)}
                          placeholder="HTML, CSS, JavaScript"
                        />
                      </div>
                      <div>
                        <Label htmlFor="display-order">ترتيب العرض</Label>
                        <Input
                          id="display-order"
                          type="number"
                          value={displayOrder}
                          onChange={(e) => setDisplayOrder(parseInt(e.target.value))}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="description">وصف المشروع *</Label>
                      <Textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={3}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="html">كود HTML *</Label>
                      <Textarea
                        id="html"
                        value={htmlContent}
                        onChange={(e) => setHtmlContent(e.target.value)}
                        rows={6}
                        className="font-mono text-sm"
                        placeholder="<!DOCTYPE html>..."
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="css">كود CSS (اختياري)</Label>
                        <Textarea
                          id="css"
                          value={cssContent}
                          onChange={(e) => setCssContent(e.target.value)}
                          rows={6}
                          className="font-mono text-sm"
                          placeholder="body { ... }"
                        />
                      </div>
                      <div>
                        <Label htmlFor="js">كود JavaScript (اختياري)</Label>
                        <Textarea
                          id="js"
                          value={jsContent}
                          onChange={(e) => setJsContent(e.target.value)}
                          rows={6}
                          className="font-mono text-sm"
                          placeholder="console.log('Hello');"
                        />
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-4 items-center">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="featured"
                          checked={isFeatured}
                          onChange={(e) => setIsFeatured(e.target.checked)}
                          className="rounded"
                        />
                        <Label htmlFor="featured">مشروع مميز</Label>
                      </div>
                      <div>
                        <Label htmlFor="status">حالة المشروع</Label>
                        <Select value={projectStatus} onValueChange={setProjectStatus}>
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">نشط</SelectItem>
                            <SelectItem value="inactive">غير نشط</SelectItem>
                            <SelectItem value="draft">مسودة</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button type="submit">
                        {editingProject ? 'تحديث المشروع' : 'إضافة المشروع'}
                      </Button>
                      <Button type="button" variant="outline" onClick={resetProjectForm}>
                        إلغاء
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Projects List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <Card key={project.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{project.title}</CardTitle>
                      <div className="flex gap-2">
                        {project.is_featured && <Badge>مميز</Badge>}
                        <Badge variant="outline">{project.project_status}</Badge>
                      </div>
                    </div>
                    <CardDescription className="line-clamp-2">
                      {project.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {project.technologies.slice(0, 3).map((tech) => (
                        <Badge key={tech} variant="outline" className="text-xs">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => window.open(`/project/${project.id}`, '_blank')}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleEditProject(project)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDeleteProject(project.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">التحديثات</h2>
              <Button onClick={() => setShowNotificationForm(!showNotificationForm)}>
                <Bell className="h-4 w-4 mr-2" />
                إضافة تحديث جديد
              </Button>
            </div>

            {/* Notification Form */}
            {showNotificationForm && (
              <Card>
                <CardHeader>
                  <CardTitle>إضافة تحديث جديد</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleNotificationSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="notif-title">عنوان التحديث</Label>
                      <Input
                        id="notif-title"
                        value={notificationTitle}
                        onChange={(e) => setNotificationTitle(e.target.value)}
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="notif-message">نص التحديث</Label>
                      <Textarea
                        id="notif-message"
                        value={notificationMessage}
                        onChange={(e) => setNotificationMessage(e.target.value)}
                        rows={3}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="notif-type">نوع التحديث</Label>
                        <Select value={notificationType} onValueChange={(value: 'info' | 'success' | 'warning') => setNotificationType(value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="info">معلومة</SelectItem>
                            <SelectItem value="success">نجاح</SelectItem>
                            <SelectItem value="warning">تحذير</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="expiration">مدة العرض (ساعات)</Label>
                        <Select value={expirationHours} onValueChange={setExpirationHours}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">ساعة واحدة</SelectItem>
                            <SelectItem value="6">6 ساعات</SelectItem>
                            <SelectItem value="12">12 ساعة</SelectItem>
                            <SelectItem value="24">24 ساعة</SelectItem>
                            <SelectItem value="48">48 ساعة</SelectItem>
                            <SelectItem value="168">أسبوع</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button type="submit">نشر التحديث</Button>
                      <Button type="button" variant="outline" onClick={() => setShowNotificationForm(false)}>
                        إلغاء
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Notifications List */}
            <div className="space-y-4">
              {notifications.map((notification) => (
                <Card key={notification.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg">{notification.title}</CardTitle>
                        <Badge variant={notification.type === 'success' ? 'default' : notification.type === 'warning' ? 'destructive' : 'secondary'}>
                          {notification.type === 'info' ? 'معلومة' : notification.type === 'success' ? 'نجاح' : 'تحذير'}
                        </Badge>
                      </div>
                      <Button size="sm" variant="destructive" onClick={() => handleDeleteNotification(notification.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-2">{notification.message}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(notification.created_at).toLocaleDateString('ar-SA')}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        ينتهي: {new Date(notification.expires_at).toLocaleDateString('ar-SA')}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* AI Instructions Tab */}
          <TabsContent value="ai-settings" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Bot className="h-6 w-6" />
                تعليمات الذكاء الاصطناعي
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {aiInstructions.map((instruction) => (
                <Card key={instruction.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">{instruction.instruction_key}</CardTitle>
                    {instruction.description && (
                      <CardDescription>{instruction.description}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <Textarea
                        value={instruction.instruction_value}
                        onChange={(e) => {
                          const updatedInstructions = aiInstructions.map(inst =>
                            inst.id === instruction.id 
                              ? { ...inst, instruction_value: e.target.value }
                              : inst
                          );
                          setAiInstructions(updatedInstructions);
                        }}
                        rows={instruction.instruction_key === 'system_prompt' ? 8 : 3}
                        className="font-mono text-sm"
                      />
                      <Button 
                        onClick={() => updateAIInstruction(instruction.id, instruction.instruction_value)}
                        size="sm"
                      >
                        حفظ التعديلات
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Advanced Settings Tab */}
          <TabsContent value="advanced-settings" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Sliders className="h-6 w-6" />
                الإعدادات المتقدمة
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {advancedSettings.map((setting) => (
                <Card key={setting.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">{setting.setting_key}</CardTitle>
                    {setting.description && (
                      <CardDescription>{setting.description}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {setting.setting_type === 'boolean' ? (
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={setting.id}
                            checked={setting.setting_value === 'true'}
                            onChange={(e) => {
                              const newValue = e.target.checked ? 'true' : 'false';
                              const updatedSettings = advancedSettings.map(s =>
                                s.id === setting.id 
                                  ? { ...s, setting_value: newValue }
                                  : s
                              );
                              setAdvancedSettings(updatedSettings);
                            }}
                            className="rounded"
                          />
                          <Label htmlFor={setting.id}>تفعيل</Label>
                        </div>
                      ) : setting.setting_type === 'number' ? (
                        <Input
                          type="number"
                          value={setting.setting_value}
                          onChange={(e) => {
                            const updatedSettings = advancedSettings.map(s =>
                              s.id === setting.id 
                                ? { ...s, setting_value: e.target.value }
                                : s
                            );
                            setAdvancedSettings(updatedSettings);
                          }}
                        />
                      ) : (
                        <Input
                          value={setting.setting_value}
                          onChange={(e) => {
                            const updatedSettings = advancedSettings.map(s =>
                              s.id === setting.id 
                                ? { ...s, setting_value: e.target.value }
                                : s
                            );
                            setAdvancedSettings(updatedSettings);
                          }}
                        />
                      )}
                      <Button 
                        onClick={() => updateAdvancedSetting(setting.id, setting.setting_value)}
                        size="sm"
                      >
                        حفظ التعديلات
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Site Settings Tab */}
          <TabsContent value="site-settings" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Settings className="h-6 w-6" />
                إعدادات الموقع
              </h2>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>إعدادات عامة</CardTitle>
                <CardDescription>تحكم في إعدادات الموقع العامة</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="show-terminal">إظهار صفحة محرر الأكواد</Label>
                    <p className="text-sm text-muted-foreground">
                      تتيح للزوار تجربة الأكواد ومشاهدة النتائج مباشرة
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    id="show-terminal"
                    checked={siteSettings.show_terminal}
                    onChange={(e) => updateSiteSettings({ show_terminal: e.target.checked })}
                    className="rounded"
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
