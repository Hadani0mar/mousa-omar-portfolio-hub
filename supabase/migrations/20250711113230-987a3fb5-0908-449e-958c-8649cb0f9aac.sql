
-- إنشاء جدول تصنيفات المدونة
CREATE TABLE public.blog_categories (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  description text,
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- إنشاء جدول المدونة
CREATE TABLE public.blog_posts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  content text NOT NULL,
  excerpt text,
  category_id uuid REFERENCES public.blog_categories(id) ON DELETE SET NULL,
  is_published boolean DEFAULT false,
  is_featured boolean DEFAULT false,
  view_count integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  published_at timestamp with time zone
);

-- تمكين RLS للتصنيفات
ALTER TABLE public.blog_categories ENABLE ROW LEVEL SECURITY;

-- سياسات الأمان للتصنيفات
CREATE POLICY "Anyone can view active categories" 
  ON public.blog_categories 
  FOR SELECT 
  USING (is_active = true);

CREATE POLICY "Authenticated users can manage categories" 
  ON public.blog_categories 
  FOR ALL 
  USING (auth.uid() IS NOT NULL);

-- تمكين RLS للتدوينات
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- سياسات الأمان للتدوينات
CREATE POLICY "Anyone can view published posts" 
  ON public.blog_posts 
  FOR SELECT 
  USING (is_published = true);

CREATE POLICY "Authenticated users can manage posts" 
  ON public.blog_posts 
  FOR ALL 
  USING (auth.uid() IS NOT NULL);

-- إضافة تصنيفات افتراضية
INSERT INTO public.blog_categories (name, slug, description) VALUES
('تطوير الويب', 'web-development', 'مقالات حول تطوير الويب والتقنيات الحديثة'),
('نصائح تقنية', 'tech-tips', 'نصائح وإرشادات تقنية مفيدة'),
('أخبار التقنية', 'tech-news', 'آخر أخبار عالم التقنية');

-- دالة لتحديث تاريخ التحديث
CREATE OR REPLACE FUNCTION public.update_blog_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at = now();
  IF NEW.is_published = true AND OLD.is_published = false THEN
    NEW.published_at = now();
  END IF;
  RETURN NEW;
END;
$function$;

-- إنشاء triggers لتحديث التواريخ
CREATE TRIGGER update_blog_categories_updated_at
  BEFORE UPDATE ON public.blog_categories
  FOR EACH ROW EXECUTE FUNCTION public.update_blog_updated_at();

CREATE TRIGGER update_blog_posts_updated_at
  BEFORE UPDATE ON public.blog_posts
  FOR EACH ROW EXECUTE FUNCTION public.update_blog_updated_at();
