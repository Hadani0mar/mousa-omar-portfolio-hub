
-- إنشاء جدول المشاريع
CREATE TABLE public.projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  technologies TEXT[] DEFAULT '{}',
  html_content TEXT NOT NULL,
  css_content TEXT,
  js_content TEXT,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- إنشاء جدول الإشعارات
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('info', 'success', 'warning')),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- إنشاء جدول إعدادات الموقع
CREATE TABLE public.site_config (
  id INTEGER PRIMARY KEY DEFAULT 1,
  show_terminal BOOLEAN DEFAULT true,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT single_row CHECK (id = 1)
);

-- إدراج الإعدادات الافتراضية
INSERT INTO public.site_config (show_terminal) VALUES (true);

-- تمكين Row Level Security للمشاريع والإشعارات (للقراءة العامة)
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_config ENABLE ROW LEVEL SECURITY;

-- سياسات القراءة العامة للمشاريع
CREATE POLICY "Anyone can view projects" ON public.projects FOR SELECT USING (true);

-- سياسات القراءة العامة للإشعارات النشطة
CREATE POLICY "Anyone can view active notifications" ON public.notifications 
FOR SELECT USING (expires_at > now());

-- سياسات القراءة العامة لإعدادات الموقع
CREATE POLICY "Anyone can view site config" ON public.site_config FOR SELECT USING (true);

-- سياسات الكتابة للمديرين المصادقين فقط
CREATE POLICY "Authenticated users can manage projects" ON public.projects 
FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can manage notifications" ON public.notifications 
FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can manage config" ON public.site_config 
FOR ALL USING (auth.uid() IS NOT NULL);
