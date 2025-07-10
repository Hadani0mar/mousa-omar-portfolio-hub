
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
import { TopNavigationBar } from '@/components/TopNavigationBar';
import { useToast } from '@/hooks/use-toast';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">إجمالي المشاريع</CardTitle>
                    <Code className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">--</div>
                    <p className="text-xs text-muted-foreground">جميع المشاريع المنشورة</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">القوالب الجاهزة</CardTitle>
                    <Package className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">--</div>
                    <p className="text-xs text-muted-foreground">القوالب المتاحة للبيع</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">المواقع المنشورة</CardTitle>
                    <Globe className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">--</div>
                    <p className="text-xs text-muted-foreground">المواقع النشطة</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">الإشعارات النشطة</CardTitle>
                    <Bell className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">--</div>
                    <p className="text-xs text-muted-foreground">الإشعارات المعروضة</p>
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
                </CardHeader>
                <CardContent>
                  <ProjectForm />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="templates">
              <TemplatesManager />
            </TabsContent>

            <TabsContent value="websites">
              <Card>
                <CardHeader>
                  <CardTitle>إدارة المواقع المنشورة</CardTitle>
                  <CardDescription>
                    إضافة وتعديل المواقع المعروضة في قسم المواقع المنشورة
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">قريباً...</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notifications">
              <Card>
                <CardHeader>
                  <CardTitle>إدارة الإشعارات</CardTitle>
                  <CardDescription>
                    إنشاء وإدارة الإشعارات المعروضة للزوار
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <NotificationForm />
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
