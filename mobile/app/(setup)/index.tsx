import { Redirect } from 'expo-router';

// Setup now starts at welcome/intro screen
export default function SetupIndex() {
  return <Redirect href="/(setup)/welcome" />;
}
