
-- حذف الجدول الموجود إذا كان هناك مشكلة في البنية
DROP TABLE IF EXISTS public.chat_conversations CASCADE;

-- إنشاء جدول المحادثات من جديد
CREATE TABLE public.chat_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  user_identifier TEXT, -- للمستخدمين الضيوف (session_id)
  messages JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  title TEXT, -- عنوان المحادثة (اختياري)
  context_summary TEXT, -- ملخص السياق للمحادثات الطويلة
  last_topic TEXT -- آخر موضوع تم مناقشته
);

-- إنشاء فهرس لتسريع البحث
CREATE INDEX idx_chat_conversations_user_id ON public.chat_conversations(user_id);
CREATE INDEX idx_chat_conversations_user_identifier ON public.chat_conversations(user_identifier);
CREATE INDEX idx_chat_conversations_updated_at ON public.chat_conversations(updated_at);

-- تمكين Row Level Security
ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;

-- سياسة للمستخدمين المسجلين - يمكنهم رؤية محادثاتهم فقط
CREATE POLICY "Users can view their own conversations" ON public.chat_conversations
FOR SELECT USING (
  (auth.uid() IS NOT NULL AND user_id = auth.uid()) OR
  (auth.uid() IS NULL AND user_identifier IS NOT NULL)
);

-- سياسة للإدراج - المستخدمون يمكنهم إنشاء محادثات جديدة
CREATE POLICY "Users can create conversations" ON public.chat_conversations
FOR INSERT WITH CHECK (
  (auth.uid() IS NOT NULL AND user_id = auth.uid()) OR
  (auth.uid() IS NULL AND user_identifier IS NOT NULL)
);

-- سياسة للتحديث - المستخدمون يمكنهم تحديث محادثاتهم فقط
CREATE POLICY "Users can update their own conversations" ON public.chat_conversations
FOR UPDATE USING (
  (auth.uid() IS NOT NULL AND user_id = auth.uid()) OR
  (auth.uid() IS NULL AND user_identifier IS NOT NULL)
);

-- دالة لتنظيف الرسائل القديمة (الاحتفاظ بآخر 5 رسائل)
CREATE OR REPLACE FUNCTION manage_conversation_memory()
RETURNS TRIGGER AS $$
BEGIN
  -- التحقق من عدد الرسائل في المحادثة
  IF jsonb_array_length(NEW.messages) > 10 THEN -- نحتفظ بـ 5 رسائل من المستخدم + 5 ردود من AI
    -- الاحتفاظ بآخر 10 رسائل (5 مستخدم + 5 AI)
    NEW.messages = (
      SELECT jsonb_agg(msg)
      FROM (
        SELECT jsonb_array_elements(NEW.messages) AS msg
        ORDER BY (jsonb_array_elements(NEW.messages) ->> 'timestamp')::timestamp DESC
        LIMIT 10
      ) AS recent_messages
    );
  END IF;
  
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- إنشاء المحفز
CREATE TRIGGER manage_memory_trigger
  BEFORE UPDATE ON public.chat_conversations
  FOR EACH ROW EXECUTE FUNCTION manage_conversation_memory();
