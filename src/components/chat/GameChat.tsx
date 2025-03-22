import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../utils/supabase';
import { useAuthStore } from '../../stores/authStore';
import type { Database } from '../../utils/database.types';

type ChatMessage = Database['public']['Tables']['chat_messages']['Row'];
type Profile = Database['public']['Tables']['profiles']['Row'];

interface GameChatProps {
  gameId: string;
}

const GameChat: React.FC<GameChatProps> = ({ gameId }) => {
  const { user } = useAuthStore();
  const [messages, setMessages] = useState<(ChatMessage & { profile: Profile })[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadMessages();
    
    const subscription = supabase
      .channel(`game_chat_${gameId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_messages',
          filter: `game_id=eq.${gameId}`,
        },
        () => {
          loadMessages();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [gameId]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const loadMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*, profile:profiles(*)')
        .eq('game_id', gameId)
        .order('created_at');

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('채팅 메시지 로딩 에러:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    try {
      const { error } = await supabase.from('chat_messages').insert({
        game_id: gameId,
        user_id: user.id,
        message: newMessage.trim(),
      });

      if (error) throw error;
      setNewMessage('');
    } catch (error) {
      console.error('메시지 전송 에러:', error);
      alert('메시지 전송에 실패했습니다.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow">
      <div className="px-4 py-2 border-b">
        <h3 className="text-lg font-medium text-gray-900">채팅</h3>
      </div>
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
        style={{ maxHeight: '400px' }}
      >
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.user_id === user?.id ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-xs px-4 py-2 rounded-lg ${
                message.user_id === user?.id
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              <div className="text-xs mb-1">
                {message.profile.username}
              </div>
              <div>{message.message}</div>
            </div>
          </div>
        ))}
      </div>
      <form onSubmit={handleSendMessage} className="p-4 border-t">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="메시지를 입력하세요..."
            className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            전송
          </button>
        </div>
      </form>
    </div>
  );
};

export default GameChat; 