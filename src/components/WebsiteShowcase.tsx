
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
    <div className="space-y-8">
      <div className="text-center mb-12">
        <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
          المواقع المنشورة
        </h2>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          استعرض المواقع والتطبيقات التي قمت بتطويرها ونشرها على الإنترنت
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {websites.map((website) => (
          <Card key={website.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 hover-scale group border-2 hover:border-green-500/50">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl flex items-center gap-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <Globe className="h-6 w-6 text-green-600" />
                  </div>
                  {website.title}
                </CardTitle>
                <Badge variant="default" className="bg-green-100 text-green-800 border-green-300">
                  نشط
                </Badge>
              </div>
              <p className="text-muted-foreground line-clamp-2 mt-2">
                {website.description}
              </p>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => togglePreview(website.id)}
                  className="flex-1 hover:bg-blue-50 hover:border-blue-300"
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
                      className="hover:bg-purple-50 hover:border-purple-300"
                    >
                      <Monitor className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-6xl w-full max-h-[90vh]">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
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
                      />
                    </div>
                  </DialogContent>
                </Dialog>

                <Button
                  size="sm"
                  asChild
                  className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
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
                    <span className="truncate">{website.url}</span>
                  </div>
                  <div className="relative bg-white">
                    <iframe
                      src={website.url}
                      className="w-full h-64 border-0"
                      title={`معاينة ${website.title}`}
                      loading="lazy"
                    />
                    <div 
                      className="absolute inset-0 bg-transparent cursor-pointer hover:bg-black/5 transition-colors" 
                      onClick={() => window.open(website.url, '_blank')}
                      title="انقر للفتح في نافذة جديدة"
                    />
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
