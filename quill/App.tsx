import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StyleSheet } from "react-native";

import {
  HomeScreen,
  EditorScreen,
  PaywallScreen,
  CheckoutScreen,
  SuccessScreen,
} from "./src/screens";
import type { RootStackParamList } from "./src/types/navigation";
import { colors } from "./src/theme";

// ---------------------------------------------------------------------------
// Deep link config
// Tells React Navigation how to map incoming URLs to screens.
// The scheme "quill" must match what is registered in app.json.
//
// When Creem redirects after payment to:
//   quill://payment/success?checkout_id=ch_xxx&order_id=...&signature=abc
// NavigationContainer picks it up and routes to the Success screen.
// The query params are forwarded as route.params automatically.
// ---------------------------------------------------------------------------
const linking = {
  prefixes: ["quill://"],
  config: {
    screens: {
      Home: "",
      Editor: "editor/:documentId",
      Paywall: "paywall",
      Checkout: "checkout",
      // This is the URL Creem redirects to after a successful payment
      Success: "payment/success",
    },
  },
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <NavigationContainer linking={linking}>
          <Stack.Navigator
            initialRouteName="Home"
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: colors.bgDark },
              animation: "slide_from_right",
            }}
          >
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Editor" component={EditorScreen} />
            <Stack.Screen
              name="Paywall"
              component={PaywallScreen}
              options={{ animation: "slide_from_bottom" }}
            />
            <Stack.Screen
              name="Checkout"
              component={CheckoutScreen}
              options={{ animation: "slide_from_bottom" }}
            />
            <Stack.Screen
              name="Success"
              component={SuccessScreen}
              options={{
                animation: "fade",
                // Prevent going back to the checkout WebView after payment
                gestureEnabled: false,
              }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
