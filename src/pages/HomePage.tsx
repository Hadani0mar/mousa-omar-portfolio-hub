
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

const skillCategories = {
  frontend: ['HTML5', 'CSS3', 'JavaScript', 'React', 'TypeScript', 'Tailwind CSS'],
  backend: ['Node.js', 'Python', 'PHP', 'MySQL', 'MongoDB'],
  tools: ['Git', 'Docker', 'VS Code', 'Figma', 'Photoshop'],
  other: []
};

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

  const categorizeSkills = (skills: Skill[]) => {
    const categorized = { ...skillCategories };
    
    skills.forEach(skill => {
      let placed = false;
      Object.keys(skillCategories).forEach(category => {
        if (skillCategories[category as keyof typeof skillCategories].includes(skill.name)) {
          placed = true;
        }
      });
      
      if (!placed) {
        categorized.other.push(skill.name);
      }
    });
    
    return categorized;
  };

  const skillCats = categorizeSkills(skills);

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
            <div className="space-y-6 animate-fade-in">
              <Badge variant="secondary" className="px-6 py-3 text-base font-medium shadow-lg">
                <Sparkles className="h-5 w-5 mr-2" />
                مطور ويب محترف
              </Badge>
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent leading-tight">
                مرحباً، أنا موسى عمر
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                مطور مواقع ليبي متخصص في تطوير واجهات المستخدم الحديثة والتفاعلية باستخدام أحدث التقنيات
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in">
              <Button size="lg" className="px-8 py-4 text-lg hover-scale bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <Code className="h-5 w-5 mr-2" />
                استعرض أعمالي
              </Button>
              <Button size="lg" variant="outline" className="px-8 py-4 text-lg hover-scale">
                <Phone className="h-5 w-5 mr-2" />
                تواصل معي
              </Button>
            </div>

            <div className="animate-bounce mt-16">
              <ArrowDown className="h-8 w-8 mx-auto text-muted-foreground" />
            </div>
          </div>
        </section>

        {/* Skills Section - Improved */}
        <section className="py-20 px-4 bg-muted/30">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">مهاراتي التقنية</h2>
              <p className="text-xl text-muted-foreground">التقنيات والأدوات التي أتقنها</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Frontend Skills */}
              <Card className="p-6 hover:shadow-xl transition-all duration-300 hover-scale border-2 hover:border-blue-500/50">
                <CardContent className="p-0">
                  <div className="flex items-center mb-4">
                    <Code className="h-8 w-8 text-blue-500 mr-3" />
                    <h3 className="text-xl font-bold">تطوير الواجهات</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {skillCats.frontend.map((skill) => (
                      <Badge key={skill} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Backend Skills */}
              <Card className="p-6 hover:shadow-xl transition-all duration-300 hover-scale border-2 hover:border-green-500/50">
                <CardContent className="p-0">
                  <div className="flex items-center mb-4">
                    <Globe className="h-8 w-8 text-green-500 mr-3" />
                    <h3 className="text-xl font-bold">تطوير الخادم</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {skillCats.backend.map((skill) => (
                      <Badge key={skill} variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Tools */}
              <Card className="p-6 hover:shadow-xl transition-all duration-300 hover-scale border-2 hover:border-purple-500/50">
                <CardContent className="p-0">
                  <div className="flex items-center mb-4">
                    <Sparkles className="h-8 w-8 text-purple-500 mr-3" />
                    <h3 className="text-xl font-bold">الأدوات والبرمجيات</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {skillCats.tools.map((skill) => (
                      <Badge key={skill} variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Projects Section */}
        <section className="py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">مشاريعي</h2>
              <p className="text-xl text-muted-foreground">
                مجموعة مختارة من أفضل أعمالي في تطوير الويب
              </p>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {projects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
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

        {/* Contact Section */}
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h2 className="text-4xl md:text-5xl font-bold">تواصل معي</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              هل لديك مشروع في ذهنك؟ دعنا نتحدث ونحول فكرتك إلى واقع
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="hover-scale px-8 py-4 text-lg bg-gradient-to-r from-blue-600 to-purple-600">
                <Mail className="h-5 w-5 mr-2" />
                البريد الإلكتروني
              </Button>
              <Button size="lg" variant="outline" className="hover-scale px-8 py-4 text-lg">
                <Phone className="h-5 w-5 mr-2" />
                الهاتف
              </Button>
            </div>

            <div className="flex justify-center gap-6 pt-8">
              <Button variant="ghost" size="icon" className="hover-scale h-12 w-12">
                <Github className="h-6 w-6" />
              </Button>
              <Button variant="ghost" size="icon" className="hover-scale h-12 w-12">
                <Linkedin className="h-6 w-6" />
              </Button>
              <Button variant="ghost" size="icon" className="hover-scale h-12 w-12">
                <Globe className="h-6 w-6" />
              </Button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 px-4 border-t bg-background/80 backdrop-blur-sm">
          <div className="max-w-4xl mx-auto text-center text-muted-foreground">
            <p>&copy; 2024 موسى عمر. جميع الحقوق محفوظة.</p>
          </div>
        </footer>
      </div>
    </>
  );
}
