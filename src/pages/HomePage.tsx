
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Code, ExternalLink, MessageCircle, User, Briefcase, Globe } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import WebsiteShowcase from '@/components/WebsiteShowcase';
import { TopNavigationBar } from '@/components/TopNavigationBar';
import { AIAssistant } from '@/components/AIAssistant';
import { TemplatesSection } from '@/components/TemplatesSection';

interface Skill {
  id: string;
  name: string;
  is_active: boolean;
}

export default function HomePage() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [showAIChat, setShowAIChat] = useState(false);

  useEffect(() => {
    loadSkills();
  }, []);

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
            <div className="mb-8">
              <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-primary to-primary/70 rounded-full flex items-center justify-center">
                <User className="h-16 w-16 text-primary-foreground" />
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
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                تحدث معي
              </Button>
              <Button variant="outline" className="hover:bg-accent hover:text-accent-foreground" asChild>
                <a href="#templates">
                  <Briefcase className="h-4 w-4 mr-2" />
                  القوالب الجاهزة
                </a>
              </Button>
            </div>

            {/* Skills */}
            {skills.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-4 text-foreground">المهارات التقنية</h3>
                <div className="flex flex-wrap justify-center gap-2">
                  {skills.map((skill) => (
                    <Badge
                      key={skill.id}
                      variant="secondary"
                      className="bg-secondary text-secondary-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                    >
                      {skill.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Templates Section */}
        <section id="templates" className="py-16 px-4 bg-muted/30">
          <div className="max-w-6xl mx-auto">
            <TemplatesSection />
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
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
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
