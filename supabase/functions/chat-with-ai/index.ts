
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

    console.log('Processing message:', message, 'from user:', userId || userIdentifier);

    // Load AI instructions
    const { data: aiInstructions } = await supabase
      .from('ai_instructions')
      .select('*');

    // Load all projects to make AI aware of them
    const { data: projects } = await supabase
      .from('projects')
      .select('*')
      .eq('project_status', 'active')
      .order('display_order', { ascending: true });

    // Load advanced settings
    const { data: advancedSettings } = await supabase
      .from('advanced_settings')
      .select('*');

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

    // Build AI instructions
    const systemPrompt = aiInstructions?.find(i => i.instruction_key === 'system_prompt')?.instruction_value || 
      'أنت مساعد ذكاء اصطناعي ودود ومتعاون';
    
    const assistantName = aiInstructions?.find(i => i.instruction_key === 'assistant_name')?.instruction_value || 
      'مساعد موسى الذكي';
    
    const contactWhatsApp = aiInstructions?.find(i => i.instruction_key === 'contact_whatsapp')?.instruction_value || 
      '+218931303032';
    
    const siteDescription = aiInstructions?.find(i => i.instruction_key === 'site_description')?.instruction_value || 
      'موقع m0usa.ly لعرض مشاريع الويب';
    
    const codeFormatting = aiInstructions?.find(i => i.instruction_key === 'code_formatting')?.instruction_value === 'true';

    // Build projects context
    const projectsContext = projects?.map(project => 
      `- ${project.title}: ${project.description} (التقنيات: ${project.technologies?.join(', ') || 'غير محدد'})`
    ).join('\n') || 'لا توجد مشاريع متاحة حالياً';

    // Build advanced settings context
    const settingsContext = advancedSettings?.map(setting => 
      `${setting.setting_key}: ${setting.setting_value}`
    ).join('\n') || '';

    // Call Gemini API
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiApiKey) {
      throw new Error('Gemini API key not configured');
    }

    console.log('Calling Gemini API...');

    const enhancedPrompt = `${systemPrompt}

**معلومات عنك (الذكاء الاصطناعي):**
- اسمك: ${assistantName}
- دورك: مساعد افتراضي لزوار موقع m0usa.ly
- شخصيتك: ودودة، متعاونة، صبورة، وموجهة نحو الحلول

**معلومات عن موسى (صاحب الموقع):**
- الاسم: موسى عمر
- الاهتمامات: البرمجة، التقنية، تطوير المواقع
- الجنسية: ليبي
- رقم الواتساب: ${contactWhatsApp}
- صفحة Facebook: https://www.facebook.com/mousa.0mar

**معلومات عن موقع m0usa.ly:**
${siteDescription}

**المشاريع المتاحة في الموقع:**
${projectsContext}

**إعدادات الموقع:**
${settingsContext}

**تعليمات مهمة:**
1. استخدم اللغة العربية الفصحى بشكل أساسي
2. كن دائماً ودوداً، مهذباً، ومحترماً
3. قدم إجابات واضحة، موجزة، ودقيقة
4. إذا استفسر المستخدم عن كيفية طلب مشروع أو تكلفته، وجههم للتواصل مع موسى مباشرة عبر الواتساب
5. ${codeFormatting ? 'عندما تقدم كود برمجي، اجعله منفصلاً عن النص العادي ومنسقاً بشكل واضح' : ''}
6. أنت تعرف جميع مشاريع موسى المذكورة أعلاه ويمكنك الحديث عنها بالتفصيل

سياق المحادثة السابقة:
${conversationHistory}

الرسالة الحالية: ${message}

أجب بطريقة ودودة ومفيدة باللغة العربية.`;

    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: enhancedPrompt
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

    console.log('Gemini API response status:', geminiResponse.status);

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error('Gemini API error response:', errorText);
      throw new Error(`Gemini API error: ${geminiResponse.status} - ${errorText}`);
    }

    const geminiData = await geminiResponse.json();
    console.log('Gemini API response data:', geminiData);

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

    if (updateError) {
      console.error('Database update error:', updateError);
      throw updateError;
    }

    console.log('Successfully processed message and updated conversation');

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
