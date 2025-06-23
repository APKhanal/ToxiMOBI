import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Import screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import HomeScreen from '../screens/main/HomeScreen';
import AlertsScreen from '../screens/main/AlertsScreen';
import ChildrenScreen from '../screens/main/ChildrenScreen';
import SettingsScreen from '../screens/main/SettingsScreen';
import AlertDetailScreen from '../screens/details/AlertDetailScreen';
import ChildProfileScreen from '../screens/details/ChildProfileScreen';
import ChildSettingsScreen from '../screens/details/ChildSettingsScreen';
import ProfileScreen from '../screens/settings/ProfileScreen';
import LanguageScreen from '../screens/settings/LanguageScreen';
import ThemeScreen from '../screens/settings/ThemeScreen';
import NotificationsScreen from '../screens/settings/NotificationsScreen';
import AboutScreen from '../screens/settings/AboutScreen';
import AnalyticsScreen from '../screens/details/AnalyticsScreen';
import AddChildScreen from '../screens/details/AddChildScreen';
import CoParentsScreen from '../screens/details/CoParentingScreen';
import SplashScreen from '../screens/SplashScreen';

// Redux
import { selectIsLoggedIn, selectIsInitialized, setUser, clearUser, setInitialized, fetchUserProfile } from '../store/slices/authSlice';
import { selectCurrentScreen, setCurrentScreen, setCurrentTab } from '../store/slices/uiSlice';

// Theme & Icons
import { useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Create navigator instances
const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const HomeStack = createNativeStackNavigator();
const AlertsStack = createNativeStackNavigator();
const ChildrenStack = createNativeStackNavigator();
const SettingsStack = createNativeStackNavigator();

// Home Stack Navigator
const HomeStackNavigator = () => {
  const theme = useTheme();
  
  return (
    <HomeStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.headerBackground,
        },
        headerTintColor: theme.colors.text,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <HomeStack.Screen name="HomeMain" component={HomeScreen} options={{ title: 'Home' }} />
      <HomeStack.Screen name="Analytics" component={AnalyticsScreen} options={{ title: 'Analytics' }} />
      <HomeStack.Screen name="AlertDetail" component={AlertDetailScreen} options={{ title: 'Alert Details' }} />
      <HomeStack.Screen name="ChildProfile" component={ChildProfileScreen} options={{ title: 'Child Profile' }} />
    </HomeStack.Navigator>
  );
};

// Alerts Stack Navigator
const AlertsStackNavigator = () => {
  const theme = useTheme();
  
  return (
    <AlertsStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.headerBackground,
        },
        headerTintColor: theme.colors.text,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <AlertsStack.Screen name="AlertsMain" component={AlertsScreen} options={{ title: 'Alerts' }} />
      <AlertsStack.Screen name="AlertDetail" component={AlertDetailScreen} options={{ title: 'Alert Details' }} />
    </AlertsStack.Navigator>
  );
};

// Children Stack Navigator
const ChildrenStackNavigator = () => {
  const theme = useTheme();
  
  return (
    <ChildrenStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.headerBackground,
        },
        headerTintColor: theme.colors.text,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <ChildrenStack.Screen name="ChildrenMain" component={ChildrenScreen} options={{ title: 'Children' }} />
      <ChildrenStack.Screen name="AddChild" component={AddChildScreen} options={{ title: 'Add Child' }} />
      <ChildrenStack.Screen name="ChildProfile" component={ChildProfileScreen} options={{ title: 'Child Profile' }} />
      <ChildrenStack.Screen name="ChildSettings" component={ChildSettingsScreen} options={{ title: 'Child Settings' }} />
      <ChildrenStack.Screen name="CoParents" component={CoParentsScreen} options={{ title: 'Co-Parents' }} />
    </ChildrenStack.Navigator>
  );
};

// Settings Stack Navigator
const SettingsStackNavigator = () => {
  const theme = useTheme();
  
  return (
    <SettingsStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.headerBackground,
        },
        headerTintColor: theme.colors.text,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <SettingsStack.Screen name="SettingsMain" component={SettingsScreen} options={{ title: 'Settings' }} />
      <SettingsStack.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profile' }} />
      <SettingsStack.Screen name="Language" component={LanguageScreen} options={{ title: 'Language' }} />
      <SettingsStack.Screen name="Theme" component={ThemeScreen} options={{ title: 'Theme' }} />
      <SettingsStack.Screen name="Notifications" component={NotificationsScreen} options={{ title: 'Notifications' }} />
      <SettingsStack.Screen name="About" component={AboutScreen} options={{ title: 'About' }} />
    </SettingsStack.Navigator>
  );
};

// Tab Navigator (Main App)
const TabNavigator = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          
          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Alerts') {
            iconName = focused ? 'bell' : 'bell-outline';
          } else if (route.name === 'Children') {
            iconName = focused ? 'account-child' : 'account-child-outline';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'cog' : 'cog-outline';
          }
          
          return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.tabBarInactive,
        tabBarStyle: {
          backgroundColor: theme.colors.tabBar,
          borderTopColor: theme.colors.border,
        },
        headerShown: false,
      })}
      listeners={({ route }) => ({
        tabPress: () => {
          dispatch(setCurrentTab(route.name.toLowerCase()));
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeStackNavigator} />
      <Tab.Screen name="Alerts" component={AlertsStackNavigator} />
      <Tab.Screen name="Children" component={ChildrenStackNavigator} />
      <Tab.Screen name="Settings" component={SettingsStackNavigator} />
    </Tab.Navigator>
  );
};

// Auth Navigator
const AuthNavigator = () => {
  const theme = useTheme();
  
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.headerBackground,
        },
        headerTintColor: theme.colors.text,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Create Account' }} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} options={{ title: 'Reset Password' }} />
    </Stack.Navigator>
  );
};

// Root Navigator
const RootNavigator = () => {
  const isLoggedIn = useSelector(selectIsLoggedIn);
  const isInitialized = useSelector(selectIsInitialized);
  const theme = useTheme();
  const dispatch = useDispatch();
  const currentScreen = useSelector(selectCurrentScreen);
  
  // Handle auth state changes
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // User is signed in
        dispatch(setUser({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
        }));
        
        // Fetch user profile data
        dispatch(fetchUserProfile(user.uid));
      } else {
        // User is signed out
        dispatch(clearUser());
      }
      
      // Mark auth as initialized even if no user
      if (!isInitialized) {
        dispatch(setInitialized());
      }
    });
    
    return () => unsubscribe();
  }, [dispatch, isInitialized]);
  
  // Track screen changes for analytics
  const onStateChange = () => {
    // This would typically use a route name, but we're just tracking the current screen
    // for simplicity. In a real app, you'd extract the current route name here.
    if (currentScreen) {
      // This could trigger analytics tracking, etc.
      console.log(`Screen changed to: ${currentScreen}`);
    }
  };
  
  if (!isInitialized) {
    return <SplashScreen />;
  }
  
  return (
    <NavigationContainer
      theme={theme}
      onStateChange={onStateChange}
      onReady={() => {
        // Set initial screen
        dispatch(setCurrentScreen('Initial'));
      }}
    >
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isLoggedIn ? (
          <Stack.Screen name="Main" component={TabNavigator} />
        ) : (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

// App Navigator
const AppNavigator = () => {
  return (
    <SafeAreaProvider>
      <RootNavigator />
    </SafeAreaProvider>
  );
};

export default AppNavigator;
