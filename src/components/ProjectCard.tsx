
import React from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, MessageCircle, Download, Heart, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useProjectInteractions } from '@/hooks/useProjectInteractions';
import { downloadProjectFiles } from '@/utils/projectDownloader';

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

interface ProjectCardProps {
  project: Project;
  showDownloadButton?: boolean;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ 
  project, 
  showDownloadButton = true 
}) => {
  const { stats, loading, handleDownload, handleLike } = useProjectInteractions(project.id);

  const createWhatsAppLink = (projectTitle: string) => {
    const phoneNumber = "+218931303032";
    const message = `مرحباً موسى، أود طلب مشروع مثل: ${projectTitle}`;
    const encodedMessage = encodeURIComponent(message);
    return `https://wa.me/${phoneNumber.replace('+', '')}?text=${encodedMessage}`;
  };

  const handleDownloadClick = async () => {
    await handleDownload();
    downloadProjectFiles(project);
  };

  if (loading) {
    return (
      <Card className="overflow-hidden animate-pulse">
        <CardHeader className="pb-3">
          <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-full mb-1"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </CardHeader>
        <CardContent>
          <div className="h-8 bg-gray-200 rounded w-full"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-card/80 backdrop-blur-sm border-2 hover:border-primary/50">
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

        {/* Stats Row */}
        {stats && (
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Download className="h-4 w-4" />
              <span>{stats.download_count}</span>
            </div>
            <div className="flex items-center gap-1">
              <Heart className={`h-4 w-4 ${stats.user_liked ? 'fill-red-500 text-red-500' : ''}`} />
              <span>{stats.like_count}</span>
            </div>
          </div>
        )}
        
        <div className="flex gap-2">
          <Button asChild size="sm" className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
            <Link to={`/project/${project.id}`}>
              <ExternalLink className="h-4 w-4 mr-2" />
              عرض مباشر
            </Link>
          </Button>
          
          {/* Like Button */}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleLike}
            disabled={stats?.user_liked}
            className={`hover:bg-red-50 hover:border-red-300 ${stats?.user_liked ? 'bg-red-50 border-red-300' : ''}`}
          >
            <Heart className={`h-4 w-4 ${stats?.user_liked ? 'fill-red-500 text-red-500' : ''}`} />
          </Button>

          {/* Download Button */}
          {showDownloadButton && stats?.download_enabled && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleDownloadClick}
              className="hover:bg-blue-50 hover:border-blue-300"
            >
              <Download className="h-4 w-4" />
            </Button>
          )}

          <Button variant="outline" size="sm" asChild className="hover:bg-green-50 hover:border-green-300">
            <a href={createWhatsAppLink(project.title)}>
              <MessageCircle className="h-4 w-4" />
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
