import React, { createContext, useState, useContext, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';

// Import Screens
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import HomeScreen from './src/screens/HomeScreen';
import CitasScreen from './src/screens/CitasScreen';
import RecetasScreen from './src/screens/RecetasScreen';
import EducacionScreen from './src/screens/EducacionScreen';
import ProfileScreen from './src/screens/ProfileScreen';

// Auth Context
export const AuthContext = createContext(null);

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// ─── Auth Stack for Login / Register ─────────────────────────────────────────
function AuthStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

// ─── App Tabs for Main Application ───────────────────────────────────────────
function AppTabs() {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Inicio') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Citas') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'Recetas') {
            iconName = focused ? 'document-text' : 'document-text-outline';
          } else if (route.name === 'Educación') {
            iconName = focused ? 'book' : 'book-outline';
          } else if (route.name === 'Perfil') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#FF69B4',
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.tabBar,
          borderTopWidth: 1,
          borderTopColor: colors.tabBorder,
          paddingBottom: 8,
          paddingTop: 8,
          height: 64,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.05,
          shadowRadius: 10,
          elevation: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
        },
        headerShown: true,
        headerStyle: {
          backgroundColor: colors.header,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: colors.headerBorder,
        },
        headerTitleStyle: {
          color: '#FF69B4',
          fontWeight: 'bold',
          fontSize: 18,
        },
        headerTintColor: '#FF69B4',
      })}
    >
      <Tab.Screen
        name="Inicio"
        component={HomeScreen}
        options={{ title: 'GyneObs' }}
      />
      <Tab.Screen
        name="Citas"
        component={CitasScreen}
        options={{ title: 'Mis Citas' }}
      />
      <Tab.Screen
        name="Recetas"
        component={RecetasScreen}
        options={{ title: 'Recetas' }}
      />
      <Tab.Screen
        name="Educación"
        component={EducacionScreen}
        options={{ title: 'Blog de Salud' }}
      />
      <Tab.Screen
        name="Perfil"
        component={ProfileScreen}
        options={{ title: 'Mi Perfil' }}
      />
    </Tab.Navigator>
  );
}

// ─── AppContent: holds auth state + navigation ────────────────────────────────
function AppContent() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { colors, isDark } = useTheme();

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const userData = await AsyncStorage.getItem('user');

        if (token && userData) {
          setUser(JSON.parse(userData));
        }
      } catch (error) {
        console.error('Error restoring session:', error);
      } finally {
        setLoading(false);
      }
    };

    checkLoginStatus();
  }, []);

  const login = async (userData, token) => {
    try {
      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
    } catch (error) {
      console.error('Error saving session:', error);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      setUser(null);
    } catch (error) {
      console.error('Error removing session:', error);
    }
  };

  const updateUser = async (updatedUser) => {
    try {
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
    } catch (error) {
      console.error('Error updating user session:', error);
    }
  };

  // Build navigation theme from React Navigation base themes
  const navTheme = isDark
    ? {
        ...DarkTheme,
        colors: {
          ...DarkTheme.colors,
          background: colors.background,
          card: colors.header,
          text: colors.text,
          border: colors.headerBorder,
        },
      }
    : {
        ...DefaultTheme,
        colors: {
          ...DefaultTheme.colors,
          background: colors.background,
          card: colors.header,
          text: colors.text,
          border: colors.headerBorder,
        },
      };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color="#FF69B4" />
      </View>
    );
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser }}>
      <NavigationContainer theme={navTheme}>
        {user ? <AppTabs /> : <AuthStack />}
      </NavigationContainer>
      <StatusBar style={isDark ? 'light' : 'dark'} />
    </AuthContext.Provider>
  );
}

// ─── Root: wraps everything in ThemeProvider ─────────────────────────────────
export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});