
-- إضافة حقول جديدة لجدول المشاريع لدعم القوالب
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS template_category TEXT,
ADD COLUMN IF NOT EXISTS template_price DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS preview_url TEXT,
ADD COLUMN IF NOT EXISTS is_template BOOLEAN DEFAULT false;

-- إنشاء فهرس لتحسين الأداء
CREATE INDEX IF NOT EXISTS idx_projects_template_category ON public.projects(template_category) WHERE is_template = true;
CREATE INDEX IF NOT EXISTS idx_projects_is_template ON public.projects(is_template);
