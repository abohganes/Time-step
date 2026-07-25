import { Stack } from 'expo-router';

export default function TasksLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Tasks' }} />
      <Stack.Screen name="new" options={{ title: 'New task', presentation: 'modal' }} />
      <Stack.Screen name="[id]" options={{ title: 'Edit task', presentation: 'modal' }} />
    </Stack>
  );
}
