
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Github, ExternalLink, Copy, Check, Play } from 'lucide-react';
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
  const [sandboxHtml, setSandboxHtml] = useState('');
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

  const runInSandbox = () => {
    if (project?.code_content) {
      // Create a simple HTML document with the code
      const html = `
<!DOCTYPE html>
<html lang="ar">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${project.title} - Live Preview</title>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            margin: 20px; 
            background: #f5f5f5;
        }
        .container { 
            max-width: 800px; 
            margin: 0 auto; 
            background: white; 
            padding: 20px; 
            border-radius: 8px; 
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>${project.title}</h1>
        <p>${project.description}</p>
        <hr>
        <div id="output"></div>
        <script>
            try {
                ${project.code_content}
            } catch (error) {
                document.getElementById('output').innerHTML = '<p style="color: red;">خطأ في تشغيل الكود: ' + error.message + '</p>';
            }
        </script>
    </div>
</body>
</html>`;
      setSandboxHtml(html);
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

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4">
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
              {project.code_content && (
                <Button variant="outline" onClick={runInSandbox} className="gap-2">
                  <Play className="h-4 w-4" />
                  تشغيل في الساندبوكس
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
                  <div className="bg-muted/50 p-6 overflow-x-auto max-h-96">
                    <pre className="text-sm font-mono whitespace-pre-wrap">
                      <code>{project.code_content}</code>
                    </pre>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Sandbox Preview */}
            {sandboxHtml && (
              <Card>
                <CardHeader>
                  <CardTitle>معاينة مباشرة - الساندبوكس</CardTitle>
                  <CardDescription>
                    تشغيل الكود مباشرة في المتصفح
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="bg-muted/50 rounded-b-lg overflow-hidden" style={{ height: '400px' }}>
                    <iframe
                      srcDoc={sandboxHtml}
                      className="w-full h-full border-0"
                      title={`${project.title} Sandbox`}
                      sandbox="allow-scripts allow-same-origin"
                    />
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Browser Preview (if demo URL exists) */}
          {project.demo_url && (
            <Card className="mt-8">
              <CardHeader>
                <CardTitle>معاينة الموقع المباشر</CardTitle>
                <CardDescription>
                  معاينة تفاعلية للمشروع المنشور
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
