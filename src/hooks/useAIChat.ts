
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface Conversation {
  id: string;
  messages: ChatMessage[];
  title?: string;
  updated_at: string;
}

export const useAIChat = () => {
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateUserIdentifier = useCallback(() => {
    return `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  const loadConversation = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      let userIdentifier = localStorage.getItem('chat_user_identifier');
      
      if (!userIdentifier) {
        userIdentifier = generateUserIdentifier();
        localStorage.setItem('chat_user_identifier', userIdentifier);
      }

      const query = user 
        ? supabase.from('chat_conversations').select('*').eq('user_id', user.id)
        : supabase.from('chat_conversations').select('*').eq('user_identifier', userIdentifier);

      const { data, error } = await query.maybeSingle();
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error loading conversation:', error);
        return;
      }

      if (data) {
        // Parse messages from Json to ChatMessage[]
        const parsedMessages = Array.isArray(data.messages) 
          ? data.messages as ChatMessage[]
          : [];
        
        setConversation({
          id: data.id,
          messages: parsedMessages,
          title: data.title,
          updated_at: data.updated_at
        });
      }
    } catch (err) {
      console.error('Error in loadConversation:', err);
    }
  }, [generateUserIdentifier]);

  const sendMessage = useCallback(async (message: string) => {
    if (!message.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      let userIdentifier = localStorage.getItem('chat_user_identifier');
      
      if (!userIdentifier) {
        userIdentifier = generateUserIdentifier();
        localStorage.setItem('chat_user_identifier', userIdentifier);
      }

      console.log('Sending message to chat-with-ai function:', {
        message,
        userId: user?.id || null,
        userIdentifier: !user ? userIdentifier : null
      });

      const { data, error } = await supabase.functions.invoke('chat-with-ai', {
        body: {
          message,
          userId: user?.id || null,
          userIdentifier: !user ? userIdentifier : null,
        },
      });

      console.log('Received response from chat-with-ai function:', data);

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(error.message || 'فشل في إرسال الرسالة');
      }

      if (!data || !data.response) {
        throw new Error('استجابة غير صالحة من الخادم');
      }

      // Reload conversation to get updated messages
      await loadConversation();

    } catch (err: any) {
      console.error('Error sending message:', err);
      setError(err.message || 'حدث خطأ أثناء إرسال الرسالة');
    } finally {
      setIsLoading(false);
    }
  }, [loadConversation, generateUserIdentifier]);

  const clearConversation = useCallback(async () => {
    if (!conversation) return;

    try {
      const { error } = await supabase
        .from('chat_conversations')
        .delete()
        .eq('id', conversation.id);

      if (error) {
        console.error('Error deleting conversation:', error);
        throw new Error('فشل في حذف المحادثة');
      }

      setConversation(null);
      
      const userIdentifier = generateUserIdentifier();
      localStorage.setItem('chat_user_identifier', userIdentifier);

    } catch (err: any) {
      console.error('Error clearing conversation:', err);
      setError(err.message || 'حدث خطأ أثناء حذف المحادثة');
    }
  }, [conversation, generateUserIdentifier]);

  return {
    conversation,
    isLoading,
    error,
    sendMessage,
    loadConversation,
    clearConversation,
  };
};
