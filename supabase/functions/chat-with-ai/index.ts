
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
              text: `أنت مساعد ذكي متخصص في مساعدة زوار موقع موسى عمر (m0usa.ly). موسى هو مطور مواقع ليبي محترف متخصص في React, Next.js, TypeScript والتقنيات الحديثة.

معلومات عن موسى:
- مطور مواقع ليبي محترف
- متخصص في React, Next.js, TypeScript, HTML, CSS, JavaScript, Tailwind CSS, Node.js
- يقدم خدمات تطوير مواقع احترافية
- يمكن التواصل معه عبر WhatsApp: +218931303032
- صفحته على Facebook: https://www.facebook.com/mousa.0mar
- موقعه: https://www.m0usa.ly

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
