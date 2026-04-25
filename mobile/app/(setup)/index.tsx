import { Redirect } from 'expo-router';

// Setup always starts at gender selection
export default function SetupIndex() {
  return <Redirect href="/(setup)/gender" />;
}
