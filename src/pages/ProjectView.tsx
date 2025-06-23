
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Github, ExternalLink, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
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
      fetchProject();
      trackVisit();
    }
  }, [id]);

  const fetchProject = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setProject(data);
    } catch (error) {
      console.error('Error fetching project:', error);
      toast({
        title: "Error",
        description: "Project not found",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const trackVisit = async () => {
    try {
      await supabase.from('site_analytics').insert({
        page_path: `/project/${id}`,
        visitor_ip: 'unknown',
        user_agent: navigator.userAgent,
        visited_at: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error tracking visit:', error);
    }
  };

  const copyToClipboard = async () => {
    if (project?.code_content) {
      try {
        await navigator.clipboard.writeText(project.code_content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        toast({
          title: "Copied!",
          description: "Code copied to clipboard",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to copy code",
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
          <p className="mt-4 text-muted-foreground">Loading project...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Project not found</h1>
          <Link to="/">
            <Button>Go Home</Button>
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
                Back to Portfolio
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
                <Badge variant="default">Featured</Badge>
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
                    View on GitHub
                  </a>
                </Button>
              )}
              {project.demo_url && (
                <Button variant="outline" asChild>
                  <a href={project.demo_url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Live Demo
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
                    <CardTitle>Source Code</CardTitle>
                    <CardDescription>
                      View and copy the source code for this project
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
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        Copy Code
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
                <CardTitle>Live Preview</CardTitle>
                <CardDescription>
                  Interactive preview of the project
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
