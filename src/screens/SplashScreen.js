import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';
import { useTheme } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';

const SplashScreen = () => {
  const theme = useTheme();

  return (
    <LinearGradient
      colors={[theme.colors.gradientStart, theme.colors.gradientEnd]}
      style={styles.container}
    >
      <View style={styles.logoContainer}>
        {/* Replace with your app logo */}
        {/* Commented out due to missing logo.png file */}
        {/* <Image
          source={require('../../assets/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        /> */}
        <Text style={[styles.title, { color: '#FFFFFF' }]}>
          ToxiGuard
        </Text>
        <Text style={[styles.subtitle, { color: '#FFFFFF' }]}>
          Parent Companion
        </Text>
      </View>
      
      <ActivityIndicator
        animating={true}
        color="#FFFFFF"
        size="large"
        style={styles.loader}
      />
      
      <Text style={[styles.loadingText, { color: '#FFFFFF' }]}>
        Loading...
      </Text>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 16,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 8,
  },
  loader: {
    marginVertical: 24,
  },
  loadingText: {
    fontSize: 16,
  },
});

export default SplashScreen;
