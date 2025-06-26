
import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ExternalLink, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';

interface Project {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  is_featured: boolean;
}

interface ProjectSliderProps {
  projects: Project[];
  projectsPerSlide?: number;
  autoSlideInterval?: number;
  showAutoSlide?: boolean;
}

export const ProjectSlider: React.FC<ProjectSliderProps> = ({
  projects,
  projectsPerSlide = 3,
  autoSlideInterval = 5000,
  showAutoSlide = true
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(showAutoSlide);

  const totalSlides = Math.ceil(projects.length / projectsPerSlide);

  useEffect(() => {
    if (!isAutoPlaying || totalSlides <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % totalSlides);
    }, autoSlideInterval);

    return () => clearInterval(interval);
  }, [isAutoPlaying, totalSlides, autoSlideInterval]);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % totalSlides);
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + totalSlides) % totalSlides);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const createWhatsAppLink = (projectTitle: string) => {
    const phoneNumber = "+218931303032";
    const message = `مرحباً موسى، أود طلب مشروع مثل: ${projectTitle}`;
    const encodedMessage = encodeURIComponent(message);
    return `https://wa.me/${phoneNumber.replace('+', '')}?text=${encodedMessage}`;
  };

  const getCurrentSlideProjects = () => {
    const startIndex = currentIndex * projectsPerSlide;
    return projects.slice(startIndex, startIndex + projectsPerSlide);
  };

  if (projects.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">لا توجد مشاريع متاحة حالياً</p>
      </div>
    );
  }

  return (
    <div className="relative w-full">
      {/* Slider Container */}
      <div 
        className="relative overflow-hidden rounded-lg"
        onMouseEnter={() => setIsAutoPlaying(false)}
        onMouseLeave={() => setIsAutoPlaying(showAutoSlide)}
      >
        <div 
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {Array.from({ length: totalSlides }).map((_, slideIndex) => (
            <div key={slideIndex} className="w-full flex-shrink-0">
              <div className={`grid grid-cols-1 ${projectsPerSlide === 1 ? '' : projectsPerSlide === 2 ? 'md:grid-cols-2' : 'md:grid-cols-2 lg:grid-cols-3'} gap-6 p-4`}>
                {projects
                  .slice(slideIndex * projectsPerSlide, (slideIndex + 1) * projectsPerSlide)
                  .map((project) => (
                    <Card key={project.id} className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-card/80 backdrop-blur-sm border-2 hover:border-primary/50">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg font-bold text-foreground">{project.title}</CardTitle>
                          {project.is_featured && (
                            <Badge variant="default" className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                              مميز
                            </Badge>
                          )}
                        </div>
                        <CardDescription className="line-clamp-3 text-muted-foreground">
                          {project.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex flex-wrap gap-2">
                          {project.technologies.slice(0, 3).map((tech) => (
                            <Badge key={tech} variant="outline" className="text-xs bg-secondary/50">
                              {tech}
                            </Badge>
                          ))}
                          {project.technologies.length > 3 && (
                            <Badge variant="outline" className="text-xs bg-secondary/50">
                              +{project.technologies.length - 3}
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex gap-2">
                          <Button asChild size="sm" className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                            <Link to={`/project/${project.id}`}>
                              <ExternalLink className="h-4 w-4 mr-2" />
                              عرض مباشر
                            </Link>
                          </Button>
                          <Button variant="outline" size="sm" asChild className="hover:bg-green-50 hover:border-green-300">
                            <a href={createWhatsAppLink(project.title)}>
                              <MessageCircle className="h-4 w-4" />
                            </a>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Arrows */}
      {totalSlides > 1 && (
        <>
          <Button
            variant="outline"
            size="icon"
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm hover:bg-background/90 z-10"
            onClick={prevSlide}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm hover:bg-background/90 z-10"
            onClick={nextSlide}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </>
      )}

      {/* Slide Indicators */}
      {totalSlides > 1 && (
        <div className="flex justify-center space-x-2 mt-6">
          {Array.from({ length: totalSlides }).map((_, index) => (
            <button
              key={index}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentIndex 
                  ? 'bg-primary scale-125' 
                  : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
              }`}
              onClick={() => goToSlide(index)}
            />
          ))}
        </div>
      )}

      {/* Auto-play Control */}
      {showAutoSlide && totalSlides > 1 && (
        <div className="flex justify-center mt-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsAutoPlaying(!isAutoPlaying)}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            {isAutoPlaying ? 'إيقاف التشغيل التلقائي' : 'تشغيل تلقائي'}
          </Button>
        </div>
      )}
    </div>
  );
};
