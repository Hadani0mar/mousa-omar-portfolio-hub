import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Trash2, Edit, Plus, Eye, Link as LinkIcon, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface BlogLink {
  title: string;
  url: string;
}

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  category_id: string | null;
  is_published: boolean;
  is_featured: boolean;
  view_count: number;
  links: BlogLink[] | null;
  created_at: string;
  updated_at: string;
  published_at: string | null;
  blog_categories?: {
    name: string;
  };
}

interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  display_order: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const BlogManager: React.FC = () => {
  const { toast } = useToast();
  
  // Posts state
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [showPostForm, setShowPostForm] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [postExcerpt, setPostExcerpt] = useState('');
  const [postCategoryId, setPostCategoryId] = useState<string>('');
  const [postIsPublished, setPostIsPublished] = useState(false);
  const [postIsFeatured, setPostIsFeatured] = useState(false);
  const [postLinks, setPostLinks] = useState<BlogLink[]>([]);

  // Categories state
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<BlogCategory | null>(null);
  const [categoryName, setCategoryName] = useState('');
  const [categoryDescription, setCategoryDescription] = useState('');

  // Link form state
  const [newLinkTitle, setNewLinkTitle] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');

  useEffect(() => {
    loadPosts();
    loadCategories();
  }, []);

  const loadPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select(`
          *,
          links,
          blog_categories (
            name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Ensure all posts have the links property, even if null
      const postsWithLinks = (data || []).map(post => ({
        ...post,
        links: post.links || null
      }));
      
      setPosts(postsWithLinks);
    } catch (error) {
      console.error('Error loading posts:', error);
      toast({
        title: 'خطأ',
        description: 'فشل في تحميل التدوينات',
        variant: 'destructive',
      });
    }
  };

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_categories')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error loading categories:', error);
      toast({
        title: 'خطأ',
        description: 'فشل في تحميل التصنيفات',
        variant: 'destructive',
      });
    }
  };

  const generateSlug = (title: string): string => {
    return title
      .toLowerCase()
      .replace(/[^\u0600-\u06FF\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const addLink = () => {
    if (newLinkTitle.trim() && newLinkUrl.trim()) {
      setPostLinks([...postLinks, { title: newLinkTitle.trim(), url: newLinkUrl.trim() }]);
      setNewLinkTitle('');
      setNewLinkUrl('');
    }
  };

  const removeLink = (index: number) => {
    setPostLinks(postLinks.filter((_, i) => i !== index));
  };

  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const slug = generateSlug(postTitle);
      const postData = {
        title: postTitle,
        slug,
        content: postContent,
        excerpt: postExcerpt || null,
        category_id: postCategoryId === 'no-category' ? null : postCategoryId || null,
        is_published: postIsPublished,
        is_featured: postIsFeatured,
        links: postLinks.length > 0 ? postLinks : null,
      };

      if (editingPost) {
        const { error } = await supabase
          .from('blog_posts')
          .update(postData)
          .eq('id', editingPost.id);

        if (error) throw error;

        toast({
          title: 'نجح',
          description: 'تم تحديث التدوينة بنجاح',
        });
      } else {
        const { error } = await supabase
          .from('blog_posts')
          .insert([postData]);

        if (error) throw error;

        toast({
          title: 'نجح',
          description: 'تم نشر التدوينة بنجاح',
        });
      }

      handlePostCancel();
      loadPosts();
    } catch (error) {
      console.error('Error saving post:', error);
      toast({
        title: 'خطأ',
        description: 'فشل في حفظ التدوينة',
        variant: 'destructive',
      });
    }
  };

  const handlePostCancel = () => {
    setShowPostForm(false);
    setEditingPost(null);
    setPostTitle('');
    setPostContent('');
    setPostExcerpt('');
    setPostCategoryId('');
    setPostIsPublished(false);
    setPostIsFeatured(false);
    setPostLinks([]);
    setNewLinkTitle('');
    setNewLinkUrl('');
  };

  const handleCategoryCancel = () => {
    setShowCategoryForm(false);
    setEditingCategory(null);
    setCategoryName('');
    setCategoryDescription('');
  };

  const handleEditPost = (post: BlogPost) => {
    setEditingPost(post);
    setPostTitle(post.title);
    setPostContent(post.content);
    setPostExcerpt(post.excerpt || '');
    setPostCategoryId(post.category_id || '');
    setPostIsPublished(post.is_published);
    setPostIsFeatured(post.is_featured);
    setPostLinks(post.links || []);
    setShowPostForm(true);
  };

  const handleEditCategory = (category: BlogCategory) => {
    setEditingCategory(category);
    setCategoryName(category.name);
    setCategoryDescription(category.description || '');
    setShowCategoryForm(true);
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
        title: 'نجح',
        description: 'تم حذف التدوينة بنجاح',
      });

      loadPosts();
    } catch (error) {
      console.error('Error deleting post:', error);
      toast({
        title: 'خطأ',
        description: 'فشل في حذف التدوينة',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا التصنيف؟')) return;

    try {
      const { error } = await supabase
        .from('blog_categories')
        .delete()
        .eq('id', categoryId);

      if (error) throw error;

      toast({
        title: 'نجح',
        description: 'تم حذف التصنيف بنجاح',
      });

      loadCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
      toast({
        title: 'خطأ',
        description: 'فشل في حذف التصنيف',
        variant: 'destructive',
      });
    }
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const slug = generateSlug(categoryName);
      const categoryData = {
        name: categoryName,
        slug,
        description: categoryDescription || null,
        display_order: categories.length,
        is_active: true,
      };

      if (editingCategory) {
        const { error } = await supabase
          .from('blog_categories')
          .update(categoryData)
          .eq('id', editingCategory.id);

        if (error) throw error;

        toast({
          title: 'نجح',
          description: 'تم تحديث التصنيف بنجاح',
        });
      } else {
        const { error } = await supabase
          .from('blog_categories')
          .insert([categoryData]);

        if (error) throw error;

        toast({
          title: 'نجح',
          description: 'تم إنشاء التصنيف بنجاح',
        });
      }

      handleCategoryCancel();
      loadCategories();
    } catch (error) {
      console.error('Error saving category:', error);
      toast({
        title: 'خطأ',
        description: 'فشل في حفظ التصنيف',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Posts Management */}
      <Card>
        <CardHeader>
          <CardTitle>إدارة التدوينات</CardTitle>
          <CardDescription>إنشاء وتعديل وحذف تدوينات المدونة</CardDescription>
          <Button onClick={() => setShowPostForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            إضافة تدوينة جديدة
          </Button>
        </CardHeader>
        <CardContent>
          {showPostForm && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>{editingPost ? 'تعديل التدوينة' : 'إضافة تدوينة جديدة'}</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePostSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="postTitle">عنوان التدوينة *</Label>
                    <Input
                      id="postTitle"
                      value={postTitle}
                      onChange={(e) => setPostTitle(e.target.value)}
                      placeholder="أدخل عنوان التدوينة"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="postExcerpt">مقتطف التدوينة</Label>
                    <Textarea
                      id="postExcerpt"
                      value={postExcerpt}
                      onChange={(e) => setPostExcerpt(e.target.value)}
                      placeholder="مقتطف قصير عن التدوينة"
                      rows={2}
                    />
                  </div>

                  <div>
                    <Label htmlFor="postCategory">التصنيف</Label>
                    <Select value={postCategoryId} onValueChange={setPostCategoryId}>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر التصنيف" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="no-category">بدون تصنيف</SelectItem>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="postContent">محتوى التدوينة *</Label>
                    <Textarea
                      id="postContent"
                      value={postContent}
                      onChange={(e) => setPostContent(e.target.value)}
                      placeholder="اكتب محتوى التدوينة هنا..."
                      rows={10}
                      required
                    />
                  </div>

                  {/* Links Section */}
                  <div className="space-y-4">
                    <Label className="flex items-center gap-2">
                      <LinkIcon className="h-4 w-4" />
                      المصادر والروابط
                    </Label>
                    
                    {/* Add new link */}
                    <div className="flex gap-2">
                      <Input
                        placeholder="عنوان الرابط"
                        value={newLinkTitle}
                        onChange={(e) => setNewLinkTitle(e.target.value)}
                        className="flex-1"
                      />
                      <Input
                        placeholder="https://example.com"
                        value={newLinkUrl}
                        onChange={(e) => setNewLinkUrl(e.target.value)}
                        className="flex-1"
                      />
                      <Button type="button" onClick={addLink} size="sm">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Display existing links */}
                    {postLinks.length > 0 && (
                      <div className="space-y-2">
                        {postLinks.map((link, index) => (
                          <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded">
                            <LinkIcon className="h-4 w-4" />
                            <span className="flex-1">{link.title}</span>
                            <span className="text-sm text-muted-foreground">{link.url}</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeLink(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-4 space-x-reverse">
                    <label className="flex items-center space-x-2 space-x-reverse">
                      <input
                        type="checkbox"
                        checked={postIsPublished}
                        onChange={(e) => setPostIsPublished(e.target.checked)}
                        className="rounded"
                      />
                      <span>نشر التدوينة</span>
                    </label>

                    <label className="flex items-center space-x-2 space-x-reverse">
                      <input
                        type="checkbox"
                        checked={postIsFeatured}
                        onChange={(e) => setPostIsFeatured(e.target.checked)}
                        className="rounded"
                      />
                      <span>تدوينة مميزة</span>
                    </label>
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit">
                      {editingPost ? 'تحديث التدوينة' : 'نشر التدوينة'}
                    </Button>
                    <Button type="button" variant="outline" onClick={handlePostCancel}>
                      إلغاء
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Posts List */}
          <div className="space-y-4">
            {posts.map((post) => (
              <Card key={post.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-medium text-lg">{post.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {post.excerpt || 'لا يوجد مقتطف'}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        {post.blog_categories && (
                          <Badge variant="secondary">{post.blog_categories.name}</Badge>
                        )}
                        {post.is_published ? (
                          <Badge variant="default">منشور</Badge>
                        ) : (
                          <Badge variant="outline">مسودة</Badge>
                        )}
                        {post.is_featured && <Badge variant="secondary">مميز</Badge>}
                        {post.links && post.links.length > 0 && (
                          <Badge variant="outline" className="flex items-center gap-1">
                            <LinkIcon className="h-3 w-3" />
                            {post.links.length} روابط
                          </Badge>
                        )}
                        <span className="text-xs text-muted-foreground">
                          <Eye className="h-3 w-3 inline mr-1" />
                          {post.view_count} مشاهدة
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
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
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Categories Management */}
      <Card>
        <CardHeader>
          <CardTitle>إدارة التصنيفات</CardTitle>
          <CardDescription>إنشاء وتعديل وحذف تصنيفات المدونة</CardDescription>
          <Button onClick={() => setShowCategoryForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            إضافة تصنيف جديد
          </Button>
        </CardHeader>
        <CardContent>
          {showCategoryForm && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>{editingCategory ? 'تعديل التصنيف' : 'إضافة تصنيف جديد'}</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCategorySubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="categoryName">اسم التصنيف *</Label>
                    <Input
                      id="categoryName"
                      value={categoryName}
                      onChange={(e) => setCategoryName(e.target.value)}
                      placeholder="أدخل اسم التصنيف"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="categoryDescription">وصف التصنيف</Label>
                    <Textarea
                      id="categoryDescription"
                      value={categoryDescription}
                      onChange={(e) => setCategoryDescription(e.target.value)}
                      placeholder="وصف مختصر للتصنيف"
                      rows={2}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit">
                      {editingCategory ? 'تعديل التصنيف' : 'إنشاء التصنيف'}
                    </Button>
                    <Button type="button" variant="outline" onClick={handleCategoryCancel}>
                      إلغاء
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Categories List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((category) => (
              <Card key={category.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-medium">{category.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {category.description || 'لا يوجد وصف'}
                      </p>
                      <Badge variant={category.is_active ? 'default' : 'secondary'} className="mt-2">
                        {category.is_active ? 'نشط' : 'غير نشط'}
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditCategory(category)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteCategory(category.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
