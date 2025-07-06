import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Trash2, Edit, Plus, Download, Calendar, Clock, Star, Upload, Globe, Eye, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ProjectForm } from '@/components/admin/ProjectForm';
import { NotificationForm } from '@/components/admin/NotificationForm';
import { SkillsManager } from '@/components/admin/SkillsManager';
import { downloadProjectFiles } from '@/utils/projectDownloader';
import { Label } from '@/components/ui/label';
import WebsiteShowcase from '@/components/WebsiteShowcase';
import NotificationsPopup from '@/components/NotificationsPopup';

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
  download_count?: number;
  like_count?: number;
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
  const [showWebsiteForm, setShowWebsiteForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [showTerminal, setShowTerminal] = useState(true);
  const { toast } = useToast();
  const [editingAIInstruction, setEditingAIInstruction] = useState<string | null>(null);
  const [editingAdvancedSetting, setEditingAdvancedSetting] = useState<string | null>(null);
  const [tempValues, setTempValues] = useState<{ [key: string]: string }>({});

  // Project form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [technologies, setTechnologies] = useState('');
  const [htmlContent, setHtmlContent] = useState('');
  const [cssContent, setCssContent] = useState('');
  const [jsContent, setJsContent] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [displayOrder, setDisplayOrder] = useState(0);
  const [projectStatus, setProjectStatus] = useState('active');

  // Notification form states
  const [notificationTitle, setNotificationTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState<'info' | 'success' | 'warning'>('info');
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

  const updateTerminalSetting = async (value: boolean) => {
    try {
      const { error } = await supabase
        .from('site_config')
        .update({ show_terminal: value })
        .eq('id', 1);

      if (error) throw error;

      setShowTerminal(value);
      toast({
        title: "تم التحديث",
        description: "تم تحديث إعدادات Terminal بنجاح",
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

  const handleProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const projectData = {
        title,
        description,
        technologies: technologies.split(',').map(t => t.trim()).filter(t => t),
        html_content: htmlContent,
        css_content: cssContent,
        js_content: jsContent,
        is_featured: isFeatured,
        display_order: displayOrder,
        project_status: projectStatus,
      };

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
          title: "تم النشر",
          description: "تم نشر المشروع بنجاح",
        });
      }

      resetProjectForm();
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
    
    try {
      const hoursToAdd = parseInt(expirationHours);
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + hoursToAdd);

      const { error } = await supabase
        .from('notifications')
        .insert([{
          title: notificationTitle,
          message,
          type,
          expires_at: expiresAt.toISOString(),
        }]);

      if (error) throw error;

      toast({
        title: "تم النشر",
        description: "تم نشر التحديث بنجاح",
      });

      // Reset form
      setNotificationTitle('');
      setMessage('');
      setType('info');
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

  const updateAIInstruction = async (id: string, value: string) => {
    try {
      const { error } = await supabase
        .from('ai_instructions')
        .update({ instruction_value: value })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "تم التحديث",
        description: "تم تحديث تعليمة الذكاء الاصطناعي بنجاح",
      });

      setEditingAIInstruction(null);
      loadData();
    } catch (error) {
      console.error('Error updating AI instruction:', error);
      toast({
        title: "خطأ",
        description: "فشل في تحديث التعليمة",
        variant: "destructive",
      });
    }
  };

  const updateAdvancedSetting = async (id: string, value: string) => {
    try {
      const { error } = await supabase
        .from('advanced_settings')
        .update({ setting_value: value })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "تم التحديث",
        description: "تم تحديث الإعداد بنجاح",
      });

      setEditingAdvancedSetting(null);
      loadData();
    } catch (error) {
      console.error('Error updating advanced setting:', error);
      toast({
        title: "خطأ",
        description: "فشل في تحديث الإعداد",
        variant: "destructive",
      });
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

  const handleEditProject = (project: Project) => {
    setTitle(project.title);
    setDescription(project.description);
    setTechnologies(project.technologies.join(', '));
    setHtmlContent(project.html_content);
    setCssContent(project.css_content || '');
    setJsContent(project.js_content || '');
    setIsFeatured(project.is_featured);
    setDisplayOrder(project.display_order);
    setProjectStatus(project.project_status);
    setEditingProject(project);
    setShowProjectForm(true);
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

  return (
    <div className="container mx-auto p-6 space-y-6 animate-fade-in">
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
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="projects">المشاريع</TabsTrigger>
          <TabsTrigger value="notifications">التحديثات</TabsTrigger>
          <TabsTrigger value="websites">المواقع</TabsTrigger>
          <TabsTrigger value="skills">المهارات</TabsTrigger>
          <TabsTrigger value="ai">تعليمات AI</TabsTrigger>
          <TabsTrigger value="settings">الإعدادات</TabsTrigger>
        </TabsList>

        <TabsContent value="projects" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">إدارة المشاريع</h2>
            <Button onClick={() => setShowProjectForm(!showProjectForm)} className="hover-scale">
              <Plus className="h-4 w-4 mr-2" />
              إضافة مشروع جديد
            </Button>
          </div>

          <ProjectForm
            showForm={showProjectForm}
            editingProject={!!editingProject}
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
            onCancel={resetProjectForm}
          />

          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Card key={project.id} className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
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
                    <div className="flex items-center gap-4">
                      <span>التنزيلات: {project.download_count || 0}</span>
                      <span>الإعجابات: {project.like_count || 0}</span>
                    </div>
                    <div className="mt-1">
                      تاريخ الإنشاء: {formatDate(project.created_at)}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => downloadProjectFiles(project)} className="hover-scale">
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleEditProject(project)} className="hover-scale">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => deleteProject(project.id)} className="hover-scale">
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
            <Button onClick={() => setShowNotificationForm(!showNotificationForm)} className="hover-scale">
              <Plus className="h-4 w-4 mr-2" />
              إضافة تحديث جديد
            </Button>
          </div>

          <NotificationForm
            showForm={showNotificationForm}
            title={notificationTitle}
            setTitle={setNotificationTitle}
            message={message}
            setMessage={setMessage}
            type={type}
            setType={setType}
            expirationHours={expirationHours}
            setExpirationHours={setExpirationHours}
            onSubmit={handleNotificationSubmit}
            onCancel={() => setShowNotificationForm(false)}
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

        <TabsContent value="websites" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">إدارة المواقع</h2>
            <Button onClick={() => setShowWebsiteForm(!showWebsiteForm)} className="hover-scale">
              <Plus className="h-4 w-4 mr-2" />
              إضافة موقع جديد
            </Button>
          </div>

          <WebsiteShowcase />
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
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{instruction.instruction_key}</CardTitle>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        if (editingAIInstruction === instruction.id) {
                          updateAIInstruction(instruction.id, tempValues[instruction.id] || instruction.instruction_value);
                        } else {
                          setEditingAIInstruction(instruction.id);
                          setTempValues(prev => ({
                            ...prev,
                            [instruction.id]: instruction.instruction_value
                          }));
                        }
                      }}
                    >
                      {editingAIInstruction === instruction.id ? (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          حفظ
                        </>
                      ) : (
                        <>
                          <Edit className="h-4 w-4 mr-2" />
                          تعديل
                        </>
                      )}
                    </Button>
                  </div>
                  {instruction.description && (
                    <p className="text-sm text-muted-foreground">{instruction.description}</p>
                  )}
                </CardHeader>
                <CardContent>
                  {editingAIInstruction === instruction.id ? (
                    <div className="space-y-3">
                      <Textarea
                        value={tempValues[instruction.id] || instruction.instruction_value}
                        onChange={(e) => setTempValues(prev => ({
                          ...prev,
                          [instruction.id]: e.target.value
                        }))}
                        rows={6}
                        className="resize-none"
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => updateAIInstruction(instruction.id, tempValues[instruction.id] || instruction.instruction_value)}
                        >
                          حفظ التغييرات
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingAIInstruction(null);
                            setTempValues(prev => {
                              const { [instruction.id]: _, ...rest } = prev;
                              return rest;
                            });
                          }}
                        >
                          إلغاء
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm whitespace-pre-wrap break-words">
                      {instruction.instruction_value}
                    </p>
                  )}
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
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{setting.setting_key}</CardTitle>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        if (editingAdvancedSetting === setting.id) {
                          updateAdvancedSetting(setting.id, tempValues[setting.id] || setting.setting_value);
                        } else {
                          setEditingAdvancedSetting(setting.id);
                          setTempValues(prev => ({
                            ...prev,
                            [setting.id]: setting.setting_value
                          }));
                        }
                      }}
                    >
                      {editingAdvancedSetting === setting.id ? (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          حفظ
                        </>
                      ) : (
                        <>
                          <Edit className="h-4 w-4 mr-2" />
                          تعديل
                        </>
                      )}
                    </Button>
                  </div>
                  {setting.description && (
                    <p className="text-sm text-muted-foreground">{setting.description}</p>
                  )}
                </CardHeader>
                <CardContent>
                  {editingAdvancedSetting === setting.id ? (
                    <div className="space-y-3">
                      {setting.setting_type === 'boolean' ? (
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={tempValues[setting.id] === 'true'}
                            onCheckedChange={(checked) => setTempValues(prev => ({
                              ...prev,
                              [setting.id]: checked.toString()
                            }))}
                          />
                          <Label>تفعيل/إلغاء تفعيل</Label>
                        </div>
                      ) : setting.setting_type === 'number' ? (
                        <Input
                          type="number"
                          value={tempValues[setting.id] || setting.setting_value}
                          onChange={(e) => setTempValues(prev => ({
                            ...prev,
                            [setting.id]: e.target.value
                          }))}
                        />
                      ) : (
                        <Textarea
                          value={tempValues[setting.id] || setting.setting_value}
                          onChange={(e) => setTempValues(prev => ({
                            ...prev,
                            [setting.id]: e.target.value
                          }))}
                          rows={3}
                        />
                      )}
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => updateAdvancedSetting(setting.id, tempValues[setting.id] || setting.setting_value)}
                        >
                          حفظ التغييرات
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingAdvancedSetting(null);
                            setTempValues(prev => {
                              const { [setting.id]: _, ...rest } = prev;
                              return rest;
                            });
                          }}
                        >
                          إلغاء
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{setting.setting_type}</Badge>
                      <span className="text-sm">{setting.setting_value}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
