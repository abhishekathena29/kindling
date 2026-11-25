import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
  Linking,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Eye, EyeOff } from 'lucide-react-native';
import { supabase } from '../lib/supabase';
import { Text } from '../components/Text';
import { useLanguage, Language } from '../context/LanguageContext';

interface SignupScreenProps {
  onSignIn: () => void;
  onCreateAccount: () => void;
}

export const SignupScreen: React.FC<SignupScreenProps> = ({ onSignIn, onCreateAccount }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const { language, setLanguage, languageLabels } = useLanguage();
  const handleLanguageSelect = (lang: Language) => {
    if (language === lang) return;
    setLanguage(lang);
  };

  const handleSignup = async () => {
    const trimmedEmail = email.trim();
    if (!fullName || !trimmedEmail || !password) {
      Alert.alert('Missing Fields', 'Please fill out all fields.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Passwords Mismatch', 'Your passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const { error, data } = await supabase.auth.signUp({
        email: trimmedEmail,
        password,
        options: {
          data: {
            name: fullName,
          }
        }
      });

      if (error) {
        throw error;
      }

      if (data.user?.id) {
        await supabase
          .from('profiles')
          .update({ language_preference: language })
          .eq('id', data.user.id);
      }

      if (data.session) {
        onCreateAccount(); // User successfully signed up
      } else {
        // Sometimes SignUp requires email confirmation depending on Supabase settings
        Alert.alert('Success', 'Account created! Please check your email to confirm or sign in directly.');
        onSignIn();
      }
    } catch (signUpError: any) {
      Alert.alert('Signup Failed', signUpError?.message ?? 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.topSection}>
            <Image 
              source={require('../assets/logo.png')} 
              style={{ width: 160, height: 160, marginBottom: 16 }}
              resizeMode="contain"
            />
            
            <Text style={styles.title}>Create your account</Text>
            <Text style={styles.subtitle}>Start your personalized parenting journey</Text>
          </View>

          <View style={styles.formSection}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Your name"
                placeholderTextColor="#A9A9A9"
                value={fullName}
                onChangeText={setFullName}
                autoCapitalize="words"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="you@example.com"
                placeholderTextColor="#A9A9A9"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.passwordWrapper}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="••••••••"
                  placeholderTextColor="#A9A9A9"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!isPasswordVisible}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                >
                  {isPasswordVisible ? (
                    <Eye size={20} color="#555555" />
                  ) : (
                    <EyeOff size={20} color="#555555" />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Confirm Password</Text>
              <View style={styles.passwordWrapper}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="••••••••"
                  placeholderTextColor="#A9A9A9"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={true}
                />
              </View>
            </View>

            <TouchableOpacity 
              style={[styles.primaryButton, loading && { opacity: 0.7 }]} 
              onPress={handleSignup}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.primaryButtonText}>Create Account</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.languageSection}>
            <Text style={styles.languageTitle}>Language preference</Text>
            <Text style={styles.languageHintText}>
              Choose which language Kindling should default to after you sign up. We remember it for you.
            </Text>
            <View style={styles.languageOptionsRow}>
              <TouchableOpacity
                style={[
                  styles.languageOption,
                  language === 'hi' && styles.languageOptionActive,
                ]}
                onPress={() => handleLanguageSelect('hi')}
              >
                <Text style={styles.languageOptionLabel}>{languageLabels.hi}</Text>
                <Text style={styles.languageOptionSubtext}>Convert the UI to Hindi</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.languageOption,
                  language === 'en' && styles.languageOptionActive,
                ]}
                onPress={() => handleLanguageSelect('en')}
              >
                <Text style={styles.languageOptionLabel}>{languageLabels.en}</Text>
                <Text style={styles.languageOptionSubtext}>Keep it in English</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account?</Text>
            <TouchableOpacity style={styles.secondaryButton} onPress={onSignIn}>
              <Text style={styles.secondaryButtonText}>Sign in</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.privacyLinkContainer}>
            <Text style={styles.privacyText}>
              By signing up you agree to our{' '}
              <Text 
                style={styles.privacyLinkText}
                onPress={() => Linking.openURL('https://www.freeprivacypolicy.com/live/640f99e5-6864-4827-9e08-0fc2b80bcdc0')}
              >
                Privacy Policy
              </Text>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    paddingTop: 40,
    paddingBottom: 20,
  },
  topSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#222222',
    textAlign: 'center',
    marginTop: 24,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
  },
  formSection: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#222222',
    marginBottom: 8,
  },
  input: {
    height: 52,
    borderWidth: 1,
    borderColor: '#E6E6E6',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
    color: '#222222',
  },
  passwordWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E6E6E6',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },
  passwordInput: {
    flex: 1,
    height: 52,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#222222',
  },
  eyeIcon: {
    padding: 12,
  },
  primaryButton: {
    backgroundColor: '#38A389',
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#38A389',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    marginTop: 12,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 32,
  },
  footerText: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 12,
  },
  secondaryButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#38A389',
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  secondaryButtonText: {
    color: '#38A389',
    fontSize: 16,
    fontWeight: '600',
  },
  privacyLinkContainer: {
    paddingBottom: Platform.OS === 'ios' ? 24 : 32,
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  privacyText: {
    fontSize: 13,
    color: '#888888',
    textAlign: 'center',
  },
  privacyLinkText: {
    color: '#38A389',
    fontWeight: '600',
  },
  languageSection: {
    marginTop: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EFEFEF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  languageTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222222',
    marginBottom: 6,
  },
  languageHintText: {
    fontSize: 13,
    color: '#666666',
    marginBottom: 12,
  },
  languageOptionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  languageOption: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    padding: 12,
    marginHorizontal: 4,
  },
  languageOptionActive: {
    borderColor: '#38A389',
    backgroundColor: '#F1F9F5',
  },
  languageOptionLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#222222',
  },
  languageOptionSubtext: {
    fontSize: 12,
    color: '#555555',
    marginTop: 4,
  },
});
