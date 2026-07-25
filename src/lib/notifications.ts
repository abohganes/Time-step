import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import i18n from '@/lib/i18n';
import type { Habit, Task } from '@/types/database';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const storageKey = (kind: 'task' | 'habit', id: string) => `notif:${kind}:${id}`;

export async function ensureAndroidChannel() {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync('default', {
    name: 'Default',
    importance: Notifications.AndroidImportance.DEFAULT,
  });
}

async function ensurePermission(): Promise<boolean> {
  const current = await Notifications.getPermissionsAsync();
  if (current.status === 'granted') return true;
  if (!current.canAskAgain) return false;
  const requested = await Notifications.requestPermissionsAsync();
  return requested.status === 'granted';
}

async function cancelStored(kind: 'task' | 'habit', id: string) {
  const key = storageKey(kind, id);
  const existingId = await AsyncStorage.getItem(key);
  if (existingId) {
    await Notifications.cancelScheduledNotificationAsync(existingId);
    await AsyncStorage.removeItem(key);
  }
}

export async function scheduleTaskNotification(task: Task) {
  await cancelStored('task', task.id);

  if (task.is_completed || !task.due_date) return;
  const dueDate = new Date(task.due_date);
  if (dueDate.getTime() <= Date.now()) return;

  const granted = await ensurePermission();
  if (!granted) return;

  const identifier = await Notifications.scheduleNotificationAsync({
    content: { title: i18n.t('notif.taskDueTitle'), body: task.title },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: dueDate },
  });
  await AsyncStorage.setItem(storageKey('task', task.id), identifier);
}

export async function cancelTaskNotification(taskId: string) {
  await cancelStored('task', taskId);
}

export async function scheduleHabitReminder(habit: Habit) {
  await cancelStored('habit', habit.id);

  if (!habit.is_active || !habit.reminder_time) return;

  const [hourStr, minuteStr] = habit.reminder_time.split(':');
  const hour = Number(hourStr);
  const minute = Number(minuteStr);
  if (Number.isNaN(hour) || Number.isNaN(minute)) return;

  const granted = await ensurePermission();
  if (!granted) return;

  const identifier = await Notifications.scheduleNotificationAsync({
    content: { title: i18n.t('notif.habitReminderTitle'), body: habit.title },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour, minute },
  });
  await AsyncStorage.setItem(storageKey('habit', habit.id), identifier);
}

export async function cancelHabitReminder(habitId: string) {
  await cancelStored('habit', habitId);
}
