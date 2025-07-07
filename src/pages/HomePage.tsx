
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
import { AIAssistant } from '@/components/AIAssistant';
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
  created_at: string;
  download_count?: number;
  like_count?: number;
}

interface Skill {
  id: string;
  name: string;
  created_at: string;
}

// Frontend skills only
const frontendSkills = [
  'HTML5', 'CSS3', 'JavaScript', 'TypeScript', 'React', 'Next.js', 
  'Tailwind CSS', 'Bootstrap', 'Sass', 'Vue.js', 'Angular'
];

export default function HomePage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAIAssistant, setShowAIAssistant] = useState(false);

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

      // Load skills (filter for frontend only)
      const { data: skillsData } = await supabase
        .from('skills')
        .select('*')
        .order('name', { ascending: true });

      if (skillsData) {
        // Filter to show only frontend skills
        const filteredSkills = skillsData.filter(skill => 
          frontendSkills.includes(skill.name)
        );
        setSkills(filteredSkills);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SEO />
      <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900 overflow-x-hidden">
        {/* Fixed Header */}
        <header className="fixed top-0 right-0 z-50 p-4 flex gap-2">
          <ThemeToggle />
          <NotificationsPopup />
        </header>

        {/* Hero Section - Full Screen */}
        <section className="relative min-h-screen w-full flex flex-col items-center justify-center px-4 py-16">
          <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
          <div className="text-center space-y-8 max-w-4xl mx-auto relative z-10 w-full">
            <div className="space-y-6 animate-fade-in">
              <Badge variant="secondary" className="px-6 py-3 text-base font-medium shadow-lg hover-scale">
                <Sparkles className="h-5 w-5 mr-2" />
                مطور ويب محترف
              </Badge>
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent leading-tight">
                مرحباً، أنا موسى عمر
              </h1>
              <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed px-4">
                مطور مواقع ليبي متخصص في تطوير واجهات المستخدم الحديثة والتفاعلية باستخدام أحدث التقنيات
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in px-4">
              <Button size="lg" className="px-6 sm:px-8 py-4 text-lg hover-scale bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 w-full sm:w-auto">
                <Code className="h-5 w-5 mr-2" />
                استعرض أعمالي
              </Button>
              <Button size="lg" variant="outline" className="px-6 sm:px-8 py-4 text-lg hover-scale w-full sm:w-auto">
                <Phone className="h-5 w-5 mr-2" />
                تواصل معي
              </Button>
            </div>

            <div className="animate-bounce mt-16">
              <ArrowDown className="h-8 w-8 mx-auto text-muted-foreground" />
            </div>
          </div>
        </section>

        {/* Frontend Skills Section - Mobile Optimized */}
        <section className="py-16 px-4 bg-muted/30 w-full">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                مهاراتي في تطوير الواجهات
              </h2>
              <p className="text-lg sm:text-xl text-muted-foreground px-4">
                التقنيات الحديثة التي أستخدمها في تطوير واجهات المستخدم
              </p>
            </div>
            
            <Card className="p-6 hover:shadow-xl transition-all duration-300 hover-scale border-2 hover:border-blue-500/50 bg-white/80 backdrop-blur-sm">
              <CardContent className="p-0">
                <div className="flex items-center mb-6 justify-center">
                  <Code className="h-8 w-8 text-blue-500 mr-3" />
                  <h3 className="text-xl sm:text-2xl font-bold">تطوير الواجهات الأمامية</h3>
                </div>
                <div className="flex flex-wrap gap-3 justify-center">
                  {frontendSkills.map((skill) => (
                    <Badge 
                      key={skill} 
                      variant="outline" 
                      className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 transition-colors px-4 py-2 text-sm hover-scale"
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Projects Section - Mobile Optimized */}
        <section className="py-16 px-4 w-full">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                مشاريعي
              </h2>
              <p className="text-lg sm:text-xl text-muted-foreground px-4">
                مجموعة مختارة من أفضل أعمالي في تطوير الويب
              </p>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {projects.map((project) => (
                  <div key={project.id} className="hover-scale">
                    <ProjectCard project={project} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Website Showcase Section - Mobile Optimized */}
        <section className="py-16 px-4 bg-muted/30 w-full">
          <div className="max-w-7xl mx-auto">
            <WebsiteShowcase />
          </div>
        </section>

        {/* Contact Section - Mobile Optimized */}
        <section className="py-16 px-4 w-full">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              تواصل معي
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
              هل لديك مشروع في ذهنك؟ دعنا نتحدث ونحول فكرتك إلى واقع
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center px-4">
              <Button size="lg" className="hover-scale px-6 sm:px-8 py-4 text-lg bg-gradient-to-r from-blue-600 to-purple-600 w-full sm:w-auto">
                <Mail className="h-5 w-5 mr-2" />
                البريد الإلكتروني
              </Button>
              <Button size="lg" variant="outline" className="hover-scale px-6 sm:px-8 py-4 text-lg w-full sm:w-auto">
                <Phone className="h-5 w-5 mr-2" />
                الهاتف
              </Button>
            </div>

            <div className="flex justify-center gap-4 sm:gap-6 pt-8">
              <Button variant="ghost" size="icon" className="hover-scale h-12 w-12 hover:bg-blue-50 hover:text-blue-600">
                <Github className="h-6 w-6" />
              </Button>
              <Button variant="ghost" size="icon" className="hover-scale h-12 w-12 hover:bg-blue-50 hover:text-blue-600">
                <Linkedin className="h-6 w-6" />
              </Button>
              <Button variant="ghost" size="icon" className="hover-scale h-12 w-12 hover:bg-blue-50 hover:text-blue-600">
                <Globe className="h-6 w-6" />
              </Button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 px-4 border-t bg-background/80 backdrop-blur-sm w-full">
          <div className="max-w-4xl mx-auto text-center text-muted-foreground">
            <p>&copy; 2024 موسى عمر. جميع الحقوق محفوظة.</p>
          </div>
        </footer>

        {/* AI Assistant */}
        <AIAssistant 
          isOpen={showAIAssistant} 
          onToggle={() => setShowAIAssistant(!showAIAssistant)} 
        />
      </div>
    </>
  );
}
