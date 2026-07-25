import * as Notifications from 'expo-notifications';
import { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/Button';
import { BottomTabInset, Spacing } from '@/constants/theme';
import { useAuth } from '@/lib/auth/AuthProvider';
import { supabase } from '@/lib/supabase';

export default function SettingsScreen() {
  const { session } = useAuth();
  const [notifStatus, setNotifStatus] = useState<Notifications.PermissionStatus | null>(null);

  useEffect(() => {
    Notifications.getPermissionsAsync().then((res) => setNotifStatus(res.status));
  }, []);

  async function requestNotifPermission() {
    const res = await Notifications.requestPermissionsAsync();
    setNotifStatus(res.status);
  }

  return (
    <ThemedView style={styles.flex}>
      <SafeAreaView style={styles.flex}>
        <ThemedView style={styles.container}>
          <ThemedText type="title" style={styles.title}>
            Settings
          </ThemedText>

          <ThemedView type="backgroundElement" style={styles.card}>
            <ThemedText type="small" themeColor="textSecondary">
              Signed in as
            </ThemedText>
            <ThemedText type="default">{session?.user.email}</ThemedText>
          </ThemedView>

          <ThemedView type="backgroundElement" style={styles.card}>
            <ThemedText type="small" themeColor="textSecondary">
              Notifications
            </ThemedText>
            <ThemedText type="default">
              {notifStatus === 'granted' ? 'Enabled' : notifStatus === 'denied' ? 'Denied' : 'Not requested'}
            </ThemedText>
            {notifStatus !== 'granted' ? (
              <Button title="Enable notifications" variant="secondary" onPress={requestNotifPermission} />
            ) : null}
          </ThemedView>

          <Button title="Sign out" variant="danger" onPress={() => supabase.auth.signOut()} />
        </ThemedView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.five,
    paddingBottom: BottomTabInset,
    gap: Spacing.four,
  },
  title: { fontSize: 32, lineHeight: 38 },
  card: { padding: Spacing.three, borderRadius: Spacing.three, gap: Spacing.two },
});
