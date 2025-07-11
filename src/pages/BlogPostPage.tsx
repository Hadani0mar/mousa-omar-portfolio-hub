
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { TopNavigationBar } from '@/components/TopNavigationBar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Eye, Share2, ArrowLeft } from 'lucide-react';
import { SEO } from '@/components/SEO';

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

      setPost(data);
      
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

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between mb-4">
                {post.blog_categories && (
                  <Badge variant="secondary">
                    {post.blog_categories.name}
                  </Badge>
                )}
                {post.is_featured && (
                  <Badge variant="default">
                    مميز
                  </Badge>
                )}
              </div>
              
              <CardTitle className="text-3xl font-bold text-foreground mb-4">
                {post.title}
              </CardTitle>
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {new Date(post.published_at).toLocaleDateString('ar-SA')}
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  {post.view_count} مشاهدة
                </div>
              </div>

              {/* أزرار المشاركة */}
              <div className="flex items-center gap-2 border-t pt-4">
                <Share2 className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground ml-2">مشاركة:</span>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => sharePost('whatsapp')}
                  className="text-green-600 hover:bg-green-50"
                >
                  واتساب
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => sharePost('facebook')}
                  className="text-blue-600 hover:bg-blue-50"
                >
                  فيسبوك
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => sharePost('twitter')}
                  className="text-sky-600 hover:bg-sky-50"
                >
                  تويتر
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => sharePost('instagram')}
                  className="text-pink-600 hover:bg-pink-50"
                >
                  انستقرام
                </Button>
              </div>
            </CardHeader>
            
            <CardContent>
              <div 
                className="prose prose-lg max-w-none text-foreground"
                style={{ 
                  whiteSpace: 'pre-wrap',
                  lineHeight: '1.8',
                  fontSize: '16px'
                }}
              >
                {post.content}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
