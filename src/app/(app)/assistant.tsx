import { Ionicons } from '@expo/vector-icons';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Radius, Spacing } from '@/constants/theme';
import { useChatMessages, useClearChat, useSendChatMessage } from '@/hooks/useAssistant';
import { useTheme } from '@/hooks/use-theme';
import type { ChatMessage } from '@/lib/api/assistant';

export default function AssistantScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const { data: messages, isLoading } = useChatMessages();
  const sendMessage = useSendChatMessage();
  const clearChat = useClearChat();
  const [input, setInput] = useState('');
  const [pendingUserText, setPendingUserText] = useState<string | null>(null);
  const listRef = useRef<FlatList>(null);

  const quickActions = t('assistant.quickActions', { returnObjects: true }) as Record<string, string>;

  function handleSend(text: string) {
    const trimmed = text.trim();
    if (!trimmed || sendMessage.isPending) return;
    setInput('');
    setPendingUserText(trimmed);
    sendMessage.mutate(trimmed, {
      onSettled: () => setPendingUserText(null),
    });
  }

  type DisplayItem = ChatMessage | { id: string; role: 'user'; content: string };
  const displayItems: DisplayItem[] = [
    ...(messages ?? []),
    ...(pendingUserText ? [{ id: 'pending', role: 'user' as const, content: pendingUserText }] : []),
  ];

  return (
    <ThemedView style={styles.flex}>
      <SafeAreaView style={styles.flex} edges={['top']}>
        <ThemedView style={styles.header}>
          <ThemedText type="title" style={styles.title}>
            {t('assistant.title')}
          </ThemedText>
          {messages && messages.length > 0 ? (
            <Pressable onPress={() => clearChat.mutate()} hitSlop={8}>
              <Ionicons name="trash-outline" size={22} color={theme.textSecondary} />
            </Pressable>
          ) : null}
        </ThemedView>

        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={90}>
          {isLoading ? (
            <ActivityIndicator style={styles.flex} />
          ) : displayItems.length === 0 ? (
            <View style={styles.emptyContainer}>
              <ThemedText type="default" themeColor="textSecondary" style={styles.emptyText}>
                {t('assistant.empty')}
              </ThemedText>
              <View style={styles.chipsWrap}>
                {Object.values(quickActions).map((prompt) => (
                  <Pressable
                    key={prompt}
                    onPress={() => handleSend(prompt)}
                    style={[styles.chip, { backgroundColor: theme.backgroundElement }]}>
                    <ThemedText type="small">{prompt}</ThemedText>
                  </Pressable>
                ))}
              </View>
            </View>
          ) : (
            <FlatList
              ref={listRef}
              data={displayItems}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.list}
              onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
              renderItem={({ item }) => (
                <View
                  style={[
                    styles.bubble,
                    item.role === 'user'
                      ? [styles.bubbleUser, { backgroundColor: theme.accent }]
                      : [styles.bubbleAssistant, { backgroundColor: theme.backgroundElement }],
                  ]}>
                  <ThemedText
                    type="default"
                    style={item.role === 'user' ? styles.bubbleUserText : undefined}>
                    {item.content}
                  </ThemedText>
                </View>
              )}
            />
          )}

          {sendMessage.isPending ? <ActivityIndicator style={styles.typingIndicator} /> : null}
          {sendMessage.isError ? (
            <ThemedText type="small" style={[styles.errorText, { color: theme.danger }]}>
              {t('assistant.sendError')}
            </ThemedText>
          ) : null}

          <View style={[styles.inputRow, { borderTopColor: theme.backgroundElement }]}>
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder={t('assistant.placeholder')}
              placeholderTextColor={theme.textSecondary}
              style={[styles.inputField, { backgroundColor: theme.backgroundElement, color: theme.text }]}
              multiline
              onSubmitEditing={() => handleSend(input)}
            />
            <Pressable
              onPress={() => handleSend(input)}
              disabled={!input.trim() || sendMessage.isPending}
              hitSlop={8}
              style={{ opacity: !input.trim() || sendMessage.isPending ? 0.4 : 1 }}>
              <Ionicons name="send" size={24} color={theme.accent} />
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.two,
  },
  title: { fontSize: 32, lineHeight: 38 },
  emptyContainer: { flex: 1, justifyContent: 'center', paddingHorizontal: Spacing.four, gap: Spacing.four },
  emptyText: { textAlign: 'center' },
  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two, justifyContent: 'center' },
  chip: { paddingVertical: Spacing.two, paddingHorizontal: Spacing.three, borderRadius: Spacing.five },
  list: { paddingHorizontal: Spacing.four, paddingVertical: Spacing.three, gap: Spacing.two },
  bubble: { maxWidth: '85%', padding: Spacing.three, borderRadius: Radius.large },
  bubbleUser: { alignSelf: 'flex-end' },
  bubbleAssistant: { alignSelf: 'flex-start' },
  bubbleUserText: { color: '#ffffff' },
  typingIndicator: { paddingVertical: Spacing.two },
  errorText: { textAlign: 'center', paddingBottom: Spacing.one },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  inputField: {
    flex: 1,
    borderRadius: Spacing.five,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    maxHeight: 100,
    fontSize: 16,
  },
});
