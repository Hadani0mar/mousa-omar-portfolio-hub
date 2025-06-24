
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/ThemeToggle';
import { supabase } from '@/integrations/supabase/client';

interface Project {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  html_content: string;
  css_content?: string;
  js_content?: string;
  is_featured: boolean;
}

export default function ProjectView() {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadProject();
    }
  }, [id]);

  const loadProject = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error loading project:', error);
        setProject(null);
      } else {
        setProject(data);
      }
    } catch (error) {
      console.error('Error loading project:', error);
      setProject(null);
    } finally {
      setLoading(false);
    }
  };

  const createWhatsAppLink = (message: string) => {
    const phoneNumber = "+218931303032";
    const encodedMessage = encodeURIComponent(message);
    return `https://wa.me/${phoneNumber.replace('+', '')}?text=${encodedMessage}`;
  };

  const createSandboxHTML = (project: Project) => {
    let htmlContent = project.html_content;

    // If CSS content exists, inject it into the HTML
    if (project.css_content) {
      const cssTag = `<style>${project.css_content}</style>`;
      if (htmlContent.includes('</head>')) {
        htmlContent = htmlContent.replace('</head>', `${cssTag}\n</head>`);
      } else {
        htmlContent = `${cssTag}\n${htmlContent}`;
      }
    }

    // If JS content exists, inject it into the HTML
    if (project.js_content) {
      const jsTag = `<script>${project.js_content}</script>`;
      if (htmlContent.includes('</body>')) {
        htmlContent = htmlContent.replace('</body>', `${jsTag}\n</body>`);
      } else {
        htmlContent = `${htmlContent}\n${jsTag}`;
      }
    }

    return htmlContent;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">جاري تحميل المشروع...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">المشروع غير موجود</h1>
          <Link to="/">
            <Button>العودة للرئيسية</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between px-4">
          <div className="flex items-center space-x-4">
            <Link to="/">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                العودة للمعرض
              </Button>
            </Link>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Project Header */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-bold">{project.title}</h1>
                {project.is_featured && (
                  <Badge variant="default">مميز</Badge>
                )}
              </div>
            </div>
            <p className="text-lg text-muted-foreground mb-6">{project.description}</p>
            
            {/* Technologies */}
            <div className="flex flex-wrap gap-2 mb-6">
              {project.technologies.map((tech) => (
                <Badge key={tech} variant="secondary">{tech}</Badge>
              ))}
            </div>

            {/* Action Button */}
            <div className="flex flex-wrap gap-4">
              <Button variant="outline" asChild>
                <a href={createWhatsAppLink(`مرحباً موسى، أود طلب مشروع مثل: ${project.title}`)}>
                  <MessageCircle className="h-4 w-4 mr-2" />
                  طلب مشروع مشابه
                </a>
              </Button>
            </div>
          </div>

          {/* Live Preview */}
          <Card>
            <CardHeader>
              <CardTitle>معاينة مباشرة</CardTitle>
              <CardDescription>
                عرض مباشر للمشروع
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="bg-white rounded-b-lg overflow-hidden border-t" style={{ minHeight: '600px' }}>
                <iframe
                  srcDoc={createSandboxHTML(project)}
                  className="w-full h-full border-0"
                  style={{ minHeight: '600px' }}
                  title={`${project.title} Preview`}
                  sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
