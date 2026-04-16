'use client';

import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { SectionCard } from '@/components/dashboard/section-card';
import { apiRequest } from '@/lib/api';
import { createRealtimeSocket } from '@/lib/socket';
import { useAuthStore } from '@/stores/auth-store';

type Conversation = {
  id: string;
  name?: string | null;
  type: 'DIRECT' | 'GROUP';
  latestMessage?: { body: string } | null;
};

type Message = {
  id: string;
  body: string;
  senderId: string;
  createdAt: string;
};

export default function MessagesPage() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const user = useAuthStore((state) => state.user);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState('');
  const [typingLabel, setTypingLabel] = useState('');
  const socketRef = useRef<ReturnType<typeof createRealtimeSocket> | null>(null);

  useEffect(() => {
    const load = async () => {
      const results = await apiRequest<Conversation[]>('/messaging/conversations');
      setConversations(results);
      const queryConversationId = new URLSearchParams(window.location.search).get('conversation');
      if (queryConversationId && results.some((conversation) => conversation.id === queryConversationId)) {
        setSelectedId(queryConversationId);
      } else if (results[0]) {
        setSelectedId(results[0].id);
      }
    };

    void load();
  }, []);

  useEffect(() => {
    if (!selectedId) {
      return;
    }

    const loadMessages = async () => {
      const results = await apiRequest<Message[]>(`/messaging/conversations/${selectedId}/messages`);
      setMessages(results);
      await apiRequest(`/messaging/conversations/${selectedId}/read`, { method: 'POST' });
    };

    void loadMessages();
  }, [selectedId]);

  useEffect(() => {
    if (!accessToken || !selectedId) {
      return;
    }

    const socket = createRealtimeSocket(accessToken);
    socketRef.current = socket;
    socket.emit('conversation:join', { conversationId: selectedId });
    socket.on('message.created', (message: Message & { conversationId: string }) => {
      if (message.conversationId === selectedId) {
        setMessages((current) =>
          current.some((item) => item.id === message.id) ? current : [...current, message]
        );
      }
    });
    socket.on('conversation:typing', (event: { conversationId: string; fullName: string; isTyping: boolean }) => {
      if (event.conversationId === selectedId) {
        setTypingLabel(event.isTyping ? `${event.fullName} is typing...` : '');
      }
    });

    return () => {
      socketRef.current = null;
      socket.disconnect();
    };
  }, [accessToken, selectedId]);

  const selectedConversation = useMemo(
    () => conversations.find((conversation) => conversation.id === selectedId) ?? null,
    [conversations, selectedId]
  );

  const onSend = async (event: FormEvent) => {
    event.preventDefault();
    if (!selectedId || !draft.trim()) {
      return;
    }

    const message = await apiRequest<Message>(`/messaging/conversations/${selectedId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ body: draft })
    });

    setMessages((current) => [...current, message]);
    setDraft('');
    if (socketRef.current) {
      socketRef.current.emit('conversation:typing', {
        conversationId: selectedId,
        isTyping: false
      });
    }
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[0.4fr_0.6fr]">
      <SectionCard title="Conversations" eyebrow="Realtime chat">
        <div className="space-y-3">
          {conversations.map((conversation) => (
            <button
              key={conversation.id}
              type="button"
              onClick={() => setSelectedId(conversation.id)}
              className={`w-full rounded-3xl p-4 text-left ${selectedId === conversation.id ? 'bg-ink text-white' : 'bg-mist text-ink'}`}
            >
              <div className="font-semibold">{conversation.name ?? conversation.type}</div>
              <div className="mt-2 text-sm opacity-80">{conversation.latestMessage?.body ?? 'No messages yet'}</div>
            </button>
          ))}
        </div>
      </SectionCard>
      <SectionCard title={selectedConversation?.name ?? 'Conversation'} eyebrow="Academic support">
        <div className="flex min-h-[28rem] flex-col">
          <div className="flex-1 space-y-3 overflow-y-auto">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`max-w-[80%] rounded-3xl px-4 py-3 text-sm leading-7 ${
                  message.senderId === user?.id
                    ? 'ml-auto bg-ink text-white'
                    : 'bg-mist text-ink'
                }`}
              >
                {message.body}
              </div>
            ))}
          </div>
          <p className="mt-3 text-sm text-campus">{typingLabel}</p>
          <form className="mt-4 flex gap-3" onSubmit={onSend}>
            <input
              className="flex-1 rounded-full border border-ink/10 bg-mist px-5 py-3 outline-none"
              placeholder="Type a message"
              value={draft}
              onChange={(event) => {
                const value = event.target.value;
                setDraft(value);
                if (selectedId && socketRef.current) {
                  socketRef.current.emit('conversation:typing', {
                    conversationId: selectedId,
                    isTyping: value.length > 0
                  });
                }
              }}
            />
            <button className="rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white" type="submit">
              Send
            </button>
          </form>
        </div>
      </SectionCard>
    </div>
  );
}
