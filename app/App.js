import React, { useEffect } from "react";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Ionicons from "@expo/vector-icons/Ionicons";
import { enableScreens } from "react-native-screens";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { MonitoringScreen } from "./src/screens/MonitoringScreen.js";
import { ControlScreen } from "./src/screens/ControlScreen.js";
import { LoginScreen } from "./src/screens/LoginScreen.js";
import { ProfileScreen } from "./src/screens/ProfileScreen.js";
import { assertConfig } from "./src/services/config.js";
import { AuthProvider, useAuth } from "./src/contexts/AuthContext.js";
import * as SplashScreen from "expo-splash-screen";
import { View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();
const MonitoringStack = createNativeStackNavigator(); // Stack baru untuk Monitoring Flow

enableScreens(true);

SplashScreen.preventAutoHideAsync();

// --- NEW STACK FOR MONITORING ---
const MonitoringFlow = () => (
  <MonitoringStack.Navigator
    screenOptions={{
      headerShown: false, // Sembunyikan header Stack agar tidak bertabrahan dengan header Tab
      gestureEnabled: true, // Gesture diaktifkan di level Stack ini
    }}
  >
    <MonitoringStack.Screen name="MonitorHome" component={MonitoringScreen} />
    {/* Menggunakan ProfileScreen sebagai halaman detail untuk menguji swipe back */}
    <MonitoringStack.Screen
      name="Detail"
      component={ProfileScreen}
      options={{ title: "Detail Reading" }}
    />
  </MonitoringStack.Navigator>
);
// --- END NEW STACK ---

const AppTabNavigator = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Tab.Navigator
      initialRouteName="Monitoring"
      screenOptions={({ route }) => ({
        headerShown: true,
        headerTitle: "IOTWatch",
        headerTitleAlign: "center",
        headerTintColor: "#1f2937",
        headerStyle: { backgroundColor: "#f8f9fb" },
        headerTitleStyle: { fontWeight: "600", fontSize: 18 },
        tabBarActiveTintColor: "#2563eb",
        tabBarInactiveTintColor: "#94a3b8",
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === "Monitoring") {
            iconName = "analytics";
          } else if (route.name === "Control") {
            iconName = "options";
          } else if (route.name === "Profile") {
            iconName = "person-circle-outline";
          } else if (route.name === "Login") {
            iconName = "log-in-outline";
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      {/* Menggunakan MonitoringFlow sebagai Tab Screen */}
      <Tab.Screen name="Monitoring" component={MonitoringFlow} />

      {isAuthenticated ? (
        <>
          <Tab.Screen name="Control" component={ControlScreen} />
          <Tab.Screen name="Profile" component={ProfileScreen} />
        </>
      ) : (
        <Tab.Screen
          name="Login"
          component={LoginScreen}
          options={{
            tabBarLabel: "Login",
            title: "Login",
          }}
        />
      )}
    </Tab.Navigator>
  );
};

const RootStack = () => {
  const { loading } = useAuth();

  if (loading) {
    return <View style={{ flex: 1, backgroundColor: "#000000" }} />;
  }

  SplashScreen.hideAsync();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
      }}
    >
      <Stack.Screen name="Tabs" component={AppTabNavigator} />
    </Stack.Navigator>
  );
};

export default function App() {
  useEffect(() => {
    assertConfig();
  }, []);

  const theme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: "#f8f9fb",
    },
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <NavigationContainer theme={theme}>
            <RootStack />
          </NavigationContainer>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
