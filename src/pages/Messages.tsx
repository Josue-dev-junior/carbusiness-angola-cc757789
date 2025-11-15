import { useState, useEffect } from "react";
import { Navigate, useSearchParams } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Send } from "lucide-react";

interface Conversation {
  car_id: string;
  other_user_id: string;
  other_user_name: string;
  car_title: string;
  last_message: string;
  last_message_time: string;
}

interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
  sender_name: string;
}

const Messages = () => {
  const { user, loading: authLoading } = useAuth();
  const [searchParams] = useSearchParams();
  const carId = searchParams.get("car");
  
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (user) {
      fetchConversations();
    }
  }, [user]);

  useEffect(() => {
    if (carId && user) {
      initializeConversation(carId);
    }
  }, [carId, user]);

  useEffect(() => {
    if (selectedConversation && user) {
      fetchMessages(selectedConversation);
      
      const channel = supabase
        .channel('messages-changes')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `car_id=eq.${selectedConversation}`,
          },
          (payload) => {
            fetchMessages(selectedConversation);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [selectedConversation, user]);

  const initializeConversation = async (carId: string) => {
    const { data: carData } = await supabase
      .from("cars")
      .select("id, user_id, title")
      .eq("id", carId)
      .single();

    if (carData && carData.user_id !== user?.id) {
      setSelectedConversation(carId);
    }
  };

  const fetchConversations = async () => {
    try {
      const { data: messagesData, error } = await supabase
        .from("messages")
        .select(`
          car_id,
          sender_id,
          receiver_id,
          content,
          created_at,
          cars (title, user_id),
          sender:profiles!messages_sender_id_fkey (name),
          receiver:profiles!messages_receiver_id_fkey (name)
        `)
        .or(`sender_id.eq.${user?.id},receiver_id.eq.${user?.id}`)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const conversationsMap = new Map<string, Conversation>();
      
      messagesData?.forEach((msg: any) => {
        const isReceiver = msg.receiver_id === user?.id;
        const otherUserId = isReceiver ? msg.sender_id : msg.receiver_id;
        const otherUserName = isReceiver ? msg.sender.name : msg.receiver.name;
        
        if (!conversationsMap.has(msg.car_id)) {
          conversationsMap.set(msg.car_id, {
            car_id: msg.car_id,
            other_user_id: otherUserId,
            other_user_name: otherUserName,
            car_title: msg.cars.title,
            last_message: msg.content,
            last_message_time: msg.created_at,
          });
        }
      });

      setConversations(Array.from(conversationsMap.values()));
    } catch (error) {
      console.error("Error fetching conversations:", error);
      toast.error("Erro ao carregar conversas");
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (carId: string) => {
    try {
      const { data, error } = await supabase
        .from("messages")
        .select(`
          id,
          content,
          sender_id,
          created_at,
          sender:profiles!messages_sender_id_fkey (name)
        `)
        .eq("car_id", carId)
        .order("created_at", { ascending: true });

      if (error) throw error;

      setMessages(data.map((msg: any) => ({
        id: msg.id,
        content: msg.content,
        sender_id: msg.sender_id,
        created_at: msg.created_at,
        sender_name: msg.sender.name,
      })));

      // Mark messages as read
      await supabase
        .from("messages")
        .update({ read: true })
        .eq("car_id", carId)
        .eq("receiver_id", user?.id)
        .eq("read", false);

    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !user) return;

    setSending(true);
    try {
      const { data: carData } = await supabase
        .from("cars")
        .select("user_id")
        .eq("id", selectedConversation)
        .single();

      if (!carData) throw new Error("Carro não encontrado");

      const receiverId = carData.user_id === user.id 
        ? conversations.find(c => c.car_id === selectedConversation)?.other_user_id
        : carData.user_id;

      const { error } = await supabase
        .from("messages")
        .insert({
          car_id: selectedConversation,
          sender_id: user.id,
          receiver_id: receiverId,
          content: newMessage.trim(),
        });

      if (error) throw error;

      setNewMessage("");
      fetchMessages(selectedConversation);
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Erro ao enviar mensagem");
    } finally {
      setSending(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="flex-1 bg-background py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          <h1 className="text-3xl font-bold mb-6">Mensagens</h1>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[600px]">
            {/* Conversations List */}
            <Card className="md:col-span-1 overflow-hidden">
              <CardHeader>
                <CardTitle>Conversas</CardTitle>
              </CardHeader>
              <CardContent className="p-0 overflow-y-auto h-[calc(600px-80px)]">
                {loading ? (
                  <div className="flex justify-center p-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : conversations.length === 0 ? (
                  <p className="text-center text-muted-foreground p-8">
                    Nenhuma conversa ainda
                  </p>
                ) : (
                  <div className="divide-y">
                    {conversations.map((conv) => (
                      <button
                        key={conv.car_id}
                        onClick={() => setSelectedConversation(conv.car_id)}
                        className={`w-full text-left p-4 hover:bg-muted/50 transition-colors ${
                          selectedConversation === conv.car_id ? "bg-muted" : ""
                        }`}
                      >
                        <p className="font-semibold truncate">{conv.car_title}</p>
                        <p className="text-sm text-muted-foreground">{conv.other_user_name}</p>
                        <p className="text-sm text-muted-foreground truncate mt-1">
                          {conv.last_message}
                        </p>
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Messages Area */}
            <Card className="md:col-span-2 flex flex-col">
              {selectedConversation ? (
                <>
                  <CardHeader>
                    <CardTitle>
                      {conversations.find(c => c.car_id === selectedConversation)?.car_title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col p-4 gap-4 overflow-hidden">
                    <div className="flex-1 overflow-y-auto space-y-4">
                      {messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex ${
                            msg.sender_id === user.id ? "justify-end" : "justify-start"
                          }`}
                        >
                          <div
                            className={`max-w-[70%] rounded-lg p-3 ${
                              msg.sender_id === user.id
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted"
                            }`}
                          >
                            <p className="text-sm font-semibold mb-1">{msg.sender_name}</p>
                            <p>{msg.content}</p>
                            <p className="text-xs opacity-70 mt-1">
                              {new Date(msg.created_at).toLocaleString("pt-AO")}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <Textarea
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Digite sua mensagem..."
                        className="resize-none"
                        rows={2}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            sendMessage();
                          }
                        }}
                      />
                      <Button
                        onClick={sendMessage}
                        disabled={!newMessage.trim() || sending}
                        size="icon"
                        className="h-auto"
                      >
                        {sending ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                          <Send className="h-5 w-5" />
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </>
              ) : (
                <CardContent className="flex-1 flex items-center justify-center">
                  <p className="text-muted-foreground">
                    Selecione uma conversa para começar
                  </p>
                </CardContent>
              )}
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Messages;
