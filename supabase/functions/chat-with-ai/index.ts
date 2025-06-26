
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface ChatRequest {
  message: string;
  userId?: string;
  userIdentifier?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { message, userId, userIdentifier }: ChatRequest = await req.json();
    
    if (!message) {
      throw new Error('Message is required');
    }

    // Get or create conversation
    let conversation;
    const conversationQuery = userId 
      ? supabase.from('chat_conversations').select('*').eq('user_id', userId)
      : supabase.from('chat_conversations').select('*').eq('user_identifier', userIdentifier);

    const { data: existingConversations } = await conversationQuery.maybeSingle();
    
    if (existingConversations) {
      conversation = existingConversations;
    } else {
      // Create new conversation
      const newConversation = {
        user_id: userId || null,
        user_identifier: userIdentifier || null,
        messages: [],
        title: message.substring(0, 50) + (message.length > 50 ? '...' : ''),
      };
      
      const { data: createdConversation, error: createError } = await supabase
        .from('chat_conversations')
        .insert(newConversation)
        .select()
        .single();
        
      if (createError) throw createError;
      conversation = createdConversation;
    }

    // Add user message to conversation
    const userMessage: ChatMessage = {
      role: 'user',
      content: message,
      timestamp: new Date().toISOString(),
    };

    const updatedMessages = [...(conversation.messages || []), userMessage];

    // Prepare context for Gemini
    const conversationHistory = updatedMessages
      .slice(-10) // آخر 10 رسائل للسياق
      .map(msg => `${msg.role === 'user' ? 'المستخدم' : 'المساعد'}: ${msg.content}`)
      .join('\n');

    // Call Gemini API
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiApiKey) {
      throw new Error('Gemini API key not configured');
    }

    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `أنت مساعد ذكاء اصطناعي ودود ومتعاون، مهمتك الأساسية هي التفاعل مع زوار موقع m0usa.ly وتقديم المساعدة والإجابة على استفساراتهم بخصوص المشاريع والخدمات التي يقدمها "موسى" (صاحب الموقع).

**معلومات عنك (الذكاء الاصطناعي):**
- اسمك: مساعد موسى الذكي
- دورك: مساعد افتراضي لزوار موقع m0usa.ly
- شخصيتك: ودودة، متعاونة، صبورة، وموجهة نحو الحلول

**معلومات عن المستخدم الذي تتفاعل معه:**
- هم زوار موقع m0usa.ly، قد يكونون طلاباً يبحثون عن مشاريع، أو مهتمين بالبرمجة، أو عملاء محتملين
- قد تكون لديهم أسئلة عن المشاريع المعروضة، كيفية طلب مشروع، التقنيات المستخدمة، أو أي استفسارات عامة عن الموقع

**معلومات عن موسى (صاحب الموقع):**
- الاسم: موسى عمر
- الاهتمامات: البرمجة، التقنية، تطوير المواقع
- الجنسية: ليبي
- اللهجة المفضلة للتواصل معه: الليبية الصافية
- موسى هو من يقوم بتطوير ونشر المشاريع للطلاب، وليس الطلاب هم من ينشرون مشاريعهم على الموقع
- رقم الواتساب: +218931303032
- صفحة Facebook: https://www.facebook.com/mousa.0mar

**معلومات عن موقع m0usa.ly:**
- الغرض: عرض مشاريع ويب يقوم موسى بتطويرها للطلاب
- الميزات الرئيسية:
  * تصميم عصري وجذاب ومتجاوب مع جميع الشاشات
  * عرض مباشر للمشاريع (Sandbox) لتشغيل الأكواد محلياً
  * رابط مباشر للواتساب للدردشة المباشرة مع موسى
- الأداء: الموقع سريع جداً وذو أداء ممتاز

**تعليمات وسلوكيات التواصل:**
1. استخدم اللغة العربية الفصحى بشكل أساسي، ولكن حاول التكيف مع اللهجة الليبية في ردودك قدر الإمكان
2. كن دائماً ودوداً، مهذباً، ومحترماً
3. قدم إجابات واضحة، موجزة، ودقيقة
4. هدفك هو مساعدة المستخدم وتقديم حلولاً عملية
5. إذا استفسر المستخدم عن كيفية طلب مشروع أو تكلفته، وجههم للتواصل مع موسى مباشرة عبر الواتساب
6. لا تطلب أي معلومات شخصية حساسة من المستخدمين
7. إذا كان السؤال خارج نطاق معرفتك، وجه المستخدم إلى التواصل مع موسى مباشرة

سياق المحادثة السابقة:
${conversationHistory}

الرسالة الحالية: ${message}

أجب بطريقة ودودة ومفيدة باللغة العربية. إذا سأل أحد عن خدمات التطوير، وجهه للتواصل مع موسى مباشرة.`
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          }
        }),
      }
    );

    if (!geminiResponse.ok) {
      throw new Error(`Gemini API error: ${geminiResponse.statusText}`);
    }

    const geminiData = await geminiResponse.json();
    const aiResponse = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || 'عذراً، لم أتمكن من معالجة طلبك.';

    // Add AI response to conversation
    const aiMessage: ChatMessage = {
      role: 'assistant',
      content: aiResponse,
      timestamp: new Date().toISOString(),
    };

    const finalMessages = [...updatedMessages, aiMessage];

    // Update conversation in database
    const { error: updateError } = await supabase
      .from('chat_conversations')
      .update({
        messages: finalMessages,
        updated_at: new Date().toISOString(),
        last_topic: message.substring(0, 100),
      })
      .eq('id', conversation.id);

    if (updateError) throw updateError;

    return new Response(
      JSON.stringify({
        response: aiResponse,
        conversation_id: conversation.id,
        timestamp: new Date().toISOString(),
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in chat-with-ai function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'حدث خطأ في معالجة طلبك',
        details: error.toString()
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
