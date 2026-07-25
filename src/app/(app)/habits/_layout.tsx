import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';

export default function HabitsLayout() {
  const { t } = useTranslation();

  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: t('habits.title') }} />
      <Stack.Screen name="new" options={{ title: t('habits.newTitle'), presentation: 'modal' }} />
      <Stack.Screen name="[id]" options={{ title: t('habits.editTitle'), presentation: 'modal' }} />
    </Stack>
  );
}
