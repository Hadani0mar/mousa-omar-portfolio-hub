
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
  const [selectedWebsite, setSelectedWebsite] = useState<WebsitePreview | null>(null);
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
        <h3 className="text-xl font-semibold mb-2">لا توجد مواقع منشورة حالياً</h3>
        <p className="text-muted-foreground">سيتم عرض المواقع المنشورة هنا قريباً</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 w-full">
      <div className="text-center mb-12">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
          المواقع المنشورة
        </h2>
        <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
          استعرض المواقع والتطبيقات التي قمت بتطويرها ونشرها على الإنترنت
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        {websites.map((website) => (
          <Card key={website.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 hover-scale group border-2 hover:border-green-500/50 bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg sm:text-xl flex items-center gap-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <Globe className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                  </div>
                  <span className="truncate">{website.title}</span>
                </CardTitle>
                <Badge variant="default" className="bg-green-100 text-green-800 border-green-300 text-xs">
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
                  className="flex-1 hover:bg-blue-50 hover:border-blue-300 text-xs sm:text-sm"
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
                      className="hover:bg-purple-50 hover:border-purple-300 sm:flex-none"
                    >
                      <Monitor className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-6xl w-full max-h-[90vh] mx-4">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2 text-right">
                        <Globe className="h-5 w-5" />
                        {website.title}
                      </DialogTitle>
                    </DialogHeader>
                    <div className="w-full h-[70vh] border rounded-lg overflow-hidden">
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
                  className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 flex-1 sm:flex-none text-xs sm:text-sm"
                >
                  <a href={website.url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    زيارة
                  </a>
                </Button>
              </div>

              {showPreview[website.id] && (
                <div className="border rounded-lg overflow-hidden animate-scale-in shadow-lg">
                  <div className="bg-muted px-4 py-2 text-sm text-muted-foreground flex items-center gap-2 border-b">
                    <Globe className="h-4 w-4" />
                    <span className="truncate text-xs">{website.url}</span>
                  </div>
                  <div className="relative bg-white">
                    <iframe
                      src={website.url}
                      className="w-full h-48 sm:h-64 border-0 pointer-events-none"
                      title={`معاينة ${website.title}`}
                      loading="lazy"
                      sandbox="allow-scripts allow-same-origin"
                    />
                    <div 
                      className="absolute inset-0 bg-transparent cursor-pointer hover:bg-black/5 transition-colors flex items-center justify-center" 
                      onClick={() => window.open(website.url, '_blank')}
                      title="انقر للفتح في نافذة جديدة"
                    >
                      <div className="bg-black/60 text-white px-4 py-2 rounded-lg opacity-0 hover:opacity-100 transition-opacity">
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
