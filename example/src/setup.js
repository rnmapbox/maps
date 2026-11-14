import { LogBox, Platform, Settings } from 'react-native';

LogBox.ignoreLogs([
  "Deep imports from the 'react-native' package are deprecated ('react-native/Libraries/Utilities/codegenNativeComponent')",
]);

// Set by the Detox e2e tests: LogBox toasts can cover the list rows they tap
if (Platform.OS === 'ios' && Settings.get('e2eIgnoreAllLogs')) {
  LogBox.ignoreAllLogs();
}
