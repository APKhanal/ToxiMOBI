import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db, auth } from './firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Request permission and get token
export const registerForPushNotifications = async () => {
  try {
    if (!Device.isDevice) {
      console.log('Push Notifications are not available on emulators/simulators');
      return false;
    }

    // Check if we already have permission
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    // If we don't have permission, ask for it
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    // If we still don't have permission, we can't register
    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return false;
    }

    // Get the token
    const expoPushToken = await Notifications.getExpoPushTokenAsync({
      projectId: 'your-project-id', // Replace with your Expo project ID
    });

    // Store the token for later use
    await AsyncStorage.setItem('expoPushToken', expoPushToken.data);

    // Update the user's document in Firestore with the token
    if (auth.currentUser) {
      const userRef = doc(db, 'users', auth.currentUser.uid);
      await updateDoc(userRef, {
        expoPushToken: expoPushToken.data,
        deviceType: Platform.OS,
        updatedAt: new Date()
      });
    }

    // Configure Android-specific settings
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    return expoPushToken.data;
  } catch (error) {
    console.error('Error registering for push notifications:', error);
    return false;
  }
};

// Function to handle notification response
export const addNotificationResponseReceivedListener = (handleNotification) => {
  const subscription = Notifications.addNotificationResponseReceivedListener(response => {
    const data = response.notification.request.content.data;
    handleNotification(data);
  });
  
  return subscription;
};

// Function to handle received notification while app is running
export const addNotificationReceivedListener = (handleNotification) => {
  const subscription = Notifications.addNotificationReceivedListener(notification => {
    const data = notification.request.content.data;
    handleNotification(data);
  });
  
  return subscription;
};

// Get all active notifications
export const getActiveNotifications = async () => {
  try {
    return await Notifications.getPresentedNotificationsAsync();
  } catch (error) {
    console.error('Error getting active notifications:', error);
    return [];
  }
};

// Cancel all notifications
export const cancelAllNotifications = async () => {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    await Notifications.dismissAllNotificationsAsync();
    return true;
  } catch (error) {
    console.error('Error cancelling notifications:', error);
    return false;
  }
};

// Update user notification settings
export const updateUserNotificationSettings = async (userId, settings) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      'settings.notifications': settings,
      updatedAt: new Date()
    });
    
    return true;
  } catch (error) {
    console.error('Error updating notification settings:', error);
    throw error;
  }
};

// Get user notification settings
export const getUserNotificationSettings = async (userId) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      return userData.settings?.notifications || { enabled: true };
    }
    
    return { enabled: true };
  } catch (error) {
    console.error('Error getting notification settings:', error);
    return { enabled: true };
  }
};

// Schedule a local notification
export const scheduleLocalNotification = async (title, body, data = {}, trigger = null) => {
  try {
    const notificationContent = {
      title,
      body,
      data,
      sound: true,
      priority: Notifications.AndroidNotificationPriority.HIGH,
    };

    const notificationTrigger = trigger || null;

    const notificationRequest = await Notifications.scheduleNotificationAsync({
      content: notificationContent,
      trigger: notificationTrigger,
    });

    return notificationRequest;
  } catch (error) {
    console.error('Error scheduling notification:', error);
    return null;
  }
};

// Send a test notification
export const sendTestNotification = async () => {
  try {
    const notificationId = await scheduleLocalNotification(
      'ToxiGuard Test Notification',
      'This is a test notification from ToxiGuard Parent Companion App',
      { type: 'test' },
      null
    );

    return notificationId;
  } catch (error) {
    console.error('Error sending test notification:', error);
    return null;
  }
};

// Remove device push token on logout
export const removePushToken = async () => {
  try {
    if (auth.currentUser) {
      const userRef = doc(db, 'users', auth.currentUser.uid);
      await updateDoc(userRef, {
        expoPushToken: null,
        updatedAt: new Date()
      });
    }

    await AsyncStorage.removeItem('expoPushToken');
    return true;
  } catch (error) {
    console.error('Error removing push token:', error);
    return false;
  }
};

// Process an incoming alert notification
export const processAlertNotification = async (data) => {
  try {
    if (!data || !data.alertId) {
      return false;
    }

    // Mark the alert as received
    const userRef = doc(db, 'users', auth.currentUser.uid);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      const userData = userDoc.data();
      const receivedAlerts = userData.receivedAlerts || [];

      if (!receivedAlerts.includes(data.alertId)) {
        await updateDoc(userRef, {
          receivedAlerts: [...receivedAlerts, data.alertId],
          lastNotificationAt: new Date()
        });
      }
    }

    return true;
  } catch (error) {
    console.error('Error processing alert notification:', error);
    return false;
  }
};
