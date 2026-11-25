import React, { useState, useEffect } from 'react';
import { View, StatusBar, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Heart, Target, Sparkles, Users } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './src/lib/supabase';

import { OnboardingScreen, OnboardingStep } from './src/screens/OnboardingScreen';
import { LoginScreen } from './src/screens/LoginScreen';
import { SignupScreen } from './src/screens/SignupScreen';
import { ForgotPasswordScreen } from './src/screens/ForgotPasswordScreen';
import { MainApp } from './src/navigation/MainApp';
import { AppProvider } from './src/context/AppContext';
import { LanguageProvider } from './src/context/LanguageContext';
import { ErrorBoundary } from './src/components/ErrorBoundary';

const ONBOARDING_KEY = '@kindling:onboarded';

type RootState = 'loading' | 'onboarding' | 'auth_login' | 'auth_signup' | 'auth_forgot' | 'main_app';

const ONBOARDING_DATA: OnboardingStep[] = [
  {
    id: '1',
    title: 'Parenting can feel overwhelming',
    subtitle: 'Even with the best intentions, connecting with your teen can feel like navigating unknown waters.',
    iconBgColor: '#F9D9EC',
    iconColor: '#F46E88',
    IconComponent: Heart,
    buttonText: 'Next   >',
  },
  {
    id: '2',
    title: 'Personalized guidance, just for you',
    subtitle: 'Get conversation starters, bonding activities, and emotional reminders tailored to your family.',
    iconBgColor: '#FAE7D8',
    iconColor: '#ED8D41',
    IconComponent: Target,
    buttonText: 'Next   >',
  },
  {
    id: '3',
    title: 'Understand your parenting style',
    subtitle: 'Take a quick assessment and receive a plan that fits your unique family dynamic.',
    iconBgColor: '#EBE0F9',
    iconColor: '#B67BF3',
    IconComponent: Sparkles,
    buttonText: 'Next   >',
  },
  {
    id: '4',
    title: "You're not in this alone",
    subtitle: 'Join supportive community channels, track your progress, and grow with AI guidance.',
    iconBgColor: '#D3EFE4',
    iconColor: '#00A36C',
    IconComponent: Users,
    buttonText: 'Get Started   >',
  },
];

const App = () => {
  const [currentView, setCurrentView] = useState<RootState>('loading');
  const [currentStep, setCurrentStep] = useState(0);

  // On first mount: check session and onboarding
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setCurrentView('main_app');
          return;
        }

        const value = await AsyncStorage.getItem(ONBOARDING_KEY);
        if (value === 'true') {
          setCurrentView('auth_login');
        } else {
          setCurrentView('onboarding');
        }
      } catch {
        setCurrentView('onboarding');
      }
    };
    checkStatus();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setCurrentView('main_app');
      } else {
        setCurrentView(curr => curr === 'main_app' ? 'auth_login' : curr);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Called when last onboarding step completes or user skips
  const completeOnboarding = async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
    } catch {
      // Non-critical — proceed regardless
    }
    setCurrentView('auth_login');
  };

  const handleNextOnboarding = () => {
    if (currentStep < ONBOARDING_DATA.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeOnboarding();
    }
  };

  const handleSkipOnboarding = () => {
    completeOnboarding();
  };

  const renderView = () => {
    switch (currentView) {
      case 'loading':
        return (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#38A389" />
          </View>
        );
      case 'onboarding':
        return (
          <OnboardingScreen
            data={ONBOARDING_DATA}
            currentStep={currentStep}
            onNext={handleNextOnboarding}
            onSkip={handleSkipOnboarding}
          />
        );
      case 'auth_login':
        return (
          <LoginScreen
            onSignIn={() => setCurrentView('main_app')}
            onSignUp={() => setCurrentView('auth_signup')}
            onForgotPassword={() => setCurrentView('auth_forgot')}
          />
        );
      case 'auth_signup':
        return (
          <SignupScreen
            onSignIn={() => setCurrentView('auth_login')}
            onCreateAccount={() => setCurrentView('main_app')}
          />
        );
      case 'auth_forgot':
        return (
          <ForgotPasswordScreen
            onBack={() => setCurrentView('auth_login')}
          />
        );
      case 'main_app':
        return <MainApp />;
      default:
        return null;
    }
  };

  return (
    <LanguageProvider>
      <ErrorBoundary>
        <SafeAreaProvider>
          <AppProvider>
            <SafeAreaView style={styles.root} edges={['top', 'left', 'right']}>
              <StatusBar barStyle="dark-content" backgroundColor="#FAFAFA" />
              {renderView()}
            </SafeAreaView>
          </AppProvider>
        </SafeAreaProvider>
      </ErrorBoundary>
    </LanguageProvider>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FAFAFA' },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
  },
});

export default App;
