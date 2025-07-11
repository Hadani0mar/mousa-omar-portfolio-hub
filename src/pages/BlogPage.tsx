
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { TopNavigationBar } from '@/components/TopNavigationBar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Eye, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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

interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
}

export default function BlogPage() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBlogData();
  }, []);

  const loadBlogData = async () => {
    try {
      // جلب التصنيفات
      const { data: categoriesData } = await supabase
        .from('blog_categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order');

      if (categoriesData) {
        setCategories(categoriesData);
      }

      // جلب التدوينات المنشورة
      const { data: postsData } = await supabase
        .from('blog_posts')
        .select(`
          *,
          blog_categories (
            name,
            slug
          )
        `)
        .eq('is_published', true)
        .order('published_at', { ascending: false });

      if (postsData) {
        setPosts(postsData);
      }
    } catch (error) {
      console.error('Error loading blog data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPosts = selectedCategory === 'all' 
    ? posts 
    : posts.filter(post => post.category_id === selectedCategory);

  const handlePostClick = (slug: string) => {
    navigate(`/blog/${slug}`);
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

  return (
    <div className="min-h-screen bg-background">
      <TopNavigationBar />
      
      <div className="pt-16">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-4">المدونة</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              مقالات ونصائح تقنية حول تطوير الويب والتقنيات الحديثة
            </p>
          </div>

          {/* تصفية التصنيفات */}
          <div className="flex flex-wrap gap-2 mb-8 justify-center">
            <Button
              variant={selectedCategory === 'all' ? 'default' : 'outline'}
              onClick={() => setSelectedCategory('all')}
              className="rounded-full"
            >
              جميع التدوينات
            </Button>
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? 'default' : 'outline'}
                onClick={() => setSelectedCategory(category.id)}
                className="rounded-full"
              >
                {category.name}
              </Button>
            ))}
          </div>

          {/* التدوينات */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map((post) => (
              <Card key={post.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    {post.blog_categories && (
                      <Badge variant="secondary" className="text-xs">
                        {post.blog_categories.name}
                      </Badge>
                    )}
                    {post.is_featured && (
                      <Badge variant="default" className="text-xs">
                        مميز
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-lg line-clamp-2 hover:text-primary transition-colors">
                    {post.title}
                  </CardTitle>
                  <CardDescription className="line-clamp-3">
                    {post.excerpt || post.content.substring(0, 150) + '...'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {new Date(post.published_at).toLocaleDateString('ar-SA')}
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      {post.view_count}
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => handlePostClick(post.slug)}
                  >
                    قراءة المزيد
                    <ArrowRight className="h-4 w-4 mr-2" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredPosts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">لا توجد تدوينات في هذا التصنيف حالياً</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
