
import React, { useEffect, useState } from 'react';
import { Github, ExternalLink, Code, Download, Mail, MapPin, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/ThemeToggle';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';

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

export default function HomePage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
    trackVisit();
  }, []);

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const trackVisit = async () => {
    try {
      await supabase.from('site_analytics').insert({
        page_path: '/',
        visitor_ip: 'unknown',
        user_agent: navigator.userAgent,
        visited_at: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error tracking visit:', error);
    }
  };

  const featuredProjects = projects.filter(p => p.is_featured);
  const otherProjects = projects.filter(p => !p.is_featured);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between">
          <div className="flex items-center space-x-2">
            <Code className="h-6 w-6" />
            <span className="font-bold">Mousa Omar</span>
          </div>
          <div className="flex items-center space-x-4">
            <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
              <a href="#about" className="transition-colors hover:text-foreground/80 text-foreground/60">About</a>
              <a href="#projects" className="transition-colors hover:text-foreground/80 text-foreground/60">Projects</a>
              <a href="#skills" className="transition-colors hover:text-foreground/80 text-foreground/60">Skills</a>
              <a href="#contact" className="transition-colors hover:text-foreground/80 text-foreground/60">Contact</a>
            </nav>
            <ThemeToggle />
            <Link to="/admin">
              <Button variant="ghost" size="sm">Admin</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <section className="py-20 text-center">
          <div className="mx-auto max-w-3xl">
            <h1 className="text-4xl font-bold tracking-tighter sm:text-6xl md:text-7xl bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
              Mousa Omar
            </h1>
            <p className="mt-6 text-xl text-muted-foreground max-w-2xl mx-auto">
              Full Stack Developer from Libya, specializing in Next.js, React, and modern web technologies.
              Creating exceptional digital experiences with clean, efficient code.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Button size="lg" className="gap-2">
                <Mail className="h-4 w-4" />
                Get In Touch
              </Button>
              <Button variant="outline" size="lg" className="gap-2">
                <Download className="h-4 w-4" />
                Download CV
              </Button>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="py-20">
          <div className="mx-auto max-w-4xl">
            <h2 className="text-3xl font-bold tracking-tighter mb-8 text-center">About Me</h2>
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <p className="text-lg text-muted-foreground mb-6">
                  I'm a passionate full-stack developer with expertise in modern web technologies. 
                  I love building scalable applications and solving complex problems with elegant solutions.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span>Libya</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span>5+ years experience</span>
                  </div>
                </div>
              </div>
              <div className="text-center">
                <div className="w-48 h-48 mx-auto rounded-full bg-gradient-to-r from-primary/20 to-primary/10 flex items-center justify-center">
                  <Code className="h-24 w-24 text-primary" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Skills Section */}
        <section id="skills" className="py-20">
          <div className="mx-auto max-w-4xl">
            <h2 className="text-3xl font-bold tracking-tighter mb-8 text-center">Skills & Technologies</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Frontend</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Badge variant="secondary">React</Badge>
                  <Badge variant="secondary">Next.js</Badge>
                  <Badge variant="secondary">TypeScript</Badge>
                  <Badge variant="secondary">Tailwind CSS</Badge>
                  <Badge variant="secondary">HTML5</Badge>
                  <Badge variant="secondary">CSS3</Badge>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Backend</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Badge variant="secondary">Node.js</Badge>
                  <Badge variant="secondary">Supabase</Badge>
                  <Badge variant="secondary">PostgreSQL</Badge>
                  <Badge variant="secondary">API Design</Badge>
                  <Badge variant="secondary">Authentication</Badge>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Tools & Others</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Badge variant="secondary">Git</Badge>
                  <Badge variant="secondary">Vercel</Badge>
                  <Badge variant="secondary">VS Code</Badge>
                  <Badge variant="secondary">Figma</Badge>
                  <Badge variant="secondary">Docker</Badge>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Featured Projects Section */}
        {featuredProjects.length > 0 && (
          <section className="py-20">
            <div className="mx-auto max-w-6xl">
              <h2 className="text-3xl font-bold tracking-tighter mb-8 text-center">Featured Projects</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredProjects.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* All Projects Section */}
        <section id="projects" className="py-20">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-3xl font-bold tracking-tighter mb-8 text-center">
              {featuredProjects.length > 0 ? 'All Projects' : 'Projects'}
            </h2>
            {loading ? (
              <div className="text-center py-12">Loading projects...</div>
            ) : otherProjects.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {otherProjects.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                No projects available yet.
              </div>
            )}
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="py-20">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tighter mb-8">Get In Touch</h2>
            <p className="text-lg text-muted-foreground mb-8">
              I'm always interested in new opportunities and exciting projects. 
              Let's discuss how we can work together!
            </p>
            <div className="flex justify-center gap-4">
              <Button size="lg" className="gap-2">
                <Mail className="h-4 w-4" />
                Email Me
              </Button>
              <Button variant="outline" size="lg" className="gap-2">
                <Github className="h-4 w-4" />
                GitHub
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container text-center text-muted-foreground">
          <p>&copy; 2024 Mousa Omar. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

function ProjectCard({ project }: { project: Project }) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      {project.image_url && (
        <div className="aspect-video overflow-hidden">
          <img 
            src={project.image_url} 
            alt={project.title}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          {project.title}
          {project.is_featured && (
            <Badge variant="default">Featured</Badge>
          )}
        </CardTitle>
        <CardDescription>{project.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2 mb-4">
          {project.technologies.map((tech) => (
            <Badge key={tech} variant="secondary" className="text-xs">
              {tech}
            </Badge>
          ))}
        </div>
        <div className="flex gap-2">
          {project.github_url && (
            <Button variant="outline" size="sm" asChild>
              <a href={project.github_url} target="_blank" rel="noopener noreferrer">
                <Github className="h-4 w-4 mr-2" />
                Code
              </a>
            </Button>
          )}
          {project.demo_url && (
            <Button variant="outline" size="sm" asChild>
              <a href={project.demo_url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                Demo
              </a>
            </Button>
          )}
          {project.code_content && (
            <Button variant="outline" size="sm" asChild>
              <Link to={`/project/${project.id}`}>
                <Code className="h-4 w-4 mr-2" />
                View Code
              </Link>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
