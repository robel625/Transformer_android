import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MyPressable from '../../components/MyPressable';
import userService from '../../api/services/userService';
import { showToast } from '../../util/action';
import { useAuth } from '../../context/AuthContext';
// Import the package.json version
import { version as APP_VERSION } from '../../../package.json';

const LoginScreen: React.FC = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const window = useWindowDimensions();
  const { checkAuth } = useAuth();
  
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [secureTextEntry, setSecureTextEntry] = useState(true);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLogin = async () => {
    if (!formData.username || !formData.password) {
      showToast('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
      await userService.signin({
        username: formData.username,
        password: formData.password,
      });
      await checkAuth(); // This will trigger the navigation
    } catch (error) {
      showToast('Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar
        backgroundColor="transparent"
        barStyle="dark-content"
        translucent
      />
      
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { minHeight: window.height - insets.top }
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.content}
        >
          <View style={styles.header}>
            <Text style={styles.title}>Transformer Card</Text>
          </View>

          <View style={styles.header}>
            <Text style={styles.title1}>Welcome Back!</Text>
            <Text style={styles.subtitle}>
              Sign in to continue to your account
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Icon name="person" size={20} color="#666" />
              <TextInput
                style={styles.input}
                placeholder="Username"
                placeholderTextColor="#666"
                value={formData.username}
                onChangeText={(value) => handleInputChange('username', value)}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputContainer}>
              <Icon name="lock" size={20} color="#666" />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#666"
                value={formData.password}
                onChangeText={(value) => handleInputChange('password', value)}
                secureTextEntry={secureTextEntry}
              />
              <MyPressable
                onPress={() => setSecureTextEntry(!secureTextEntry)}
                style={styles.eyeIcon}
              >
                <Icon
                  name={secureTextEntry ? 'visibility' : 'visibility-off'}
                  size={20}
                  color="#666"
                />
              </MyPressable>
            </View>

            {/* <MyPressable
              style={styles.forgotPassword}
              onPress={() => navigation.navigate('ForgotPassword')}
            >
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </MyPressable> */}

            <MyPressable
              style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
              onPress={handleLogin}
              disabled={isLoading}
            >
              <Text style={styles.loginButtonText}>
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Text>
            </MyPressable>

            {/* <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.dividerLine} />
            </View> */}

            <MyPressable
              style={styles.registerButton}
              onPress={() => navigation.navigate('Register')}
            >
              {/* <Text style={styles.registerButtonText}>
                Don't have an account? <Text style={styles.registerHighlight}>Register</Text>
              </Text> */}
            </MyPressable>
          </View>

          <View style={styles.versionContainer}>
            <Text style={styles.versionText}>Version {APP_VERSION}</Text>
          </View>
        </KeyboardAvoidingView>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FEFEFE',
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontFamily: 'WorkSans-Bold',
    color: '#14142B',
    textAlign: 'center',
    marginBottom: 4,
  },
  title1: {
    fontSize: 20,
    fontFamily: 'WorkSans-Bold',
    color: '#14142B',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'WorkSans-Regular',
    color: '#4E4B66',
  },
  form: {
    marginTop: 24,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7F7FC',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#EFF0F7',
  },
  input: {
    flex: 1,
    height: 56,
    marginLeft: 12,
    fontSize: 16,
    fontFamily: 'WorkSans-Regular',
    color: '#14142B',
  },
  eyeIcon: {
    padding: 8,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: '#54D3C2',
    fontSize: 14,
    fontFamily: 'WorkSans-Medium',
  },
  loginButton: {
    backgroundColor: '#54D3C2',
    // backgroundColor: 'blue',
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#54D3C2',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'WorkSans-SemiBold',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#EFF0F7',
  },
  dividerText: {
    marginHorizontal: 16,
    color: '#6E7191',
    fontFamily: 'WorkSans-Regular',
  },
  registerButton: {
    alignItems: 'center',
    padding: 16,
  },
  registerButtonText: {
    fontSize: 14,
    fontFamily: 'WorkSans-Regular',
    color: '#4E4B66',
  },
  registerHighlight: {
    color: '#54D3C2',
    fontFamily: 'WorkSans-SemiBold',
  },
  versionContainer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  versionText: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'WorkSans-Regular',
  },
});

export default LoginScreen;


