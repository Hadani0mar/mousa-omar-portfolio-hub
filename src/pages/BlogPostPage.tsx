
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { TopNavigationBar } from '@/components/TopNavigationBar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Eye, Share2, ArrowLeft, ExternalLink } from 'lucide-react';
import { SEO } from '@/components/SEO';

interface BlogLink {
  title: string;
  url: string;
}

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  category_id: string;
  is_published: boolean;
  is_featured: boolean;
  view_count: number;
  links: BlogLink[] | null;
  created_at: string;
  updated_at: string;
  published_at: string;
  blog_categories?: {
    name: string;
    slug: string;
  };
}

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (slug) {
      loadPost();
    }
  }, [slug]);

  const loadPost = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select(`
          *,
          blog_categories (
            name,
            slug
          )
        `)
        .eq('slug', slug)
        .eq('is_published', true)
        .single();

      if (error || !data) {
        setNotFound(true);
        return;
      }

      // تحويل البيانات لتتطابق مع BlogPost interface
      const postWithLinks = {
        ...data,
        links: Array.isArray(data.links) ? data.links : null
      };

      setPost(postWithLinks);
      
      // تحديث عدد المشاهدات
      await supabase
        .from('blog_posts')
        .update({ view_count: (data.view_count || 0) + 1 })
        .eq('id', data.id);
        
    } catch (error) {
      console.error('Error loading post:', error);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  const sharePost = (platform: string) => {
    const url = window.location.href;
    const title = post?.title || '';
    const text = post?.excerpt || '';

    let shareUrl = '';
    
    switch (platform) {
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodeURIComponent(`${title}\n${url}`)}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;
        break;
      case 'instagram':
        // Instagram doesn't support direct sharing, so we copy to clipboard
        navigator.clipboard.writeText(`${title}\n${url}`);
        alert('تم نسخ الرابط إلى الحافظة! يمكنك لصقه في Instagram');
        return;
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return `${date.getFullYear()}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}`;
  };

  // تحويل Markdown إلى HTML بسيط
  const renderMarkdown = (content: string): string => {
    return content
      // العناوين
      .replace(/^## (.+)$/gm, '<h2 class="text-2xl font-bold mt-6 mb-4 text-foreground">$1</h2>')
      .replace(/^### (.+)$/gm, '<h3 class="text-xl font-semibold mt-5 mb-3 text-foreground">$1</h3>')
      // النص الغامق
      .replace(/\*\*(.+?)\*\*/g, '<strong class="font-bold">$1</strong>')
      // النص المائل
      .replace(/\*(.+?)\*/g, '<em class="italic">$1</em>')
      // الكود
      .replace(/`(.+?)`/g, '<code class="bg-muted px-2 py-1 rounded text-sm font-mono">$1</code>')
      // القوائم
      .replace(/^- (.+)$/gm, '<li class="ml-4 mb-1">• $1</li>')
      // الروابط
      .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline">$1</a>')
      // الأسطر الجديدة
      .replace(/\n/g, '<br>');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <TopNavigationBar />
        <div className="pt-16 flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (notFound || !post) {
    return (
      <div className="min-h-screen bg-background">
        <TopNavigationBar />
        <div className="pt-16 max-w-4xl mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">التدوينة غير موجودة</h1>
            <p className="text-muted-foreground mb-6">عذراً، لم نتمكن من العثور على التدوينة المطلوبة</p>
            <Button onClick={() => navigate('/blog')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              العودة إلى المدونة
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={`${post.title} - مدونة موسى عمر`}
        description={post.excerpt || post.content.substring(0, 150)}
        keywords={`${post.title}, ${post.blog_categories?.name || ''}, مدونة موسى عمر, تطوير الويب`}
        url={`https://www.m0usa.ly/blog/${post.slug}`}
        type="article"
      />
      
      <TopNavigationBar />
      
      <div className="pt-16">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/blog')}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            العودة إلى المدونة
          </Button>

          <Card className="shadow-lg">
            <CardHeader className="border-b bg-muted/30">
              <div className="flex items-center justify-between mb-4">
                {post.blog_categories && (
                  <Badge variant="secondary" className="text-sm">
                    {post.blog_categories.name}
                  </Badge>
                )}
                {post.is_featured && (
                  <Badge variant="default" className="text-sm">
                    مميز
                  </Badge>
                )}
              </div>
              
              <CardTitle className="text-3xl font-bold text-foreground mb-6 leading-tight">
                {post.title}
              </CardTitle>
              
              <div className="flex items-center gap-6 text-sm text-muted-foreground mb-6">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>نشر في: {formatDate(post.published_at)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  <span>{post.view_count} مشاهدة</span>
                </div>
              </div>

              {/* أزرار المشاركة */}
              <div className="flex items-center gap-3 pt-4 border-t">
                <Share2 className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground ml-2">مشاركة:</span>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => sharePost('whatsapp')}
                    className="text-green-600 hover:bg-green-50 border-green-200"
                  >
                    واتساب
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => sharePost('facebook')}
                    className="text-blue-600 hover:bg-blue-50 border-blue-200"
                  >
                    فيسبوك
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => sharePost('twitter')}
                    className="text-sky-600 hover:bg-sky-50 border-sky-200"
                  >
                    تويتر
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="p-8">
              {/* محتوى التدوينة مع تنسيق محسن */}
              <article 
                className="prose prose-lg max-w-none text-foreground mb-8 leading-relaxed"
                dangerouslySetInnerHTML={{ 
                  __html: renderMarkdown(post.content)
                }}
                style={{ 
                  fontSize: '17px',
                  lineHeight: '1.8'
                }}
              />

              {/* قسم المصادر والروابط */}
              {post.links && post.links.length > 0 && (
                <div className="mt-12 pt-8 border-t bg-muted/20 rounded-lg p-6">
                  <h3 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
                    <ExternalLink className="h-6 w-6 text-primary" />
                    المصادر والروابط المفيدة
                  </h3>
                  <div className="grid gap-4">
                    {post.links.map((link, index) => (
                      <a
                        key={index}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-4 p-4 border-2 rounded-xl hover:bg-muted/50 transition-all duration-200 group hover:border-primary/50 bg-background"
                      >
                        <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                          <ExternalLink className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors text-lg mb-1">
                            {link.title}
                          </h4>
                          <p className="text-sm text-muted-foreground truncate">
                            {link.url}
                          </p>
                        </div>
                        <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="w-2 h-2 bg-primary rounded-full"></div>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* معلومات إضافية عن التدوينة */}
              <div className="mt-8 pt-6 border-t text-sm text-muted-foreground">
                <div className="flex flex-wrap gap-4">
                  <span>تاريخ الإنشاء: {formatDate(post.created_at)}</span>
                  {post.updated_at !== post.created_at && (
                    <span>آخر تحديث: {formatDate(post.updated_at)}</span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
