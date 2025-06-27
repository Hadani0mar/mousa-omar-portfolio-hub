
-- إضافة أعمدة جديدة لجدول المشاريع
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS download_enabled boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS download_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS like_count integer DEFAULT 0;

-- إنشاء جدول الإعجابات
CREATE TABLE IF NOT EXISTS public.project_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  device_id text NOT NULL,
  ip_address text,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  UNIQUE(project_id, device_id)
);

-- تفعيل RLS على جدول الإعجابات
ALTER TABLE public.project_likes ENABLE ROW LEVEL SECURITY;

-- سياسة للسماح بقراءة جميع الإعجابات (للعد)
CREATE POLICY "Anyone can view likes count" 
  ON public.project_likes 
  FOR SELECT 
  USING (true);

-- سياسة للسماح بإضافة إعجاب واحد لكل جهاز
CREATE POLICY "Anyone can add one like per device" 
  ON public.project_likes 
  FOR INSERT 
  WITH CHECK (true);

-- دالة لزيادة عداد التنزيل
CREATE OR REPLACE FUNCTION public.increment_download_count(project_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.projects 
  SET download_count = COALESCE(download_count, 0) + 1,
      updated_at = now()
  WHERE id = project_id;
END;
$$;

-- دالة لزيادة عداد الإعجابات
CREATE OR REPLACE FUNCTION public.increment_like_count(project_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.projects 
  SET like_count = COALESCE(like_count, 0) + 1,
      updated_at = now()
  WHERE id = project_id;
END;
$$;

-- إنشاء فهرس لتحسين الأداء
CREATE INDEX IF NOT EXISTS idx_project_likes_project_device 
  ON public.project_likes(project_id, device_id);

CREATE INDEX IF NOT EXISTS idx_project_likes_created_at 
  ON public.project_likes(created_at);
