
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Globe, ExternalLink, Eye, EyeOff, Monitor } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';

interface WebsitePreview {
  id: string;
  title: string;
  description: string;
  url: string;
  screenshot_url?: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
}

export default function WebsiteShowcase() {
  const [websites, setWebsites] = useState<WebsitePreview[]>([]);
  const [showPreview, setShowPreview] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    loadWebsites();
  }, []);

  const loadWebsites = async () => {
    try {
      const { data } = await supabase
        .from('website_previews')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (data) {
        setWebsites(data);
      }
    } catch (error) {
      console.error('Error loading websites:', error);
    }
  };

  const togglePreview = (websiteId: string) => {
    setShowPreview(prev => ({
      ...prev,
      [websiteId]: !prev[websiteId]
    }));
  };

  if (websites.length === 0) {
    return (
      <div className="text-center py-16">
        <Globe className="h-16 w-16 text-muted-foreground mx-auto mb-6" />
        <h3 className="text-xl font-semibold mb-2 text-foreground">لا توجد مواقع منشورة حالياً</h3>
        <p className="text-muted-foreground">سيتم عرض المواقع المنشورة هنا قريباً</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 w-full">
      <div className="text-center mb-12">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-foreground">
          المواقع المنشورة
        </h2>
        <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
          استعرض المواقع والتطبيقات التي قمت بتطويرها ونشرها على الإنترنت
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        {websites.map((website) => (
          <Card key={website.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-200 border border-border bg-card text-card-foreground">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg sm:text-xl flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Globe className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                  </div>
                  <span className="truncate text-foreground">{website.title}</span>
                </CardTitle>
                <Badge variant="secondary" className="bg-secondary text-secondary-foreground text-xs">
                  نشط
                </Badge>
              </div>
              <p className="text-muted-foreground line-clamp-2 mt-2 text-sm">
                {website.description}
              </p>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => togglePreview(website.id)}
                  className="flex-1 text-xs sm:text-sm border-border hover:bg-accent hover:text-accent-foreground"
                >
                  {showPreview[website.id] ? (
                    <>
                      <EyeOff className="h-4 w-4 mr-2" />
                      إخفاء المعاينة
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4 mr-2" />
                      معاينة سريعة
                    </>
                  )}
                </Button>
                
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      size="sm"
                      variant="outline"
                      className="sm:flex-none border-border hover:bg-accent hover:text-accent-foreground"
                    >
                      <Monitor className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-6xl w-full max-h-[90vh] mx-4 bg-background border-border">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2 text-right text-foreground">
                        <Globe className="h-5 w-5" />
                        {website.title}
                      </DialogTitle>
                    </DialogHeader>
                    <div className="w-full h-[70vh] border border-border rounded-lg overflow-hidden">
                      <iframe
                        src={website.url}
                        className="w-full h-full border-0"
                        title={`معاينة كاملة ${website.title}`}
                        loading="lazy"
                        sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                      />
                    </div>
                  </DialogContent>
                </Dialog>

                <Button
                  size="sm"
                  asChild
                  className="bg-primary hover:bg-primary/90 text-primary-foreground flex-1 sm:flex-none text-xs sm:text-sm"
                >
                  <a href={website.url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    زيارة
                  </a>
                </Button>
              </div>

              {showPreview[website.id] && (
                <div className="border border-border rounded-lg overflow-hidden bg-background">
                  <div className="bg-muted px-4 py-2 text-sm text-muted-foreground flex items-center gap-2 border-b border-border">
                    <Globe className="h-4 w-4" />
                    <span className="truncate text-xs">{website.url}</span>
                  </div>
                  <div className="relative">
                    <iframe
                      src={website.url}
                      className="w-full h-48 sm:h-64 border-0"
                      title={`معاينة ${website.title}`}
                      loading="lazy"
                      sandbox="allow-scripts allow-same-origin"
                    />
                    <div 
                      className="absolute inset-0 bg-transparent cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors flex items-center justify-center" 
                      onClick={() => window.open(website.url, '_blank')}
                      title="انقر للفتح في نافذة جديدة"
                    >
                      <div className="bg-black/60 dark:bg-white/60 text-white dark:text-black px-4 py-2 rounded-lg opacity-0 hover:opacity-100 transition-opacity">
                        <ExternalLink className="h-5 w-5 mx-auto mb-1" />
                        <span className="text-sm">فتح الموقع</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
