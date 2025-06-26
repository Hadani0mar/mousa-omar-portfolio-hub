
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface ChatConversation {
  id: string;
  messages: ChatMessage[];
  created_at: string;
  updated_at: string;
  title?: string;
}

// Helper function to safely parse messages from Json to ChatMessage[]
const parseMessages = (messagesJson: any): ChatMessage[] => {
  if (!Array.isArray(messagesJson)) {
    return [];
  }
  
  return messagesJson.filter((msg): msg is ChatMessage => {
    return (
      msg &&
      typeof msg === 'object' &&
      typeof msg.role === 'string' &&
      (msg.role === 'user' || msg.role === 'assistant') &&
      typeof msg.content === 'string' &&
      typeof msg.timestamp === 'string'
    );
  });
};

export const useAIChat = () => {
  const [conversation, setConversation] = useState<ChatConversation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Generate or get user identifier for guests
  const getUserIdentifier = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      return { userId: user.id, userIdentifier: null };
    }
    
    // For guest users, create or get session ID
    let sessionId = localStorage.getItem('ai_chat_session_id');
    if (!sessionId) {
      sessionId = 'guest_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('ai_chat_session_id', sessionId);
    }
    
    return { userId: null, userIdentifier: sessionId };
  }, []);

  const sendMessage = useCallback(async (message: string) => {
    if (!message.trim()) return;
    
    setIsLoading(true);
    setError(null);

    try {
      const { userId, userIdentifier } = await getUserIdentifier();
      
      console.log('Sending message to chat-with-ai function:', { message, userId, userIdentifier });
      
      const { data, error } = await supabase.functions.invoke('chat-with-ai', {
        body: {
          message: message.trim(),
          userId,
          userIdentifier,
        },
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }

      console.log('Received response from chat-with-ai function:', data);

      // Refresh conversation data
      await loadConversation();
      
      return data?.response;
    } catch (err) {
      console.error('Error sending message:', err);
      const errorMessage = err instanceof Error ? err.message : 'حدث خطأ في إرسال الرسالة';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [getUserIdentifier]);

  const loadConversation = useCallback(async () => {
    try {
      const { userId, userIdentifier } = await getUserIdentifier();
      
      const query = userId 
        ? supabase.from('chat_conversations').select('*').eq('user_id', userId)
        : supabase.from('chat_conversations').select('*').eq('user_identifier', userIdentifier);

      const { data, error } = await query.maybeSingle();
      
      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
        console.error('Error loading conversation:', error);
        throw error;
      }
      
      if (data) {
        // Parse messages from JSONB using our helper function
        const parsedMessages = parseMessages(data.messages);
        
        setConversation({
          id: data.id,
          messages: parsedMessages,
          created_at: data.created_at,
          updated_at: data.updated_at,
          title: data.title || undefined,
        });
      }
    } catch (err) {
      console.error('Error loading conversation:', err);
      setError(err instanceof Error ? err.message : 'خطأ في تحميل المحادثة');
    }
  }, [getUserIdentifier]);

  const clearConversation = useCallback(async () => {
    try {
      const { userId, userIdentifier } = await getUserIdentifier();
      
      const query = userId 
        ? supabase.from('chat_conversations').delete().eq('user_id', userId)
        : supabase.from('chat_conversations').delete().eq('user_identifier', userIdentifier);

      await query;
      setConversation(null);
      
      // Clear guest session if exists
      if (!userId) {
        localStorage.removeItem('ai_chat_session_id');
      }
    } catch (err) {
      console.error('Error clearing conversation:', err);
      setError(err instanceof Error ? err.message : 'خطأ في مسح المحادثة');
    }
  }, [getUserIdentifier]);

  return {
    conversation,
    isLoading,
    error,
    sendMessage,
    loadConversation,
    clearConversation,
  };
};
