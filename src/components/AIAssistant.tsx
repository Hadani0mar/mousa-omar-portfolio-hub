
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageCircle, Send, Trash2, Bot, User, X } from 'lucide-react';
import { useAIChat, ChatMessage } from '@/hooks/useAIChat';
import { Badge } from '@/components/ui/badge';

interface AIAssistantProps {
  isOpen: boolean;
  onToggle: () => void;
}

export const AIAssistant: React.FC<AIAssistantProps> = ({ isOpen, onToggle }) => {
  const [input, setInput] = useState('');
  const { conversation, isLoading, error, sendMessage, loadConversation, clearConversation } = useAIChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      loadConversation();
      // Focus input when opened
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, loadConversation]);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation?.messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const messageText = input;
    setInput('');

    try {
      await sendMessage(messageText);
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  if (!isOpen) {
    return (
      <Button
        onClick={onToggle}
        className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all duration-200"
        size="icon"
      >
        <MessageCircle className="h-6 w-6 text-white" />
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-6 right-6 z-50 w-96 h-[500px] shadow-2xl border-0 bg-background/95 backdrop-blur-sm">
      <CardHeader className="pb-3 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
              <Bot className="h-4 w-4 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg">مساعد موسى الذكي</CardTitle>
              <p className="text-xs text-muted-foreground">
                {conversation?.messages?.length || 0} رسالة
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {conversation?.messages && conversation.messages.length > 0 && (
              <Button
                variant="ghost"
                size="icon"
                onClick={clearConversation}
                className="h-8 w-8"
                title="مسح المحادثة"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggle}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0 flex flex-col h-[calc(500px-80px)]">
        <ScrollArea className="flex-1 p-4">
          {!conversation?.messages?.length ? (
            <div className="text-center py-8 text-muted-foreground">
              <Bot className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">مرحباً! أنا مساعد موسى الذكي</p>
              <p className="text-xs mt-1">اسألني أي شيء عن خدمات التطوير أو موقع موسى</p>
            </div>
          ) : (
            <div className="space-y-4">
              {conversation.messages.map((message: ChatMessage, index: number) => (
                <div
                  key={index}
                  className={`flex gap-3 ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {message.role === 'assistant' && (
                    <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                  )}
                  
                  <div
                    className={`max-w-[80%] p-3 rounded-lg text-sm ${
                      message.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-muted'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{message.content}</p>
                    <p className={`text-xs mt-1 opacity-70 ${
                      message.role === 'user' ? 'text-blue-100' : 'text-muted-foreground'
                    }`}>
                      {new Date(message.timestamp).toLocaleTimeString('ar-LY', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>

                  {message.role === 'user' && (
                    <div className="h-8 w-8 rounded-full bg-gray-500 flex items-center justify-center flex-shrink-0">
                      <User className="h-4 w-4 text-white" />
                    </div>
                  )}
                </div>
              ))}
              
              {isLoading && (
                <div className="flex gap-3 justify-start">
                  <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                  <div className="bg-muted p-3 rounded-lg">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {error && (
            <div className="mt-4">
              <Badge variant="destructive" className="text-xs">
                {error}
              </Badge>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </ScrollArea>

        <div className="p-4 border-t">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="اكتب رسالتك هنا..."
              disabled={isLoading}
              className="flex-1 text-right"
              dir="rtl"
            />
            <Button
              type="submit"
              disabled={!input.trim() || isLoading}
              size="icon"
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
};
