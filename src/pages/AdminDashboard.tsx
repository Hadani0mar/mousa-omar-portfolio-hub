import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  BarChart3, 
  Users, 
  Globe, 
  TrendingUp,
  LogOut,
  Home,
  Bell,
  Send
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Link } from 'react-router-dom';

interface Project {
  id?: string;
  title: string;
  description: string;
  technologies: string[];
  github_url: string;
  demo_url: string;
  image_url: string;
  code_content: string;
  is_featured: boolean;
}

interface Notification {
  id?: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning';
  expires_at: string;
  created_at: string;
}

export default function AdminDashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [editingNotification, setEditingNotification] = useState<Notification | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isCreatingNotification, setIsCreatingNotification] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Mock analytics data
  const analytics = {
    totalVisits: 1250,
    todayVisits: 45,
    topPages: [],
    recentVisits: []
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const uploadImage = async (file: File): Promise<string> => {
    // Since we don't have proper storage setup, we'll create a data URL
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.readAsDataURL(file);
    });
  };

  const saveProject = async () => {
    if (!editingProject) return;

    try {
      setLoading(true);
      
      let imageUrl = editingProject.image_url;
      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }

      const projectData = {
        ...editingProject,
        image_url: imageUrl,
        technologies: editingProject.technologies.filter(tech => tech.trim() !== '')
      };

      const existingProjects = JSON.parse(localStorage.getItem('portfolio-projects') || '[]');
      
      if (isCreating) {
        const newProject = { ...projectData, id: Date.now().toString() };
        const updatedProjects = [...existingProjects, newProject];
        localStorage.setItem('portfolio-projects', JSON.stringify(updatedProjects));
        setProjects(updatedProjects);
      } else {
        const updatedProjects = existingProjects.map((p: Project) => 
          p.id === editingProject.id ? projectData : p
        );
        localStorage.setItem('portfolio-projects', JSON.stringify(updatedProjects));
        setProjects(updatedProjects);
      }

      setEditingProject(null);
      setIsCreating(false);
      setImageFile(null);
      
      toast({
        title: "نجح الحفظ",
        description: `تم ${isCreating ? 'إنشاء' : 'تحديث'} المشروع بنجاح!`,
      });
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteProject = async (id: string) => {
    try {
      const existingProjects = JSON.parse(localStorage.getItem('portfolio-projects') || '[]');
      const updatedProjects = existingProjects.filter((p: Project) => p.id !== id);
      localStorage.setItem('portfolio-projects', JSON.stringify(updatedProjects));
      setProjects(updatedProjects);
      
      toast({
        title: "تم الحذف",
        description: "تم حذف المشروع بنجاح!",
      });
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const saveNotification = async () => {
    if (!editingNotification) return;

    try {
      setLoading(true);
      
      const notificationData = {
        ...editingNotification,
        created_at: isCreatingNotification ? new Date().toISOString() : editingNotification.created_at
      };

      const existingNotifications = JSON.parse(localStorage.getItem('portfolio-notifications') || '[]');
      
      if (isCreatingNotification) {
        const newNotification = { ...notificationData, id: Date.now().toString() };
        const updatedNotifications = [...existingNotifications, newNotification];
        localStorage.setItem('portfolio-notifications', JSON.stringify(updatedNotifications));
        setNotifications(updatedNotifications);
      } else {
        const updatedNotifications = existingNotifications.map((n: Notification) => 
          n.id === editingNotification.id ? notificationData : n
        );
        localStorage.setItem('portfolio-notifications', JSON.stringify(updatedNotifications));
        setNotifications(updatedNotifications);
      }

      setEditingNotification(null);
      setIsCreatingNotification(false);
      
      toast({
        title: "نجح الحفظ",
        description: `تم ${isCreatingNotification ? 'إنشاء' : 'تحديث'} التحديث بنجاح!`,
      });
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      const existingNotifications = JSON.parse(localStorage.getItem('portfolio-notifications') || '[]');
      const updatedNotifications = existingNotifications.filter((n: Notification) => n.id !== id);
      localStorage.setItem('portfolio-notifications', JSON.stringify(updatedNotifications));
      setNotifications(updatedNotifications);
      
      toast({
        title: "تم الحذف",
        description: "تم حذف التحديث بنجاح!",
      });
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const startCreating = () => {
    setEditingProject({
      title: '',
      description: '',
      technologies: [''],
      github_url: '',
      demo_url: '',
      image_url: '',
      code_content: '',
      is_featured: false
    });
    setIsCreating(true);
  };

  const startCreatingNotification = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    setEditingNotification({
      title: '',
      message: '',
      type: 'info',
      expires_at: tomorrow.toISOString().split('T')[0],
      created_at: new Date().toISOString()
    });
    setIsCreatingNotification(true);
  };

  const addTechnology = () => {
    if (editingProject) {
      setEditingProject({
        ...editingProject,
        technologies: [...editingProject.technologies, '']
      });
    }
  };

  const updateTechnology = (index: number, value: string) => {
    if (editingProject) {
      const newTechnologies = [...editingProject.technologies];
      newTechnologies[index] = value;
      setEditingProject({
        ...editingProject,
        technologies: newTechnologies
      });
    }
  };

  const removeTechnology = (index: number) => {
    if (editingProject) {
      const newTechnologies = editingProject.technologies.filter((_, i) => i !== index);
      setEditingProject({
        ...editingProject,
        technologies: newTechnologies
      });
    }
  };

  // Load data on component mount
  React.useEffect(() => {
    const existingProjects = JSON.parse(localStorage.getItem('portfolio-projects') || '[]');
    const existingNotifications = JSON.parse(localStorage.getItem('portfolio-notifications') || '[]');
    setProjects(existingProjects);
    setNotifications(existingNotifications);
  }, []);

  if (!user || !isAdmin) {
    navigate('/admin');
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between px-4">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold">لوحة التحكم</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/">
              <Button variant="ghost" size="sm" className="gap-2">
                <Home className="h-4 w-4" />
                الرئيسية
              </Button>
            </Link>
            <ThemeToggle />
            <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2">
              <LogOut className="h-4 w-4" />
              تسجيل الخروج
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto p-4 md:p-6">
        <Tabs defaultValue="analytics" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="analytics">الإحصائيات</TabsTrigger>
            <TabsTrigger value="projects">المشاريع</TabsTrigger>
            <TabsTrigger value="notifications">التحديثات</TabsTrigger>
          </TabsList>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">إجمالي الزيارات</CardTitle>
                  <Globe className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics.totalVisits}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">زيارات اليوم</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics.todayVisits}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">إجمالي المشاريع</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{projects.length}</div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Projects Tab */}
          <TabsContent value="projects" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">إدارة المشاريع</h2>
              <Button onClick={startCreating} className="gap-2">
                <Plus className="h-4 w-4" />
                إضافة مشروع
              </Button>
            </div>

            {/* Project Form */}
            {editingProject && (
              <Card>
                <CardHeader>
                  <CardTitle>{isCreating ? 'إنشاء مشروع جديد' : 'تعديل المشروع'}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>العنوان</Label>
                      <Input
                        value={editingProject.title}
                        onChange={(e) => setEditingProject({
                          ...editingProject,
                          title: e.target.value
                        })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>رابط GitHub</Label>
                      <Input
                        value={editingProject.github_url}
                        onChange={(e) => setEditingProject({
                          ...editingProject,
                          github_url: e.target.value
                        })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>الوصف</Label>
                    <Textarea
                      value={editingProject.description}
                      onChange={(e) => setEditingProject({
                        ...editingProject,
                        description: e.target.value
                      })}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>رابط العرض التوضيحي</Label>
                      <Input
                        value={editingProject.demo_url}
                        onChange={(e) => setEditingProject({
                          ...editingProject,
                          demo_url: e.target.value
                        })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>صورة المشروع</Label>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>التقنيات المستخدمة</Label>
                    {editingProject.technologies.map((tech, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          value={tech}
                          onChange={(e) => updateTechnology(index, e.target.value)}
                          placeholder="اسم التقنية"
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => removeTechnology(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button variant="outline" onClick={addTechnology} className="gap-2">
                      <Plus className="h-4 w-4" />
                      إضافة تقنية
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label>محتوى الكود (اختياري)</Label>
                    <Textarea
                      value={editingProject.code_content}
                      onChange={(e) => setEditingProject({
                        ...editingProject,
                        code_content: e.target.value
                      })}
                      placeholder="ألصق الكود هنا لعرضه في عارض الكود..."
                      className="min-h-32 font-mono"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="featured"
                      checked={editingProject.is_featured}
                      onCheckedChange={(checked) => setEditingProject({
                        ...editingProject,
                        is_featured: checked
                      })}
                    />
                    <Label htmlFor="featured">مشروع مميز</Label>
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={saveProject} disabled={loading} className="gap-2">
                      <Save className="h-4 w-4" />
                      {loading ? 'جاري الحفظ...' : 'حفظ'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setEditingProject(null);
                        setIsCreating(false);
                        setImageFile(null);
                      }}
                    >
                      إلغاء
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Projects List */}
            <div className="grid gap-4">
              {projects.map((project) => (
                <Card key={project.id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold">{project.title}</h3>
                          {project.is_featured && (
                            <Badge variant="default">مميز</Badge>
                          )}
                        </div>
                        <p className="text-muted-foreground mb-3">{project.description}</p>
                        <div className="flex flex-wrap gap-2 mb-3">
                          {project.technologies.map((tech) => (
                            <Badge key={tech} variant="secondary">{tech}</Badge>
                          ))}
                        </div>
                        <div className="flex gap-4 text-sm text-muted-foreground">
                          {project.github_url && <span>GitHub</span>}
                          {project.demo_url && <span>عرض توضيحي</span>}
                          {project.code_content && <span>عارض الكود</span>}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            setEditingProject(project);
                            setIsCreating(false);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => deleteProject(project.id!)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {projects.length === 0 && (
                <Card>
                  <CardContent className="p-12 text-center">
                    <p className="text-muted-foreground">لا توجد مشاريع بعد. أنشئ مشروعك الأول!</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">إدارة التحديثات</h2>
              <Button onClick={startCreatingNotification} className="gap-2">
                <Plus className="h-4 w-4" />
                إضافة تحديث
              </Button>
            </div>

            {/* Notification Form */}
            {editingNotification && (
              <Card>
                <CardHeader>
                  <CardTitle>{isCreatingNotification ? 'إنشاء تحديث جديد' : 'تعديل التحديث'}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>العنوان</Label>
                      <Input
                        value={editingNotification.title}
                        onChange={(e) => setEditingNotification({
                          ...editingNotification,
                          title: e.target.value
                        })}
                        placeholder="عنوان التحديث"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>النوع</Label>
                      <Select 
                        value={editingNotification.type} 
                        onValueChange={(value: 'info' | 'success' | 'warning') => 
                          setEditingNotification({
                            ...editingNotification,
                            type: value
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="info">معلومات</SelectItem>
                          <SelectItem value="success">نجاح</SelectItem>
                          <SelectItem value="warning">تحذير</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>الرسالة</Label>
                    <Textarea
                      value={editingNotification.message}
                      onChange={(e) => setEditingNotification({
                        ...editingNotification,
                        message: e.target.value
                      })}
                      placeholder="محتوى التحديث"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>تاريخ الانتهاء</Label>
                    <Input
                      type="date"
                      value={editingNotification.expires_at.split('T')[0]}
                      onChange={(e) => setEditingNotification({
                        ...editingNotification,
                        expires_at: e.target.value + 'T23:59:59.999Z'
                      })}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={saveNotification} disabled={loading} className="gap-2">
                      <Save className="h-4 w-4" />
                      {loading ? 'جاري الحفظ...' : 'حفظ'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setEditingNotification(null);
                        setIsCreatingNotification(false);
                      }}
                    >
                      إلغاء
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Notifications List */}
            <div className="grid gap-4">
              {notifications.map((notification) => (
                <Card key={notification.id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold">{notification.title}</h3>
                          <Badge 
                            variant={
                              notification.type === 'success' ? 'default' : 
                              notification.type === 'warning' ? 'destructive' : 'secondary'
                            }
                          >
                            {notification.type === 'info' ? 'معلومات' : 
                             notification.type === 'success' ? 'نجاح' : 'تحذير'}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground mb-3">{notification.message}</p>
                        <div className="flex gap-4 text-sm text-muted-foreground">
                          <span>الإنشاء: {new Date(notification.created_at).toLocaleDateString('ar-SA')}</span>
                          <span>الانتهاء: {new Date(notification.expires_at).toLocaleDateString('ar-SA')}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            setEditingNotification(notification);
                            setIsCreatingNotification(false);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => deleteNotification(notification.id!)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {notifications.length === 0 && (
                <Card>
                  <CardContent className="p-12 text-center">
                    <p className="text-muted-foreground">لا توجد تحديثات بعد. أنشئ تحديثك الأول!</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
