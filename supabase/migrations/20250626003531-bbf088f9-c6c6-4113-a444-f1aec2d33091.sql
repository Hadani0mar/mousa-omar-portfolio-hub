
-- إضافة جدول لتخزين تعليمات الـ AI
CREATE TABLE IF NOT EXISTS public.ai_instructions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instruction_key TEXT NOT NULL UNIQUE,
  instruction_value TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- إضافة التعليمات الافتراضية
INSERT INTO public.ai_instructions (instruction_key, instruction_value, description) VALUES 
('system_prompt', 'أنت مساعد ذكاء اصطناعي ودود ومتعاون، مهمتك الأساسية هي التفاعل مع زوار موقع m0usa.ly وتقديم المساعدة والإجابة على استفساراتهم بخصوص المشاريع والخدمات التي يقدمها "موسى" (صاحب الموقع).', 'النص الأساسي للذكاء الاصطناعي'),
('assistant_name', 'مساعد موسى الذكي', 'اسم المساعد الذكي'),
('contact_whatsapp', '+218931303032', 'رقم الواتساب للتواصل'),
('site_description', 'موقع m0usa.ly لعرض مشاريع الويب', 'وصف الموقع'),
('code_formatting', 'true', 'تنسيق الكود منفصل عن النص')
ON CONFLICT (instruction_key) DO NOTHING;

-- إضافة جدول لإعدادات الموقع المتقدمة
CREATE TABLE IF NOT EXISTS public.advanced_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT NOT NULL UNIQUE,
  setting_value TEXT NOT NULL,
  setting_type TEXT NOT NULL DEFAULT 'text',
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- إضافة الإعدادات الافتراضية
INSERT INTO public.advanced_settings (setting_key, setting_value, setting_type, description) VALUES 
('hero_title', 'مرحباً، أنا موسى عمر', 'text', 'عنوان الصفحة الرئيسية'),
('hero_subtitle', 'مطور مواقع ليبي متخصص في تطوير واجهات المستخدم الحديثة والتفاعلية', 'text', 'العنوان الفرعي'),
('projects_per_slide', '3', 'number', 'عدد المشاريع في كل شريحة'),
('auto_slide_interval', '5000', 'number', 'مدة عرض كل شريحة بالميلي ثانية'),
('show_project_slider', 'true', 'boolean', 'إظهار عارض المشاريع'),
('max_featured_projects', '6', 'number', 'عدد المشاريع المميزة القصوى')
ON CONFLICT (setting_key) DO NOTHING;

-- إضافة عمود لترتيب المشاريع
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS project_status TEXT DEFAULT 'active';

-- تحديث المشاريع الموجودة بترتيب افتراضي
UPDATE public.projects SET display_order = EXTRACT(EPOCH FROM created_at)::INTEGER WHERE display_order = 0;
