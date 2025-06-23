import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, Eye, Bell, Calendar, Clock, LogOut } from 'lucide-react';
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
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning';
  expires_at: string;
  created_at: string;
}

interface SiteSettings {
  show_terminal: boolean;
}

export default function AdminDashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
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

  // Notification form state
  const [notificationTitle, setNotificationTitle] = useState('');
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationType, setNotificationType] = useState<'info' | 'success' | 'warning'>('info');
  const [expirationHours, setExpirationHours] = useState('24');
  const [siteSettings, setSiteSettings] = useState<SiteSettings>({ show_terminal: true });

  useEffect(() => {
    loadProjects();
    loadNotifications();
    loadSiteSettings();
  }, []);

  const loadProjects = () => {
    const existingProjects = JSON.parse(localStorage.getItem('portfolio-projects') || '[]');
    setProjects(existingProjects);
  };

  const loadNotifications = () => {
    const existingNotifications = JSON.parse(localStorage.getItem('portfolio-notifications') || '[]');
    setNotifications(existingNotifications);
  };

  const loadSiteSettings = () => {
    const settings = JSON.parse(localStorage.getItem('site-settings') || '{"show_terminal": true}');
    setSiteSettings(settings);
  };

  const updateSiteSettings = (newSettings: Partial<SiteSettings>) => {
    const updatedSettings = { ...siteSettings, ...newSettings };
    setSiteSettings(updatedSettings);
    localStorage.setItem('site-settings', JSON.stringify(updatedSettings));
    toast({
      title: "تم التحديث",
      description: "تم تحديث إعدادات الموقع بنجاح",
    });
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
    setEditingProject(null);
    setShowProjectForm(false);
  };

  const handleProjectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !description.trim() || !htmlContent.trim()) {
      toast({
        title: "خطأ",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive",
      });
      return;
    }

    const projectData: Project = {
      id: editingProject?.id || Date.now().toString(),
      title: title.trim(),
      description: description.trim(),
      technologies: technologies.split(',').map(tech => tech.trim()).filter(tech => tech),
      html_content: htmlContent,
      css_content: cssContent || undefined,
      js_content: jsContent || undefined,
      is_featured: isFeatured,
    };

    const existingProjects = JSON.parse(localStorage.getItem('portfolio-projects') || '[]');
    
    if (editingProject) {
      const updatedProjects = existingProjects.map((project: Project) =>
        project.id === editingProject.id ? projectData : project
      );
      localStorage.setItem('portfolio-projects', JSON.stringify(updatedProjects));
      setProjects(updatedProjects);
      toast({
        title: "تم التحديث",
        description: "تم تحديث المشروع بنجاح",
      });
    } else {
      const updatedProjects = [...existingProjects, projectData];
      localStorage.setItem('portfolio-projects', JSON.stringify(updatedProjects));
      setProjects(updatedProjects);
      toast({
        title: "تم الإنشاء",
        description: "تم إنشاء المشروع بنجاح",
      });
    }

    resetProjectForm();
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
    setShowProjectForm(true);
  };

  const handleDeleteProject = (id: string) => {
    const existingProjects = JSON.parse(localStorage.getItem('portfolio-projects') || '[]');
    const updatedProjects = existingProjects.filter((project: Project) => project.id !== id);
    localStorage.setItem('portfolio-projects', JSON.stringify(updatedProjects));
    setProjects(updatedProjects);
    toast({
      title: "تم الحذف",
      description: "تم حذف المشروع بنجاح",
    });
  };

  const handleNotificationSubmit = (e: React.FormEvent) => {
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

    const newNotification: Notification = {
      id: Date.now().toString(),
      title: notificationTitle.trim(),
      message: notificationMessage.trim(),
      type: notificationType,
      expires_at: expirationDate.toISOString(),
      created_at: new Date().toISOString(),
    };

    const existingNotifications = JSON.parse(localStorage.getItem('portfolio-notifications') || '[]');
    const updatedNotifications = [...existingNotifications, newNotification];
    localStorage.setItem('portfolio-notifications', JSON.stringify(updatedNotifications));
    setNotifications(updatedNotifications);

    setNotificationTitle('');
    setNotificationMessage('');
    setNotificationType('info');
    setExpirationHours('24');
    setShowNotificationForm(false);

    toast({
      title: "تم النشر",
      description: "تم نشر التحديث بنجاح",
    });
  };

  const handleDeleteNotification = (id: string) => {
    const existingNotifications = JSON.parse(localStorage.getItem('portfolio-notifications') || '[]');
    const updatedNotifications = existingNotifications.filter((notif: Notification) => notif.id !== id);
    localStorage.setItem('portfolio-notifications', JSON.stringify(updatedNotifications));
    setNotifications(updatedNotifications);
    toast({
      title: "تم الحذف",
      description: "تم حذف التحديث بنجاح",
    });
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
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="projects">إدارة المشاريع</TabsTrigger>
            <TabsTrigger value="notifications">التحديثات</TabsTrigger>
            <TabsTrigger value="settings">إعدادات الموقع</TabsTrigger>
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      {project.is_featured && <Badge>مميز</Badge>}
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

          {/* Site Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">إعدادات الموقع</h2>
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
