
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Globe, ExternalLink, Eye, EyeOff } from 'lucide-react';
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
      <div className="text-center py-12">
        <Globe className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">لا توجد مواقع منشورة حالياً</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2">المواقع المنشورة</h2>
        <p className="text-muted-foreground">استعرض المواقع التي قمت بنشرها</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {websites.map((website) => (
          <Card key={website.id} className="overflow-hidden hover:shadow-lg transition-all duration-300">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  {website.title}
                </CardTitle>
                <Badge variant="secondary">نشط</Badge>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {website.description}
              </p>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => togglePreview(website.id)}
                  className="flex-1"
                >
                  {showPreview[website.id] ? (
                    <>
                      <EyeOff className="h-4 w-4 mr-2" />
                      إخفاء المعاينة
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4 mr-2" />
                      معاينة
                    </>
                  )}
                </Button>
                <Button
                  size="sm"
                  asChild
                  className="flex-1"
                >
                  <a href={website.url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    زيارة الموقع
                  </a>
                </Button>
              </div>

              {showPreview[website.id] && (
                <div className="border rounded-lg overflow-hidden animate-scale-in">
                  <div className="bg-muted px-3 py-2 text-xs text-muted-foreground flex items-center gap-2">
                    <Globe className="h-3 w-3" />
                    {website.url}
                  </div>
                  <div className="relative">
                    <iframe
                      src={website.url}
                      className="w-full h-64 border-0"
                      title={`معاينة ${website.title}`}
                      loading="lazy"
                      sandbox="allow-scripts allow-same-origin"
                    />
                    <div className="absolute inset-0 bg-transparent cursor-pointer" 
                         onClick={() => window.open(website.url, '_blank')} />
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
