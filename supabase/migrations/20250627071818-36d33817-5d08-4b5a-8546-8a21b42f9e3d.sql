
-- إنشاء جدول المهارات
CREATE TABLE IF NOT EXISTS public.skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- إضافة المهارات الافتراضية
INSERT INTO public.skills (name, display_order) VALUES 
('Next.js', 1),
('React.js', 2),
('HTML', 3),
('CSS', 4),
('JavaScript', 5),
('TypeScript', 6),
('Tailwind CSS', 7),
('Node.js', 8),
('Git', 9),
('Responsive Design', 10)
ON CONFLICT DO NOTHING;
