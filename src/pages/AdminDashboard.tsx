
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Upload, 
  Save, 
  X, 
  BarChart3, 
  Users, 
  Globe, 
  TrendingUp,
  LogOut,
  Home
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
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

interface Analytics {
  totalVisits: number;
  todayVisits: number;
  topPages: { page_path: string; count: number }[];
  recentVisits: any[];
}

export default function AdminDashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [analytics, setAnalytics] = useState<Analytics>({
    totalVisits: 0,
    todayVisits: 0,
    topPages: [],
    recentVisits: []
  });
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!user || !isAdmin) {
      navigate('/admin');
      return;
    }
    fetchProjects();
    fetchAnalytics();
  }, [user, isAdmin, navigate]);

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      // Get total visits
      const { count: totalVisits } = await supabase
        .from('site_analytics')
        .select('*', { count: 'exact', head: true });

      // Get today's visits
      const today = new Date().toISOString().split('T')[0];
      const { count: todayVisits } = await supabase
        .from('site_analytics')
        .select('*', { count: 'exact', head: true })
        .gte('visited_at', today);

      // Get recent visits
      const { data: recentVisits } = await supabase
        .from('site_analytics')
        .select('*')
        .order('visited_at', { ascending: false })
        .limit(10);

      setAnalytics({
        totalVisits: totalVisits || 0,
        todayVisits: todayVisits || 0,
        topPages: [],
        recentVisits: recentVisits || []
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const uploadImage = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('project-images')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('project-images')
      .getPublicUrl(filePath);

    return data.publicUrl;
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

      if (isCreating) {
        const { error } = await supabase
          .from('projects')
          .insert([projectData]);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('projects')
          .update(projectData)
          .eq('id', editingProject.id);
        if (error) throw error;
      }

      await fetchProjects();
      setEditingProject(null);
      setIsCreating(false);
      setImageFile(null);
      
      toast({
        title: "Success",
        description: `Project ${isCreating ? 'created' : 'updated'} successfully!`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteProject = async (id: string) => {
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      await fetchProjects();
      toast({
        title: "Success",
        description: "Project deleted successfully!",
      });
    } catch (error: any) {
      toast({
        title: "Error",
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold">Admin Dashboard</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/">
              <Button variant="ghost" size="sm" className="gap-2">
                <Home className="h-4 w-4" />
                Home
              </Button>
            </Link>
            <ThemeToggle />
            <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2">
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto p-6">
        <Tabs defaultValue="analytics" className="space-y-6">
          <TabsList>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
          </TabsList>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Visits</CardTitle>
                  <Globe className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics.totalVisits}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Today's Visits</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics.todayVisits}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{projects.length}</div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Recent Visits</CardTitle>
                <CardDescription>Latest visitor activity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.recentVisits.map((visit, index) => (
                    <div key={index} className="flex items-center justify-between border-b pb-2">
                      <div>
                        <p className="font-medium">{visit.page_path}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(visit.visited_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  {analytics.recentVisits.length === 0 && (
                    <p className="text-muted-foreground">No visits recorded yet.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Projects Tab */}
          <TabsContent value="projects" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Projects Management</h2>
              <Button onClick={startCreating} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Project
              </Button>
            </div>

            {/* Project Form */}
            {editingProject && (
              <Card>
                <CardHeader>
                  <CardTitle>{isCreating ? 'Create New Project' : 'Edit Project'}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Title</Label>
                      <Input
                        value={editingProject.title}
                        onChange={(e) => setEditingProject({
                          ...editingProject,
                          title: e.target.value
                        })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>GitHub URL</Label>
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
                    <Label>Description</Label>
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
                      <Label>Demo URL</Label>
                      <Input
                        value={editingProject.demo_url}
                        onChange={(e) => setEditingProject({
                          ...editingProject,
                          demo_url: e.target.value
                        })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Project Image</Label>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Technologies</Label>
                    {editingProject.technologies.map((tech, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          value={tech}
                          onChange={(e) => updateTechnology(index, e.target.value)}
                          placeholder="Technology name"
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
                      Add Technology
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label>Code Content (Optional)</Label>
                    <Textarea
                      value={editingProject.code_content}
                      onChange={(e) => setEditingProject({
                        ...editingProject,
                        code_content: e.target.value
                      })}
                      placeholder="Paste your code here to display in the code viewer..."
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
                    <Label htmlFor="featured">Featured Project</Label>
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={saveProject} disabled={loading} className="gap-2">
                      <Save className="h-4 w-4" />
                      {loading ? 'Saving...' : 'Save'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setEditingProject(null);
                        setIsCreating(false);
                        setImageFile(null);
                      }}
                    >
                      Cancel
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
                            <Badge variant="default">Featured</Badge>
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
                          {project.demo_url && <span>Demo</span>}
                          {project.code_content && <span>Code Viewer</span>}
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
              {projects.length === 0 && !loading && (
                <Card>
                  <CardContent className="p-12 text-center">
                    <p className="text-muted-foreground">No projects yet. Create your first project!</p>
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
