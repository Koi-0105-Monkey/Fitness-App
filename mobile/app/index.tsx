import { Redirect } from 'expo-router';

export default function Index() {
  // NOTE: Fake redirect thẳng vào app để test UI cho nhanh, bỏ qua Login
  return <Redirect href="/(tabs)" />;
}