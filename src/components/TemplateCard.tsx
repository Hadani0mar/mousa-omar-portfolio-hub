
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, MessageCircle, Eye } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface Template {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  template_category: string;
  template_price: number;
  preview_url: string;
  html_content: string;
  css_content?: string;
  js_content?: string;
}

interface TemplateCardProps {
  template: Template;
}

export const TemplateCard: React.FC<TemplateCardProps> = ({ template }) => {
  const createWhatsAppLink = (templateTitle: string, price: number) => {
    const phoneNumber = "+218931303032";
    const message = `مرحباً موسى، أود شراء القالب: ${templateTitle} بسعر ${price} دينار ليبي`;
    const encodedMessage = encodeURIComponent(message);
    return `https://wa.me/${phoneNumber.replace('+', '')}?text=${encodedMessage}`;
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-card/80 backdrop-blur-sm border-2 hover:border-primary/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold text-foreground">{template.title}</CardTitle>
          <Badge variant="default" className="bg-gradient-to-r from-green-500 to-blue-600 text-white">
            {template.template_price} د.ل
          </Badge>
        </div>
        <CardDescription className="line-clamp-3 text-muted-foreground">
          {template.description}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {template.technologies.slice(0, 3).map((tech) => (
            <Badge key={tech} variant="outline" className="text-xs bg-secondary/50">
              {tech}
            </Badge>
          ))}
          {template.technologies.length > 3 && (
            <Badge variant="outline" className="text-xs bg-secondary/50">
              +{template.technologies.length - 3}
            </Badge>
          )}
        </div>
        
        <div className="flex gap-2">
          {template.preview_url && (
            <Button 
              size="sm" 
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              asChild
            >
              <a href={template.preview_url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                معاينة
              </a>
            </Button>
          )}
          
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="hover:bg-blue-50 hover:border-blue-300">
                <Eye className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl w-full max-h-[90vh]">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-right">
                  <Eye className="h-5 w-5" />
                  معاينة القالب: {template.title}
                </DialogTitle>
              </DialogHeader>
              <div className="w-full h-[60vh] border rounded-lg overflow-hidden">
                <iframe
                  srcDoc={`
                    <!DOCTYPE html>
                    <html>
                    <head>
                      <style>${template.css_content || ''}</style>
                    </head>
                    <body>
                      ${template.html_content}
                      <script>${template.js_content || ''}</script>
                    </body>
                    </html>
                  `}
                  className="w-full h-full border-0"
                  title={`معاينة ${template.title}`}
                />
              </div>
            </DialogContent>
          </Dialog>

          <Button 
            size="sm" 
            className="bg-green-600 hover:bg-green-700 text-white" 
            asChild
          >
            <a href={createWhatsAppLink(template.title, template.template_price)}>
              <MessageCircle className="h-4 w-4" />
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
