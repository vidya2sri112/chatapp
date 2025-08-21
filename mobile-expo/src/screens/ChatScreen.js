import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TextInput, Button, FlatList, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { fetchMessages, markRead } from '../services/api';
import { getSocket } from '../services/socket';
import { colors, spacing, typography, radius } from '../theme/theme';

export default function ChatScreen({ route }) {
  const { user } = route.params;
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [typing, setTyping] = useState(false);
  const typingTimeout = useRef(null);

  useEffect(() => {
    (async () => {
      const history = await fetchMessages(user.id);
      setMessages(history);
      const socket = getSocket();
      if (!socket) return;

      socket.on('message:new', (data) => {
        if (data.sender._id === user.id) {
          setMessages((prev) => [...prev, data]);
          if (data.id) {
            socket.emit('message:read', { messageId: data.id, senderId: data.sender._id });
          }
        }
      });

      socket.on('typing:start', (data) => {
        if (data.userId === user.id) setTyping(true);
      });

      socket.on('typing:stop', (data) => {
        if (data.userId === user.id) setTyping(false);
      });
    })();
  }, [user.id]);

  const onSend = () => {
    const socket = getSocket();
    if (!text.trim() || !socket) return;
    socket.emit('message:send', { receiverId: user.id, text });
    setText('');
    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    socket.emit('typing:stop', { receiverId: user.id });
  };

  const onTyping = () => {
    const socket = getSocket();
    if (!socket) return;
    socket.emit('typing:start', { receiverId: user.id });
    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => socket.emit('typing:stop', { receiverId: user.id }), 2000);
  };

  const renderItem = ({ item }) => {
    const isOwn = item?.sender?._id && (item.sender._id !== user.id);
    const statusTick = isOwn ? (item.status === 'read' ? '✓✓' : item.status === 'delivered' ? '✓✓' : '✓') : '';
    return (
      <View style={[styles.row, { justifyContent: isOwn ? 'flex-end' : 'flex-start' }]}>
        <View style={[styles.bubble, isOwn ? styles.bubbleOwn : styles.bubbleOther]}>
          <Text style={[styles.messageText, isOwn ? styles.messageTextOwn : styles.messageTextOther]}>
            {item.text}
          </Text>
          <View style={styles.metaRow}>
            <Text style={styles.time}>{new Date(item.timestamp).toLocaleTimeString()}</Text>
            {isOwn ? <Text style={[styles.tick, item.status === 'read' ? styles.tickRead : null]}>{statusTick}</Text> : null}
          </View>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.screen}>
      <View style={styles.container}>
        {typing ? <Text style={styles.typing}>{user.username} is typing...</Text> : null}
        <FlatList
          contentContainerStyle={{ padding: spacing(2) }}
          data={messages}
          keyExtractor={(item, idx) => String(item._id || item.id || idx)}
          renderItem={renderItem}
        />
        <View style={styles.inputRow}>
          <TextInput
            value={text}
            onChangeText={(v) => { setText(v); onTyping(); }}
            placeholder="Type a message"
            placeholderTextColor={colors.textSecondary}
            style={styles.input}
            onSubmitEditing={onSend}
          />
          <Button title="Send" color={colors.primary} onPress={onSend} />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  typing: {
    color: colors.textSecondary,
    fontStyle: 'italic',
    paddingHorizontal: spacing(2),
    paddingTop: spacing(1),
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingVertical: spacing(0.5),
    paddingHorizontal: spacing(2),
  },
  bubble: {
    maxWidth: '80%',
    borderRadius: radius.lg,
    paddingHorizontal: spacing(1.25),
    paddingVertical: spacing(1),
  },
  bubbleOwn: {
    backgroundColor: colors.primary,
  },
  bubbleOther: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  messageText: {
    fontSize: typography.body,
    marginBottom: spacing(0.5),
  },
  messageTextOwn: {
    color: colors.primaryText,
  },
  messageTextOther: {
    color: colors.textPrimary,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  time: {
    fontSize: typography.small,
    color: colors.textSecondary,
  },
  tick: {
    fontSize: typography.small,
    color: colors.textSecondary,
  },
  tickRead: {
    color: colors.accent,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: spacing(1.5),
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing(1.5),
    paddingVertical: spacing(1),
    marginRight: spacing(1),
    color: colors.textPrimary,
    backgroundColor: colors.surface,
  },
});
