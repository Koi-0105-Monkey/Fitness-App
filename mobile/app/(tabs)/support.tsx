import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { useAuthStore } from '../../store/authStore';
import socketService from '../../utils/socket';
import { chatService, Message } from '../../services/chat.service';

export default function SupportScreen() {
  const { user } = useAuthStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [conversationId, setConversationId] = useState<string>('new_chat');
  const [loading, setLoading] = useState(true);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (!user?._id) return;

    const socket = socketService.connect();

    // 1. Lấy hoặc tạo hội thoại
    (async () => {
      try {
        const conv = await chatService.initConversation(user._id);
        if (conv) {
          setConversationId(conv._id);
          // 2. Lấy tin nhắn cũ
          const history = await chatService.getMessages(conv._id);
          setMessages(history);
          socket.emit('join_room', conv._id);
        }
      } catch (error) {
        console.error('Init Chat Error:', error);
      } finally {
        setLoading(false);
      }
    })();

    // 3. Lắng nghe tin nhắn mới
    socket.on('receive_message', (newMessage: Message) => {
      setMessages((prev) => {
        // Tránh trùng lặp nếu chính mình gửi
        if (prev.find(m => m._id === newMessage._id)) return prev;
        return [...prev, newMessage];
      });
      
      if (newMessage.conversationId && conversationId === 'new_chat') {
        setConversationId(newMessage.conversationId);
      }
    });

    return () => {
      socket.off('receive_message');
    };
  }, [user?._id]);

  useEffect(() => {
    // Tự động cuộn xuống khi có tin nhắn mới
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  const handleSendMessage = () => {
    if (!input.trim() || !user?._id) return;

    const messageData = {
      conversationId: conversationId,
      senderId: user._id,
      message: input.trim(),
    };

    socketService.emit('send_message', messageData);
    setInput('');
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator color={COLORS.purple} size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color={COLORS.yellow} />
          </TouchableOpacity>
          <View style={styles.avatarContainer}>
            <View style={styles.avatarWrapper}>
              <Ionicons name="headset" size={30} color="white" />
            </View>
          </View>
          <View style={styles.headerText}>
            <Text style={styles.assistantTitle}>Assistant</Text>
            <Text style={styles.assistantStatus}>I'm Here To Assist You</Text>
          </View>
        </View>

        {/* Chat Area */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.chatArea}
          contentContainerStyle={{ padding: 20 }}
          showsVerticalScrollIndicator={false}
        >
          {messages.map((item) => {
            const isMe = item.senderId === user?._id;
            return (
              <View
                key={item._id || Math.random().toString()}
                style={[styles.messageWrapper, isMe ? styles.myMessageWrapper : styles.botMessageWrapper]}
              >
                <View style={[styles.messageBubble, isMe ? styles.myBubble : styles.botBubble]}>
                  <Text style={[styles.messageText, isMe ? styles.myMessageText : styles.botMessageText]}>
                    {item.message}
                  </Text>
                </View>
                <Text style={styles.timestamp}>{formatTime(item.createdAt)}</Text>
              </View>
            );
          })}
        </ScrollView>

        {/* Input Area */}
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TouchableOpacity style={styles.attachButton}>
              <Ionicons name="attach" size={24} color="white" />
            </TouchableOpacity>
            <TextInput
              style={styles.input}
              placeholder="Write Here..."
              placeholderTextColor="#999"
              value={input}
              onChangeText={setInput}
              multiline
            />
            <View style={styles.inputActions}>
              <TouchableOpacity style={styles.actionIcon}>
                <Ionicons name="mic" size={20} color="white" />
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.sendButton, !input.trim() && { opacity: 0.5 }]}
                onPress={handleSendMessage}
                disabled={!input.trim()}
              >
                <Ionicons name="send" size={20} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1A1A1A' },
  center: { justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 0,
  },
  backButton: { marginRight: 15 },
  avatarContainer: { marginRight: 12 },
  avatarWrapper: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#896CFE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: { flex: 1 },
  assistantTitle: {
    color: '#896CFE',
    fontSize: 22,
    fontFamily: 'Poppins',
    fontWeight: '700',
  },
  assistantStatus: {
    color: '#CCC',
    fontSize: 13,
    fontFamily: 'League Spartan',
  },
  chatArea: { flex: 1 },
  messageWrapper: { marginBottom: 20, maxWidth: '80%' },
  myMessageWrapper: { alignSelf: 'flex-end', alignItems: 'flex-end' },
  botMessageWrapper: { alignSelf: 'flex-start', alignItems: 'flex-start' },
  messageBubble: {
    padding: 15,
    borderRadius: 20,
    minWidth: 60,
  },
  myBubble: {
    backgroundColor: '#B2A2FF',
    borderBottomRightRadius: 5,
  },
  botBubble: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 5,
  },
  messageText: {
    fontSize: 15,
    fontFamily: 'League Spartan',
    lineHeight: 20,
  },
  myMessageText: { color: '#1A1A1A' },
  botMessageText: { color: '#333' },
  timestamp: {
    color: '#777',
    fontSize: 11,
    marginTop: 5,
    fontFamily: 'League Spartan',
  },
  inputContainer: {
    padding: 15,
    paddingBottom: Platform.OS === 'ios' ? 10 : 25,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D7FE63',
    borderRadius: 30,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  attachButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1A1A1A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    color: '#1A1A1A',
    fontSize: 15,
    fontFamily: 'League Spartan',
    paddingHorizontal: 12,
    maxHeight: 100,
  },
  inputActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  actionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1A1A1A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1A1A1A',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
