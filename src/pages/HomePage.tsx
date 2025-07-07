
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Code, ExternalLink, MessageCircle, User, Briefcase, Globe } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import WebsiteShowcase from '@/components/WebsiteShowcase';
import { TopNavigationBar } from '@/components/TopNavigationBar';
import { AIAssistant } from '@/components/AIAssistant';
import { ProjectSlider } from '@/components/ProjectSlider';

interface Project {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  html_content: string;
  css_content?: string;
  js_content?: string;
  is_featured: boolean;
  like_count: number;
  download_count: number;
}

interface Skill {
  id: string;
  name: string;
  is_active: boolean;
}

export default function HomePage() {
  const [featuredProjects, setFeaturedProjects] = useState<Project[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [showAIChat, setShowAIChat] = useState(false);

  useEffect(() => {
    loadFeaturedProjects();
    loadSkills();
  }, []);

  const loadFeaturedProjects = async () => {
    try {
      const { data } = await supabase
        .from('projects')
        .select('*')
        .eq('is_featured', true)
        .eq('project_status', 'active')
        .order('display_order', { ascending: true })
        .limit(6);

      if (data) {
        setFeaturedProjects(data);
      }
    } catch (error) {
      console.error('Error loading featured projects:', error);
    }
  };

  const loadSkills = async () => {
    try {
      const { data } = await supabase
        .from('skills')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (data) {
        const frontendSkills = data.filter(skill => 
          !skill.name.toLowerCase().includes('python') &&
          !skill.name.toLowerCase().includes('django') &&
          !skill.name.toLowerCase().includes('flask') &&
          !skill.name.toLowerCase().includes('node') &&
          !skill.name.toLowerCase().includes('express') &&
          !skill.name.toLowerCase().includes('database') &&
          !skill.name.toLowerCase().includes('sql') &&
          !skill.name.toLowerCase().includes('mongodb') &&
          !skill.name.toLowerCase().includes('api') &&
          !skill.name.toLowerCase().includes('server')
        );
        setSkills(frontendSkills);
      }
    } catch (error) {
      console.error('Error loading skills:', error);
    }
  };

  const toggleAIChat = () => {
    setShowAIChat(!showAIChat);
  };

  return (
    <div className="min-h-screen bg-background">
      <TopNavigationBar />
      
      <main className="pt-16">
        {/* Hero Section */}
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-8 animate-fade-in">
              <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-primary to-primary/70 rounded-full flex items-center justify-center">
                <User className="h-16 w-16 text-white" />
              </div>
              <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-4">
                موسى عمر
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                مطور واجهات أمامية متخصص في بناء تطبيقات ويب حديثة
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-4 mb-12">
              <Button
                onClick={toggleAIChat}
                className="github-button bg-primary hover:bg-primary/90"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                تحدث معي
              </Button>
              <Button variant="outline" className="github-button" asChild>
                <a href="#projects">
                  <Briefcase className="h-4 w-4 mr-2" />
                  أعمالي
                </a>
              </Button>
            </div>

            {/* Skills */}
            {skills.length > 0 && (
              <div className="animate-slide-up">
                <h3 className="text-lg font-semibold mb-4 text-foreground">المهارات التقنية</h3>
                <div className="flex flex-wrap justify-center gap-2">
                  {skills.map((skill) => (
                    <Badge
                      key={skill.id}
                      variant="secondary"
                      className="smooth-interaction hover:bg-accent"
                    >
                      {skill.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Featured Projects */}
        <section id="projects" className="py-16 px-4 bg-muted/30">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-foreground mb-4">المشاريع المميزة</h2>
              <p className="text-muted-foreground">
                مجموعة من أحدث أعمالي في تطوير الواجهات الأمامية
              </p>
            </div>

            {featuredProjects.length > 0 ? (
              <ProjectSlider projects={featuredProjects} />
            ) : (
              <div className="text-center py-16">
                <Code className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">لا توجد مشاريع مميزة حالياً</p>
              </div>
            )}
          </div>
        </section>

        {/* Website Showcase */}
        <section className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <WebsiteShowcase />
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-16 px-4 bg-muted/30">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-foreground mb-4">هل تحتاج مساعدة؟</h2>
            <p className="text-muted-foreground mb-8">
              يمكنك التحدث مع مساعدي الذكي للحصول على المساعدة أو معرفة المزيد عن خدماتي
            </p>
            <Button
              onClick={toggleAIChat}
              size="lg"
              className="github-button bg-primary hover:bg-primary/90"
            >
              <MessageCircle className="h-5 w-5 mr-2" />
              ابدأ المحادثة
            </Button>
          </div>
        </section>
      </main>

      {/* AI Chat */}
      <AIAssistant isOpen={showAIChat} onToggle={toggleAIChat} />
    </div>
  );
}
