import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";

import SaisieScreen from "./screens/SaisieScreen";
import CalendrierScreen from "./screens/CalendrierScreen";
import SyntheseScreen from "./screens/SyntheseScreen";
import ParametresScreen from "./screens/ParametresScreen";
import DetailScreen from "./screens/DetailScreen";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function TabNavigator() {
  return (
    <Tab.Navigator
      initialRouteName="Saisie"
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === "Saisie")
            iconName = focused ? "time" : "time-outline";
          else if (route.name === "Calendrier")
            iconName = focused ? "calendar" : "calendar-outline";
          else if (route.name === "Synthèse")
            iconName = focused ? "stats-chart" : "stats-chart-outline";
          else if (route.name === "Paramètres")
            iconName = focused ? "settings" : "settings-outline";
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#007aff",
        tabBarInactiveTintColor: "#8e8e93",
        headerShown: true,
      })}
    >
      <Tab.Screen
        name="Saisie"
        component={SaisieScreen}
        options={{ title: "Aujourd'hui" }}
      />
      <Tab.Screen name="Calendrier" component={CalendrierScreen} />
      <Tab.Screen name="Synthèse" component={SyntheseScreen} />
      <Tab.Screen name="Paramètres" component={ParametresScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="MainTabs"
          component={TabNavigator}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Detail"
          component={DetailScreen}
          options={{ title: "Détail de la journée", presentation: "card" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
