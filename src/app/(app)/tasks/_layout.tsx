import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';

export default function TasksLayout() {
  const { t } = useTranslation();

  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: t('tasks.title') }} />
      <Stack.Screen name="new" options={{ title: t('tasks.newTitle'), presentation: 'modal' }} />
      <Stack.Screen name="[id]" options={{ title: t('tasks.editTitle'), presentation: 'modal' }} />
    </Stack>
  );
}
