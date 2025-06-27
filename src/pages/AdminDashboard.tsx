import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trash2, Edit, Plus, Download, Calendar, Clock, MessageSquare, Settings, FileText, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ProjectForm } from '@/components/admin/ProjectForm';
import { NotificationForm } from '@/components/admin/NotificationForm';
import { SkillsManager } from '@/components/admin/SkillsManager';
import { downloadProjectFiles } from '@/utils/projectDownloader';

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
  type: 'info' | 'success' | 'warning';
  expires_at: string;
  created_at: string;
}

interface AIInstruction {
  id: string;
  instruction_key: string;
  instruction_value: string;
  description: string;
}

interface AdvancedSetting {
  id: string;
  setting_key: string;
  setting_value: string;
  setting_type: string;
  description: string;
}

export default function AdminDashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [aiInstructions, setAIInstructions] = useState<AIInstruction[]>([]);
  const [advancedSettings, setAdvancedSettings] = useState<AdvancedSetting[]>([]);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [showNotificationForm, setShowNotificationForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [showTerminal, setShowTerminal] = useState(true);
  const { toast } = useToast();

  // Project form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [technologies, setTechnologies] = useState('');
  const [htmlContent, setHtmlContent] = useState('');
  const [cssContent, setCssContent] = useState('');
  const [jsContent, setJsContent] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);

  // Notification form states
  const [notifTitle, setNotifTitle] = useState('');
  const [notifMessage, setNotifMessage] = useState('');
  const [notifType, setNotifType] = useState<'info' | 'success' | 'warning'>('info');
  const [expirationHours, setExpirationHours] = useState('24');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load projects
      const { data: projectsData } = await supabase
        .from('projects')
        .select('*')
        .order('display_order', { ascending: true });

      if (projectsData) {
        setProjects(projectsData);
      }

      // Load notifications
      const { data: notificationsData } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false });

      if (notificationsData) {
        const typedNotifications = notificationsData.map(notification => ({
          ...notification,
          type: notification.type as 'info' | 'success' | 'warning'
        }));
        setNotifications(typedNotifications);
      }

      // Load AI instructions
      const { data: aiInstructionsData } = await supabase
        .from('ai_instructions')
        .select('*')
        .order('instruction_key', { ascending: true });

      if (aiInstructionsData) {
        setAIInstructions(aiInstructionsData);
      }

      // Load advanced settings
      const { data: advancedSettingsData } = await supabase
        .from('advanced_settings')
        .select('*')
        .order('setting_key', { ascending: true });

      if (advancedSettingsData) {
        setAdvancedSettings(advancedSettingsData);
      }

      // Load site config
      const { data: configData } = await supabase
        .from('site_config')
        .select('*')
        .single();

      if (configData) {
        setShowTerminal(configData.show_terminal);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      year: 'numeric',
      month: '2-digit', 
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const deleteProject = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المشروع؟')) return;

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
      loadData();
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
    if (!confirm('هل أنت متأكد من حذف هذا التحديث؟')) return;

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
      loadData();
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast({
        title: "خطأ",
        description: "فشل في حذف التحديث",
        variant: "destructive",
      });
    }
  };

  const handleProjectSubmit = async (projectData: any) => {
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
          .insert([{ ...projectData, display_order: projects.length + 1 }]);

        if (error) throw error;

        toast({
          title: "تم الإنشاء",
          description: "تم إنشاء المشروع بنجاح",
        });
      }

      setShowProjectForm(false);
      setEditingProject(null);
      loadData();
    } catch (error) {
      console.error('Error saving project:', error);
      toast({
        title: "خطأ",
        description: "فشل في حفظ المشروع",
        variant: "destructive",
      });
    }
  };

  const handleNotificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!notifTitle.trim() || !notifMessage.trim()) {
      toast({
        title: "خطأ",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive",
      });
      return;
    }

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + parseInt(expirationHours));

    const notificationData = {
      title: notifTitle.trim(),
      message: notifMessage.trim(),
      type: notifType,
      expires_at: expiresAt.toISOString(),
    };

    try {
      const { error } = await supabase
        .from('notifications')
        .insert([notificationData]);

      if (error) throw error;

      toast({
        title: "تم النشر",
        description: "تم نشر التحديث بنجاح",
      });

      setNotifTitle('');
      setNotifMessage('');
      setNotifType('info');
      setExpirationHours('24');
      setShowNotificationForm(false);
      loadData();
    } catch (error) {
      console.error('Error creating notification:', error);
      toast({
        title: "خطأ",
        description: "فشل في نشر التحديث",
        variant: "destructive",
      });
    }
  };

  const updateTerminalSetting = async (show: boolean) => {
    try {
      const { error } = await supabase
        .from('site_config')
        .update({ show_terminal: show })
        .eq('id', 1);

      if (error) throw error;

      setShowTerminal(show);
      toast({
        title: "تم التحديث",
        description: "تم تحديث إعدادات الموقع",
      });
    } catch (error) {
      console.error('Error updating terminal setting:', error);
      toast({
        title: "خطأ",
        description: "فشل في تحديث الإعدادات",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">لوحة الإدارة</h1>
        <div className="flex items-center space-x-2">
          <Label htmlFor="terminal-toggle">إظهار Terminal</Label>
          <Switch
            id="terminal-toggle"
            checked={showTerminal}
            onCheckedChange={updateTerminalSetting}
          />
        </div>
      </div>

      <Tabs defaultValue="projects" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="projects">المشاريع</TabsTrigger>
          <TabsTrigger value="notifications">التحديثات</TabsTrigger>
          <TabsTrigger value="skills">المهارات</TabsTrigger>
          <TabsTrigger value="ai">تعليمات AI</TabsTrigger>
          <TabsTrigger value="settings">الإعدادات</TabsTrigger>
        </TabsList>

        <TabsContent value="projects" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">إدارة المشاريع</h2>
            <Button onClick={() => setShowProjectForm(!showProjectForm)}>
              <Plus className="h-4 w-4 mr-2" />
              إضافة مشروع جديد
            </Button>
          </div>

          <ProjectForm
            showForm={showProjectForm}
            editingProject={editingProject}
            onSubmit={handleProjectSubmit}
            onCancel={() => {
              setShowProjectForm(false);
              setEditingProject(null);
            }}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Card key={project.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg line-clamp-1">{project.title}</CardTitle>
                    {project.is_featured && (
                      <Badge className="bg-yellow-500"><Star className="h-3 w-3" /></Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">{project.description}</p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex flex-wrap gap-1">
                    {project.technologies.slice(0, 3).map((tech) => (
                      <Badge key={tech} variant="outline" className="text-xs">{tech}</Badge>
                    ))}
                    {project.technologies.length > 3 && (
                      <Badge variant="outline" className="text-xs">+{project.technologies.length - 3}</Badge>
                    )}
                  </div>
                  
                  <div className="text-xs text-muted-foreground">
                    تاريخ الإنشاء: {formatDate(project.created_at)}
                  </div>
                  
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => downloadProjectFiles(project)}>
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => {
                      setEditingProject(project);
                      setShowProjectForm(true);
                    }}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => deleteProject(project.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">إدارة التحديثات</h2>
            <Button onClick={() => setShowNotificationForm(!showNotificationForm)}>
              <Plus className="h-4 w-4 mr-2" />
              إضافة تحديث جديد
            </Button>
          </div>

          <NotificationForm
            showForm={showNotificationForm}
            title={notifTitle}
            setTitle={setNotifTitle}
            message={notifMessage}
            setMessage={setNotifMessage}
            type={notifType}
            setType={setNotifType}
            expirationHours={expirationHours}
            setExpirationHours={setExpirationHours}
            onSubmit={handleNotificationSubmit}
            onCancel={() => {
              setShowNotificationForm(false);
              setNotifTitle('');
              setNotifMessage('');
              setNotifType('info');
              setExpirationHours('24');
            }}
          />

          <div className="space-y-4">
            {notifications.map((notification) => (
              <Card key={notification.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{notification.title}</h3>
                        <Badge 
                          variant={
                            notification.type === 'success' ? 'default' : 
                            notification.type === 'warning' ? 'destructive' : 
                            'secondary'
                          }
                        >
                          {notification.type === 'info' ? 'معلومة' : notification.type === 'success' ? 'نجاح' : 'تحذير'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3 whitespace-pre-wrap break-words">
                        {notification.message}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          تاريخ النشر: {formatDate(notification.created_at)}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          ينتهي في: {formatDate(notification.expires_at)}
                        </div>
                      </div>
                    </div>
                    <Button size="sm" variant="destructive" onClick={() => deleteNotification(notification.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="skills">
          <SkillsManager />
        </TabsContent>

        <TabsContent value="ai" className="space-y-6">
          <h2 className="text-2xl font-bold">تعليمات الذكاء الاصطناعي</h2>
          <div className="space-y-4">
            {aiInstructions.map((instruction) => (
              <Card key={instruction.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{instruction.instruction_key}</CardTitle>
                  {instruction.description && (
                    <p className="text-sm text-muted-foreground">{instruction.description}</p>
                  )}
                </CardHeader>
                <CardContent>
                  <p className="text-sm whitespace-pre-wrap">{instruction.instruction_value}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <h2 className="text-2xl font-bold">الإعدادات المتقدمة</h2>
          <div className="space-y-4">
            {advancedSettings.map((setting) => (
              <Card key={setting.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{setting.setting_key}</CardTitle>
                  {setting.description && (
                    <p className="text-sm text-muted-foreground">{setting.description}</p>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{setting.setting_type}</Badge>
                    <span className="text-sm">{setting.setting_value}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
