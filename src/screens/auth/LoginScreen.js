import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Image, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Text, HelperText, useTheme } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { login } from '../../store/slices/authSlice';
import { selectAuthStatus, selectAuthError } from '../../store/slices/authSlice';
import i18n from '../../i18n';
import { LinearGradient } from 'expo-linear-gradient';
import { spacing, typography } from '../../theme';
import { SafeAreaView } from 'react-native-safe-area-context';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  
  const dispatch = useDispatch();
  const status = useSelector(selectAuthStatus);
  const error = useSelector(selectAuthError);
  const theme = useTheme();
  
  const isLoading = status === 'loading';
  
  // Clear errors when form changes
  useEffect(() => {
    setEmailError('');
  }, [email]);
  
  useEffect(() => {
    setPasswordError('');
  }, [password]);
  
  const validateForm = () => {
    let isValid = true;
    
    // Email validation
    if (!email) {
      setEmailError(i18n.t('common.requiredField'));
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError(i18n.t('auth.invalidEmail'));
      isValid = false;
    }
    
    // Password validation
    if (!password) {
      setPasswordError(i18n.t('common.requiredField'));
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError(i18n.t('auth.passwordTooShort'));
      isValid = false;
    }
    
    return isValid;
  };
  
  const handleLogin = () => {
    if (validateForm()) {
      dispatch(login({ email, password }));
    }
  };
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <LinearGradient
            colors={[theme.colors.gradientStart, theme.colors.gradientEnd]}
            style={styles.header}
          >
            <Image
              source={require('../../../assets/icon.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={[typography.title, styles.appName]}>
              {i18n.t('appName')}
            </Text>
          </LinearGradient>
          
          <View style={styles.formContainer}>
            <Text style={[typography.heading, styles.title]}>
              {i18n.t('auth.login')}
            </Text>
            
            {error && (
              <HelperText type="error" visible={!!error}>
                {error}
              </HelperText>
            )}
            
            <TextInput
              label={i18n.t('auth.email')}
              value={email}
              onChangeText={setEmail}
              style={styles.input}
              mode="outlined"
              keyboardType="email-address"
              autoCapitalize="none"
              error={!!emailError}
              disabled={isLoading}
              left={<TextInput.Icon icon="email" />}
            />
            {!!emailError && (
              <HelperText type="error" visible={!!emailError}>
                {emailError}
              </HelperText>
            )}
            
            <TextInput
              label={i18n.t('auth.password')}
              value={password}
              onChangeText={setPassword}
              style={styles.input}
              mode="outlined"
              secureTextEntry={!passwordVisible}
              error={!!passwordError}
              disabled={isLoading}
              left={<TextInput.Icon icon="lock" />}
              right={
                <TextInput.Icon
                  icon={passwordVisible ? "eye-off" : "eye"}
                  onPress={() => setPasswordVisible(!passwordVisible)}
                />
              }
            />
            {!!passwordError && (
              <HelperText type="error" visible={!!passwordError}>
                {passwordError}
              </HelperText>
            )}
            
            <Button
              mode="text"
              onPress={() => navigation.navigate('ForgotPassword')}
              style={styles.forgotPassword}
            >
              {i18n.t('auth.forgotPassword')}
            </Button>
            
            <Button
              mode="contained"
              onPress={handleLogin}
              style={styles.loginButton}
              loading={isLoading}
              disabled={isLoading}
            >
              {i18n.t('auth.login')}
            </Button>
            
            <View style={styles.registerContainer}>
              <Text style={styles.noAccountText}>
                {i18n.t('auth.dontHaveAccount')}
              </Text>
              <Button
                mode="text"
                onPress={() => navigation.navigate('Register')}
                style={styles.registerButton}
              >
                {i18n.t('auth.register')}
              </Button>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    padding: spacing.xl,
    alignItems: 'center',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: spacing.m,
  },
  appName: {
    color: 'white',
    marginBottom: spacing.m,
  },
  formContainer: {
    padding: spacing.l,
    flex: 1,
  },
  title: {
    marginBottom: spacing.l,
    textAlign: 'center',
  },
  input: {
    marginBottom: spacing.s,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: spacing.l,
  },
  loginButton: {
    marginBottom: spacing.l,
    padding: spacing.xs,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.m,
  },
  noAccountText: {
    marginRight: spacing.s,
  },
  registerButton: {
    marginLeft: 0,
    paddingLeft: 0,
  },
});

export default LoginScreen;
