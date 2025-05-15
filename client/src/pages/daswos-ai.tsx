import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Loader2, MessageSquare, Plus, Send, Archive, Edit, ExternalLink, Briefcase } from 'lucide-react';
import { useWorkspaceAI } from '@/hooks/use-workspace-ai';

interface Chat {
  id: number;
  title: string;
  createdAt: string;
  updatedAt: string | null;
  userId: number | null;
  isArchived: boolean;
}

interface ChatMessage {
  id: number;
  chatId: number;
  role: string;
  content: string;
  timestamp: string;
  metadata: any;
}

interface Source {
  id: number;
  messageId: number;
  sourceType: string;
  sourceId: number | null;
  sourceUrl: string | null;
  sourceName: string;
  relevanceScore: number;
  excerpt: string | null;
  createdAt: string;
}

export default function DaswosAIPage() {
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [userInput, setUserInput] = useState('');
  const [editingTitle, setEditingTitle] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { getWorkspaceContentForAI, hasWorkspaceItems, workspaceItemCount } = useWorkspaceAI();

  // Fetch all chats
  const {
    data: chats = [],
    isLoading: isLoadingChats,
    error: chatsError,
  } = useQuery<Chat[]>({
    queryKey: ['/api/daswos-ai/chats'],
    refetchOnWindowFocus: false,
  });

  // Fetch messages for active chat
  const {
    data: messages = [],
    isLoading: isLoadingMessages,
    error: messagesError,
  } = useQuery<ChatMessage[]>({
    queryKey: ['/api/daswos-ai/chats', activeChat?.id, 'messages'],
    enabled: !!activeChat,
    refetchOnWindowFocus: false,
    refetchInterval: activeChat ? 3000 : false, // Poll for new messages every 3 seconds when chat is active
  });

  // Mutations
  const createChatMutation = useMutation({
    mutationFn: () => {
      return apiRequest('/api/daswos-ai/chats', 'POST', {
        title: 'New Chat',
      });
    },
    onSuccess: (newChat: Chat) => {
      queryClient.invalidateQueries({ queryKey: ['/api/daswos-ai/chats'] });
      setActiveChat(newChat);
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to create new chat',
        variant: 'destructive',
      });
    },
  });

  const updateChatTitleMutation = useMutation({
    mutationFn: ({ id, title }: { id: number; title: string }) => {
      return apiRequest(`/api/daswos-ai/chats/${id}`, 'PATCH', { title });
    },
    onSuccess: (updatedChat: Chat) => {
      queryClient.invalidateQueries({ queryKey: ['/api/daswos-ai/chats'] });
      setActiveChat(updatedChat);
      setEditingTitle(false);
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to update chat title',
        variant: 'destructive',
      });
    },
  });

  const sendMessageMutation = useMutation({
    mutationFn: ({
      chatId,
      content,
      metadata = {}
    }: {
      chatId: number;
      content: string;
      metadata?: any
    }) => {
      return apiRequest(`/api/daswos-ai/chats/${chatId}/messages`, 'POST', {
        role: 'user',
        content,
        metadata,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/daswos-ai/chats', activeChat?.id, 'messages'] });
      setUserInput('');
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive',
      });
    },
  });

  const archiveChatMutation = useMutation({
    mutationFn: (id: number) => {
      return apiRequest(`/api/daswos-ai/chats/${id}`, 'DELETE');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/daswos-ai/chats'] });
      setActiveChat(null);
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to archive chat',
        variant: 'destructive',
      });
    },
  });

  // When activeChat changes, update the title for editing
  useEffect(() => {
    if (activeChat) {
      setNewTitle(activeChat.title);
    }
  }, [activeChat]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeChat || !userInput.trim()) return;

    // Get workspace content if available
    const workspaceContent = getWorkspaceContentForAI();

    // Combine user input with workspace content if available
    let messageContent = userInput.trim();
    if (workspaceContent) {
      // Add a note about workspace content for the user's message
      messageContent += "\n\n[Note: Including content from my workspace for context]";
    }

    sendMessageMutation.mutate({
      chatId: activeChat.id,
      content: messageContent,
      // Include workspace content in metadata
      metadata: {
        workspaceContent: workspaceContent || null,
        hasWorkspaceItems: hasWorkspaceItems(),
        workspaceItemCount: workspaceItemCount
      }
    });
  };

  const handleUpdateTitle = () => {
    if (!activeChat || !newTitle.trim()) return;

    updateChatTitleMutation.mutate({
      id: activeChat.id,
      title: newTitle.trim(),
    });
  };

  // Message rendering
  const renderMessageContent = (message: ChatMessage) => {
    if (message.metadata?.pending) {
      return (
        <div className="flex items-center space-x-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-muted-foreground">Processing...</span>
        </div>
      );
    }

    // For regular messages, render the content with paragraph breaks
    return (
      <div className="whitespace-pre-wrap break-words">
        {message.content.split('\n').map((paragraph, i) => (
          <p key={i} className={i > 0 ? 'mt-2' : ''}>
            {paragraph}
          </p>
        ))}
      </div>
    );
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Daswos AI Chat</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Chat Sidebar */}
        <div className="md:col-span-1 space-y-4">
          <Button
            className="w-full flex items-center justify-center gap-2"
            onClick={() => createChatMutation.mutate()}
            disabled={createChatMutation.isPending}
          >
            {createChatMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            New Chat
          </Button>

          {isLoadingChats ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : chatsError ? (
            <Card className="bg-destructive/10 p-4">
              <p className="text-sm text-destructive">Failed to load chats</p>
            </Card>
          ) : chats.length === 0 ? (
            <Card className="bg-muted p-4">
              <p className="text-sm text-muted-foreground">No chats yet. Start a new conversation!</p>
            </Card>
          ) : (
            <div className="space-y-2">
              {chats
                .filter(chat => !chat.isArchived)
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .map(chat => (
                  <Card
                    key={chat.id}
                    className={`cursor-pointer hover:bg-accent transition-colors ${
                      activeChat?.id === chat.id ? 'border-primary' : ''
                    }`}
                    onClick={() => setActiveChat(chat)}
                  >
                    <CardHeader className="p-4">
                      <CardTitle className="text-sm truncate">{chat.title}</CardTitle>
                      <CardDescription className="text-xs">
                        {new Date(chat.createdAt).toLocaleDateString()}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                ))}
            </div>
          )}
        </div>

        {/* Chat Main */}
        <div className="md:col-span-3">
          {!activeChat ? (
            <Card className="h-[70vh] flex items-center justify-center">
              <CardContent className="text-center text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h2 className="text-xl font-medium mb-2">No chat selected</h2>
                <p>Select an existing chat or start a new one</p>
              </CardContent>
            </Card>
          ) : (
            <Card className="h-[70vh] flex flex-col">
              <CardHeader className="flex-shrink-0 border-b">
                {editingTitle ? (
                  <div className="flex items-center gap-2">
                    <Input
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      className="flex-grow"
                      placeholder="Chat title"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleUpdateTitle();
                        }
                      }}
                    />
                    <Button size="sm" onClick={handleUpdateTitle}>Save</Button>
                    <Button size="sm" variant="outline" onClick={() => {
                      setEditingTitle(false);
                      setNewTitle(activeChat.title);
                    }}>Cancel</Button>
                  </div>
                ) : (
                  <div className="flex justify-between items-center">
                    <CardTitle className="line-clamp-1">{activeChat.title}</CardTitle>
                    <div className="space-x-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setEditingTitle(true)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => archiveChatMutation.mutate(activeChat.id)}
                        disabled={archiveChatMutation.isPending}
                      >
                        {archiveChatMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Archive className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </CardHeader>

              <CardContent className="flex-grow overflow-y-auto p-4 space-y-4">
                {isLoadingMessages ? (
                  <div className="flex justify-center py-4">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : messagesError ? (
                  <Card className="bg-destructive/10 p-4">
                    <p className="text-sm text-destructive">Failed to load messages</p>
                  </Card>
                ) : messages.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>Start the conversation by sending a message</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex gap-2 ${
                          message.role === 'user' ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <div
                          className={`rounded-lg px-4 py-2 max-w-[80%] ${
                            message.role === 'user'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted text-foreground'
                          }`}
                        >
                          {renderMessageContent(message)}

                          {/* Sources section */}
                          {message.role === 'assistant' && message.metadata?.sourceCount > 0 && (
                            <div className="mt-2 pt-2 border-t border-primary/20 text-xs">
                              <div className="flex items-center text-primary-foreground/70">
                                <ExternalLink className="h-3 w-3 mr-1" />
                                <span>Sources: {message.metadata.sourceCount}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>

              <CardFooter className="border-t p-4">
                <div className="w-full">
                  {hasWorkspaceItems() && (
                    <div className="flex items-center mb-2 text-xs text-muted-foreground">
                      <Briefcase className="h-3 w-3 mr-1" />
                      <span>
                        {workspaceItemCount} {workspaceItemCount === 1 ? 'item' : 'items'} from your workspace will be included
                      </span>
                    </div>
                  )}
                  <form onSubmit={handleSendMessage} className="flex w-full gap-2">
                    <Input
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-grow"
                      disabled={sendMessageMutation.isPending}
                    />
                    <Button
                      type="submit"
                      disabled={!userInput.trim() || sendMessageMutation.isPending}
                    >
                      {sendMessageMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </form>
                </div>
              </CardFooter>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}