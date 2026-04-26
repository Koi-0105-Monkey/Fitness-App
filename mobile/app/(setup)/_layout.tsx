import { Stack } from 'expo-router';
import { COLORS } from '../../constants/colors';

export default function SetupLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: COLORS.background },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="welcome" />
      <Stack.Screen name="gender" />
      <Stack.Screen name="age" />
      <Stack.Screen name="weight" />
      <Stack.Screen name="height" />
      <Stack.Screen name="goal" />
      <Stack.Screen name="activity" />
    </Stack>
  );
}
