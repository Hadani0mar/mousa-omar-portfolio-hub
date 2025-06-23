
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Github, ExternalLink, Mail, MapPin, Code, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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

export default function HomePage() {
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    // Load projects from localStorage
    const existingProjects = JSON.parse(localStorage.getItem('portfolio-projects') || '[]');
    setProjects(existingProjects);
  }, []);

  const skills = [
    'Next.js', 'React', 'TypeScript', 'JavaScript', 'HTML5', 'CSS3', 
    'Tailwind CSS', 'Node.js', 'Supabase', 'Git', 'VS Code'
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold">Mousa Omar</h1>
          </div>
          <nav className="flex items-center space-x-6">
            <a href="#about" className="text-sm font-medium hover:text-primary transition-colors">نبذة</a>
            <a href="#skills" className="text-sm font-medium hover:text-primary transition-colors">المهارات</a>
            <a href="#projects" className="text-sm font-medium hover:text-primary transition-colors">المشاريع</a>
            <a href="#contact" className="text-sm font-medium hover:text-primary transition-colors">التواصل</a>
            <ThemeToggle />
            <Link to="/admin">
              <Button variant="outline" size="sm">تسجيل الدخول</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <section className="text-center py-16">
          <div className="mx-auto max-w-3xl">
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl mb-6">
              مرحباً، أنا <span className="text-primary">موسى عمر</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              مطور ويب ليبي متخصص في Next.js و React
            </p>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              خبير في تطوير تطبيقات الويب الحديثة باستخدام Next.js و React و TypeScript. 
              أسعى لبناء تجارب رقمية مميزة وحلول تقنية مبتكرة.
            </p>
            <div className="flex justify-center items-center gap-4">
              <Button size="lg" className="gap-2">
                <Mail className="h-4 w-4" />
                تواصل معي
              </Button>
              <Button variant="outline" size="lg" className="gap-2">
                <Github className="h-4 w-4" />
                GitHub
              </Button>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="py-16">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold mb-8">نبذة عني</h2>
            <div className="space-y-6 text-muted-foreground">
              <p className="text-lg">
                أنا مطور ويب ليبي شغوف بالتكنولوجيا والابتكار. أتخصص في تطوير تطبيقات الويب الحديثة 
                باستخدام أحدث التقنيات مثل Next.js و React و TypeScript.
              </p>
              <p className="text-lg">
                أؤمن بقوة التكنولوجيا في تغيير حياة الناس وأسعى دائماً لتطوير حلول رقمية مبتكرة 
                تحل مشاكل حقيقية وتقدم تجارب مستخدم استثنائية.
              </p>
              <div className="flex items-center justify-center gap-2 text-sm">
                <MapPin className="h-4 w-4" />
                <span>ليبيا</span>
              </div>
            </div>
          </div>
        </section>

        {/* Skills Section */}
        <section id="skills" className="py-16">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="text-3xl font-bold mb-8">المهارات التقنية</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Code className="h-5 w-5" />
                    Frontend Development
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {['React', 'Next.js', 'TypeScript', 'HTML5', 'CSS3', 'Tailwind CSS'].map((skill) => (
                      <Badge key={skill} variant="secondary">{skill}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Code className="h-5 w-5" />
                    Backend & Database
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {['Node.js', 'Supabase', 'PostgreSQL', 'API Design'].map((skill) => (
                      <Badge key={skill} variant="secondary">{skill}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Code className="h-5 w-5" />
                    Tools & Others
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {['Git', 'VS Code', 'Vercel', 'Responsive Design'].map((skill) => (
                      <Badge key={skill} variant="secondary">{skill}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Projects Section */}
        <section id="projects" className="py-16">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-3xl font-bold text-center mb-8">المشاريع</h2>
            
            {projects.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">لا توجد مشاريع بعد. سيتم إضافة المشاريع قريباً!</p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {projects.map((project) => (
                  <Card key={project.id} className="overflow-hidden">
                    {project.image_url && (
                      <div className="aspect-video overflow-hidden">
                        <img 
                          src={project.image_url} 
                          alt={project.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          {project.title}
                          {project.is_featured && (
                            <Star className="h-4 w-4 text-yellow-500" />
                          )}
                        </CardTitle>
                      </div>
                      <CardDescription>{project.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {project.technologies.slice(0, 3).map((tech) => (
                          <Badge key={tech} variant="outline" className="text-xs">
                            {tech}
                          </Badge>
                        ))}
                        {project.technologies.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{project.technologies.length - 3}
                          </Badge>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {project.github_url && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={project.github_url} target="_blank" rel="noopener noreferrer">
                              <Github className="h-4 w-4 mr-1" />
                              الكود
                            </a>
                          </Button>
                        )}
                        {project.demo_url && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={project.demo_url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4 mr-1" />
                              العرض
                            </a>
                          </Button>
                        )}
                        <Link to={`/project/${project.id}`}>
                          <Button size="sm">
                            التفاصيل
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="py-16">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold mb-8">تواصل معي</h2>
            <p className="text-lg text-muted-foreground mb-8">
              هل لديك مشروع في ذهنك؟ أم تريد مناقشة فرصة عمل؟ 
              لا تتردد في التواصل معي!
            </p>
            <div className="flex justify-center gap-4">
              <Button size="lg" className="gap-2">
                <Mail className="h-4 w-4" />
                البريد الإلكتروني
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
          <p>&copy; 2024 Mousa Omar. جميع الحقوق محفوظة.</p>
        </div>
      </footer>
    </div>
  );
}
