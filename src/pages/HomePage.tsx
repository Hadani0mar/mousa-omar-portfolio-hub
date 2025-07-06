import React, { useState, useEffect } from 'react';
import { ProjectCard } from '@/components/ProjectCard';
import { SEO } from '@/components/SEO';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowDown, Github, Linkedin, Mail, Phone, Code, Globe, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import NotificationsPopup from '@/components/NotificationsPopup';
import WebsiteShowcase from '@/components/WebsiteShowcase';

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

interface Skill {
  id: string;
  name: string;
  created_at: string;
}

export default function HomePage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load projects
      const { data: projectsData } = await supabase
        .from('projects')
        .select('*')
        .eq('project_status', 'active')
        .order('display_order', { ascending: true });

      if (projectsData) {
        setProjects(projectsData);
      }

      // Load skills
      const { data: skillsData } = await supabase
        .from('skills')
        .select('*')
        .order('name', { ascending: true });

      if (skillsData) {
        setSkills(skillsData);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProjectInteraction = async (projectId: string, type: 'download' | 'like') => {
    try {
      const { error } = await supabase.rpc(
        type === 'download' ? 'increment_download_count' : 'increment_like_count',
        { row_id: projectId }
      );

      if (error) {
        console.error(`Error incrementing ${type} count:`, error);
      } else {
        // Optimistically update the project in the state
        setProjects(prevProjects =>
          prevProjects.map(project =>
            project.id === projectId
              ? {
                  ...project,
                  download_count: (project.download_count || 0) + (type === 'download' ? 1 : 0),
                  like_count: (project.like_count || 0) + (type === 'like' ? 1 : 0),
                }
              : project
          )
        );
      }
    } catch (error) {
      console.error(`Error incrementing ${type} count:`, error);
    }
  };

  return (
    <>
      <SEO />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900">
        {/* Header with Notifications */}
        <header className="fixed top-0 right-0 z-50 p-4">
          <NotificationsPopup />
        </header>

        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
          <div className="text-center space-y-8 max-w-4xl mx-auto relative z-10">
            <div className="space-y-4 animate-fade-in">
              <Badge variant="secondary" className="px-4 py-2 text-sm font-medium">
                <Sparkles className="h-4 w-4 mr-2" />
                مطور ويب محترف
              </Badge>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                مرحباً، أنا موسى عمر
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                مطور مواقع ليبي متخصص في تطوير واجهات المستخدم الحديثة والتفاعلية باستخدام أحدث التقنيات
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-4 animate-fade-in">
              <Badge variant="outline" className="px-3 py-1">HTML5</Badge>
              <Badge variant="outline" className="px-3 py-1">CSS3</Badge>
              <Badge variant="outline" className="px-3 py-1">JavaScript</Badge>
              <Badge variant="outline" className="px-3 py-1">React</Badge>
              <Badge variant="outline" className="px-3 py-1">Next.js</Badge>
              <Badge variant="outline" className="px-3 py-1">TypeScript</Badge>
              <Badge variant="outline" className="px-3 py-1">Tailwind CSS</Badge>
              <Badge variant="outline" className="px-3 py-1">n8n</Badge>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in">
              <Button size="lg" className="px-8 py-3 text-lg hover-scale">
                <Code className="h-5 w-5 mr-2" />
                استعرض أعمالي
              </Button>
              <Button size="lg" variant="outline" className="px-8 py-3 text-lg hover-scale">
                <Phone className="h-5 w-5 mr-2" />
                تواصل معي
              </Button>
            </div>

            <div className="animate-bounce mt-12">
              <ArrowDown className="h-8 w-8 mx-auto text-muted-foreground" />
            </div>
          </div>
        </section>

        {/* Projects Section */}
        <section className="py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">مشاريعي</h2>
              <p className="text-xl text-muted-foreground">
                مجموعة مختارة من أفضل أعمالي في تطوير الويب
              </p>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="h-4 bg-muted rounded mb-4"></div>
                      <div className="h-3 bg-muted rounded mb-2"></div>
                      <div className="h-3 bg-muted rounded mb-4"></div>
                      <div className="flex gap-2">
                        <div className="h-6 w-16 bg-muted rounded"></div>
                        <div className="h-6 w-20 bg-muted rounded"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    onInteraction={handleProjectInteraction}
                  />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Website Showcase Section */}
        <section className="py-20 px-4 bg-muted/30">
          <div className="max-w-7xl mx-auto">
            <WebsiteShowcase />
          </div>
        </section>

        {/* Skills Section */}
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-8">مهاراتي التقنية</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {skills.map((skill) => (
                <Card key={skill.id} className="p-6 hover:shadow-lg transition-all duration-300 hover-scale">
                  <CardContent className="p-0 text-center">
                    <Code className="h-8 w-8 mx-auto mb-3 text-primary" />
                    <h3 className="font-semibold">{skill.name}</h3>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-20 px-4 bg-muted/30">
          <div className="max-w-2xl mx-auto text-center space-y-8">
            <h2 className="text-3xl md:text-4xl font-bold">تواصل معي</h2>
            <p className="text-xl text-muted-foreground">
              هل لديك مشروع في ذهنك؟ دعنا نتحدث ونحول فكرتك إلى واقع
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="hover-scale">
                <Mail className="h-5 w-5 mr-2" />
                البريد الإلكتروني
              </Button>
              <Button size="lg" variant="outline" className="hover-scale">
                <Phone className="h-5 w-5 mr-2" />
                الهاتف
              </Button>
            </div>

            <div className="flex justify-center gap-6 pt-8">
              <Button variant="ghost" size="icon" className="hover-scale">
                <Github className="h-6 w-6" />
              </Button>
              <Button variant="ghost" size="icon" className="hover-scale">
                <Linkedin className="h-6 w-6" />
              </Button>
              <Button variant="ghost" size="icon" className="hover-scale">
                <Globe className="h-6 w-6" />
              </Button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 px-4 border-t">
          <div className="max-w-4xl mx-auto text-center text-muted-foreground">
            <p>&copy; 2024 موسى عمر. جميع الحقوق محفوظة.</p>
          </div>
        </footer>
      </div>
    </>
  );
}
