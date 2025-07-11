import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Eye, EyeOff, Settings, ExternalLink } from 'lucide-react';

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
  published_at: string;
  blog_categories?: {
    name: string;
  };
}

interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  is_active: boolean;
  display_order: number;
}

export function BlogManager() {
  const { toast } = useToast();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [loading, setLoading] = useState(true);

  // إدارة التدوينات
  const [showPostDialog, setShowPostDialog] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [postTitle, setPostTitle] = useState('');
  const [postSlug, setPostSlug] = useState('');
  const [postContent, setPostContent] = useState('');
  const [postExcerpt, setPostExcerpt] = useState('');
  const [postCategoryId, setPostCategoryId] = useState('');
  const [postIsFeatured, setPostIsFeatured] = useState(false);

  // إدارة التصنيفات
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState<BlogCategory | null>(null);
  const [categoryName, setCategoryName] = useState('');
  const [categorySlug, setCategorySlug] = useState('');
  const [categoryDescription, setCategoryDescription] = useState('');
  const [categoryDisplayOrder, setCategoryDisplayOrder] = useState(0);

  useEffect(() => {
    loadBlogData();
  }, []);

  const loadBlogData = async () => {
    try {
      // جلب التصنيفات
      const { data: categoriesData } = await supabase
        .from('blog_categories')
        .select('*')
        .order('display_order');

      if (categoriesData) {
        setCategories(categoriesData);
      }

      // جلب التدوينات
      const { data: postsData } = await supabase
        .from('blog_posts')
        .select(`
          *,
          blog_categories (
            name
          )
        `)
        .order('created_at', { ascending: false });

      console.log('Loaded posts:', postsData);

      if (postsData) {
        setPosts(postsData);
      }
    } catch (error) {
      console.error('Error loading blog data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\u0600-\u06FF\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!postTitle.trim() || !postContent.trim()) {
      toast({
        title: 'خطأ',
        description: 'يرجى ملء جميع الحقول المطلوبة',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      const slug = postSlug || generateSlug(postTitle);
      
      const postData = {
        title: postTitle.trim(),
        slug,
        content: postContent.trim(),
        excerpt: postExcerpt.trim() || null,
        category_id: postCategoryId || null,
        is_featured: postIsFeatured,
        is_published: true, // نشر تلقائي
        published_at: new Date().toISOString(),
      };

      console.log('Submitting post data:', postData);

      if (editingPost) {
        const { error } = await supabase
          .from('blog_posts')
          .update(postData)
          .eq('id', editingPost.id);

        if (error) {
          console.error('Update error:', error);
          throw error;
        }

        toast({
          title: 'تم التحديث',
          description: 'تم تحديث التدوينة ونشرها بنجاح',
        });
      } else {
        const { data, error } = await supabase
          .from('blog_posts')
          .insert([postData])
          .select();

        if (error) {
          console.error('Insert error:', error);
          throw error;
        }

        console.log('Post created:', data);

        toast({
          title: 'تم النشر',
          description: 'تم إنشاء ونشر التدوينة بنجاح',
        });
      }

      handlePostCancel();
      loadBlogData();
    } catch (error) {
      console.error('Error saving post:', error);
      toast({
        title: 'خطأ',
        description: 'فشل في حفظ التدوينة: ' + (error as any).message,
        variant: 'destructive',
      });
    }
  };

  const handlePostCancel = () => {
    setShowPostDialog(false);
    setEditingPost(null);
    setPostTitle('');
    setPostSlug('');
    setPostContent('');
    setPostExcerpt('');
    setPostCategoryId('');
    setPostIsFeatured(false);
  };

  const handleEditPost = (post: BlogPost) => {
    setEditingPost(post);
    setPostTitle(post.title);
    setPostSlug(post.slug);
    setPostContent(post.content);
    setPostExcerpt(post.excerpt || '');
    setPostCategoryId(post.category_id || '');
    setPostIsFeatured(post.is_featured);
    setShowPostDialog(true);
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه التدوينة؟')) return;

    try {
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', postId);

      if (error) throw error;

      toast({
        title: 'تم الحذف',
        description: 'تم حذف التدوينة بنجاح',
      });

      loadBlogData();
    } catch (error) {
      console.error('Error deleting post:', error);
      toast({
        title: 'خطأ',
        description: 'فشل في حذف التدوينة',
        variant: 'destructive',
      });
    }
  };

  const handleTogglePublish = async (postId: string, currentStatus: boolean) => {
    try {
      const updateData: any = { is_published: !currentStatus };
      
      // إذا كان سيتم النشر، نضع تاريخ النشر
      if (!currentStatus) {
        updateData.published_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('blog_posts')
        .update(updateData)
        .eq('id', postId);

      if (error) throw error;

      toast({
        title: 'تم التحديث',
        description: `تم ${!currentStatus ? 'نشر' : 'إلغاء نشر'} التدوينة`,
      });

      loadBlogData();
    } catch (error) {
      console.error('Error toggling publish status:', error);
      toast({
        title: 'خطأ',
        description: 'فشل في تحديث حالة النشر',
        variant: 'destructive',
      });
    }
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const slug = categorySlug || generateSlug(categoryName);
      
      const categoryData = {
        name: categoryName,
        slug,
        description: categoryDescription,
        display_order: categoryDisplayOrder,
      };

      if (editingCategory) {
        const { error } = await supabase
          .from('blog_categories')
          .update(categoryData)
          .eq('id', editingCategory.id);

        if (error) throw error;

        toast({
          title: 'تم التحديث',
          description: 'تم تحديث التصنيف بنجاح',
        });
      } else {
        const { error } = await supabase
          .from('blog_categories')
          .insert([categoryData]);

        if (error) throw error;

        toast({
          title: 'تم الحفظ',
          description: 'تم إنشاء التصنيف بنجاح',
        });
      }

      handleCategoryCancel();
      loadBlogData();
    } catch (error) {
      console.error('Error saving category:', error);
      toast({
        title: 'خطأ',
        description: 'فشل في حفظ التصنيف',
        variant: 'destructive',
      });
    }
  };

  const handleCategoryCancel = () => {
    setShowCategoryDialog(false);
    setEditingCategory(null);
    setCategoryName('');
    setCategorySlug('');
    setCategoryDescription('');
    setCategoryDisplayOrder(0);
  };

  const handleEditCategory = (category: BlogCategory) => {
    setEditingCategory(category);
    setCategoryName(category.name);
    setCategorySlug(category.slug);
    setCategoryDescription(category.description || '');
    setCategoryDisplayOrder(category.display_order);
    setShowCategoryDialog(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* إدارة التدوينات */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>إدارة التدوينات</CardTitle>
              <CardDescription>إنشاء وتحرير ونشر التدوينات</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button asChild variant="outline">
                <a href="/blog" target="_blank">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  عرض المدونة
                </a>
              </Button>
              <Dialog open={showPostDialog} onOpenChange={setShowPostDialog}>
                <DialogTrigger asChild>
                  <Button onClick={() => setEditingPost(null)}>
                    <Plus className="h-4 w-4 mr-2" />
                    تدوينة جديدة
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>
                      {editingPost ? 'تحرير التدوينة' : 'تدوينة جديدة'}
                    </DialogTitle>
                    <DialogDescription>
                      {editingPost ? 'قم بتحرير التدوينة' : 'أنشئ تدوينة جديدة'}
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handlePostSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="post-title">عنوان التدوينة *</Label>
                        <Input
                          id="post-title"
                          value={postTitle}
                          onChange={(e) => setPostTitle(e.target.value)}
                          required
                          placeholder="اكتب عنوان التدوينة"
                        />
                      </div>
                      <div>
                        <Label htmlFor="post-slug">الرابط (اختياري)</Label>
                        <Input
                          id="post-slug"
                          value={postSlug}
                          onChange={(e) => setPostSlug(e.target.value)}
                          placeholder="سيتم إنشاؤه تلقائياً"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="post-excerpt">مقتطف</Label>
                      <Textarea
                        id="post-excerpt"
                        value={postExcerpt}
                        onChange={(e) => setPostExcerpt(e.target.value)}
                        placeholder="وصف مختصر للتدوينة"
                        rows={2}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="post-content">محتوى التدوينة *</Label>
                      <Textarea
                        id="post-content"
                        value={postContent}
                        onChange={(e) => setPostContent(e.target.value)}
                        required
                        rows={12}
                        className="font-mono"
                        placeholder="اكتب محتوى التدوينة هنا..."
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="post-category">التصنيف</Label>
                        <Select value={postCategoryId} onValueChange={setPostCategoryId}>
                          <SelectTrigger>
                            <SelectValue placeholder="اختر التصنيف" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">بدون تصنيف</SelectItem>
                            {categories.map((category) => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center space-x-2 pt-6">
                        <input
                          type="checkbox"
                          id="post-featured"
                          checked={postIsFeatured}
                          onChange={(e) => setPostIsFeatured(e.target.checked)}
                          className="rounded"
                        />
                        <Label htmlFor="post-featured">تدوينة مميزة</Label>
                      </div>
                    </div>
                    
                    <div className="flex justify-end space-x-2">
                      <Button type="button" variant="outline" onClick={handlePostCancel}>
                        إلغاء
                      </Button>
                      <Button type="submit">
                        {editingPost ? 'تحديث ونشر' : 'نشر التدوينة'}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {posts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>لا توجد تدوينات حالياً</p>
              </div>
            ) : (
              posts.map((post) => (
                <div key={post.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-medium">{post.title}</h3>
                      {post.is_published ? (
                        <Badge variant="default">منشور</Badge>
                      ) : (
                        <Badge variant="secondary">مسودة</Badge>
                      )}
                      {post.is_featured && (
                        <Badge variant="outline">مميز</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {post.blog_categories?.name || 'بدون تصنيف'} • {post.view_count || 0} مشاهدة
                    </p>
                    {post.is_published && (
                      <p className="text-xs text-muted-foreground mt-1">
                        نُشر: {new Date(post.published_at).toLocaleDateString('ar-SA')}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {post.is_published && (
                      <Button
                        size="sm"
                        variant="outline"
                        asChild
                      >
                        <a href={`/blog/${post.slug}`} target="_blank">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleTogglePublish(post.id, post.is_published)}
                    >
                      {post.is_published ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditPost(post)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeletePost(post.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* إدارة التصنيفات */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>إدارة التصنيفات</CardTitle>
              <CardDescription>إنشاء وتحرير تصنيفات المدونة</CardDescription>
            </div>
            <Dialog open={showCategoryDialog} onOpenChange={setShowCategoryDialog}>
              <DialogTrigger asChild>
                <Button onClick={() => setEditingCategory(null)}>
                  <Plus className="h-4 w-4 mr-2" />
                  تصنيف جديد
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingCategory ? 'تحرير التصنيف' : 'تصنيف جديد'}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCategorySubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="category-name">اسم التصنيف</Label>
                    <Input
                      id="category-name"
                      value={categoryName}
                      onChange={(e) => setCategoryName(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="category-slug">الرابط (اختياري)</Label>
                    <Input
                      id="category-slug"
                      value={categorySlug}
                      onChange={(e) => setCategorySlug(e.target.value)}
                      placeholder="سيتم إنشاؤه تلقائياً"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="category-description">الوصف</Label>
                    <Textarea
                      id="category-description"
                      value={categoryDescription}
                      onChange={(e) => setCategoryDescription(e.target.value)}
                      rows={3}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="category-order">ترتيب العرض</Label>
                    <Input
                      id="category-order"
                      type="number"
                      value={categoryDisplayOrder}
                      onChange={(e) => setCategoryDisplayOrder(parseInt(e.target.value) || 0)}
                    />
                  </div>
                  
                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={handleCategoryCancel}>
                      إلغاء
                    </Button>
                    <Button type="submit">
                      {editingCategory ? 'تحديث' : 'حفظ'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {categories.map((category) => (
              <div key={category.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-medium">{category.name}</h3>
                  <p className="text-sm text-muted-foreground">{category.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEditCategory(category)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
