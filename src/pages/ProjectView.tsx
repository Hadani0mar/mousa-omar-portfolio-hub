
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Github, ExternalLink, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { ThemeToggle } from '@/components/ThemeToggle';

interface Project {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  github_url: string;
  demo_url: string;
  image_url: string;
  code_content: string;
  is_featured: boolean;
}

export default function ProjectView() {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (id) {
      // Load project from localStorage
      const existingProjects = JSON.parse(localStorage.getItem('portfolio-projects') || '[]');
      const foundProject = existingProjects.find((p: Project) => p.id === id);
      setProject(foundProject || null);
      setLoading(false);
    }
  }, [id]);

  const copyToClipboard = async () => {
    if (project?.code_content) {
      try {
        await navigator.clipboard.writeText(project.code_content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        toast({
          title: "تم النسخ!",
          description: "تم نسخ الكود إلى الحافظة",
        });
      } catch (error) {
        toast({
          title: "خطأ",
          description: "فشل في نسخ الكود",
          variant: "destructive",
        });
      }
    }
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
        <div className="container flex h-14 items-center justify-between">
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
        <div className="max-w-4xl mx-auto">
          {/* Project Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <h1 className="text-3xl font-bold">{project.title}</h1>
              {project.is_featured && (
                <Badge variant="default">مميز</Badge>
              )}
            </div>
            <p className="text-lg text-muted-foreground mb-6">{project.description}</p>
            
            {/* Technologies */}
            <div className="flex flex-wrap gap-2 mb-6">
              {project.technologies.map((tech) => (
                <Badge key={tech} variant="secondary">{tech}</Badge>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              {project.github_url && (
                <Button asChild>
                  <a href={project.github_url} target="_blank" rel="noopener noreferrer">
                    <Github className="h-4 w-4 mr-2" />
                    عرض على GitHub
                  </a>
                </Button>
              )}
              {project.demo_url && (
                <Button variant="outline" asChild>
                  <a href={project.demo_url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    العرض التوضيحي
                  </a>
                </Button>
              )}
            </div>
          </div>

          {/* Project Image */}
          {project.image_url && (
            <Card className="mb-8">
              <CardContent className="p-0">
                <img 
                  src={project.image_url} 
                  alt={project.title}
                  className="w-full h-auto rounded-lg"
                />
              </CardContent>
            </Card>
          )}

          {/* Code Viewer */}
          {project.code_content && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>الكود المصدري</CardTitle>
                    <CardDescription>
                      عرض ونسخ الكود المصدري لهذا المشروع
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyToClipboard}
                    className="gap-2"
                  >
                    {copied ? (
                      <>
                        <Check className="h-4 w-4" />
                        تم النسخ!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        نسخ الكود
                      </>
                    )}
                  </Button>
                </div>
              </CardHeader>
              <Separator />
              <CardContent className="p-0">
                <div className="bg-muted/50 p-6 overflow-x-auto">
                  <pre className="text-sm font-mono whitespace-pre-wrap">
                    <code>{project.code_content}</code>
                  </pre>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Browser Preview (if demo URL exists) */}
          {project.demo_url && (
            <Card className="mt-8">
              <CardHeader>
                <CardTitle>معاينة مباشرة</CardTitle>
                <CardDescription>
                  معاينة تفاعلية للمشروع
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="bg-muted/50 rounded-b-lg" style={{ height: '600px' }}>
                  <iframe
                    src={project.demo_url}
                    className="w-full h-full rounded-b-lg border-0"
                    title={`${project.title} Preview`}
                    sandbox="allow-scripts allow-same-origin"
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
