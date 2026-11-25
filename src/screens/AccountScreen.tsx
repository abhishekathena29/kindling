import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert, Linking, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, User, Lock, Mail, Shield, Trash2 } from 'lucide-react-native';
import { supabase } from '../lib/supabase';
import { Text } from '../components/Text';

interface AccountScreenProps {
  onBack: () => void;
}

export const AccountScreen: React.FC<AccountScreenProps> = ({ onBack }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('********');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [originalEmail, setOriginalEmail] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        setUserId(user.id);
        
        const { data, error } = await supabase
          .from('profiles')
          .select('name, email')
          .eq('id', user.id)
          .single();
        if (error) {
          console.warn('Unable to load profile', error);
        }
          
        if (data) {
          setName(data.name || '');
          setEmail(data.email || user.email || '');
          setOriginalEmail(data.email || user.email || '');
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfile();
  }, []);

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to delete your account? This action cannot be undone and you will lose all your progress.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: () => {
            Linking.openURL('https://docs.google.com/forms/d/e/1FAIpQLSfczCYtQQo6jeiDo9LsmhlSCs2-ejReJW0jYmLHzxOAaQwERg/viewform');
          }
        }
      ]
    );
  };

  const handleUpdate = async () => {
    if (!userId) return;
    setUpdating(true);

    try {
      // Update profile table
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ name })
        .eq('id', userId);

      if (profileError) throw profileError;

      // Update auth credentials if changed
      const updates: { email?: string; password?: string } = {};
      if (email !== originalEmail) updates.email = email;
      if (password !== '********' && password.trim() !== '') updates.password = password;

      if (Object.keys(updates).length > 0) {
        const { error: authError } = await supabase.auth.updateUser(updates);
        if (authError) throw authError;
      }

      Alert.alert("Success", "Account details updated successfully.");
      setPassword('********');
      setOriginalEmail(email);
    } catch (error: any) {
      Alert.alert("Update Failed", error.message);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.safeArea, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#38A389" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <ArrowLeft size={24} color="#222222" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Account</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile Details</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name</Text>
            <View style={styles.inputContainer}>
              <User size={20} color="#999" style={styles.inputIcon} />
              <TextInput style={styles.input} value={name} onChangeText={setName} />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Address</Text>
            <View style={styles.inputContainer}>
              <Mail size={20} color="#999" style={styles.inputIcon} />
              <TextInput style={styles.input} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputContainer}>
              <Lock size={20} color="#999" style={styles.inputIcon} />
              <TextInput style={styles.input} value={password} onChangeText={setPassword} secureTextEntry />
            </View>
          </View>

          <TouchableOpacity 
            style={[styles.updateButton, updating && { opacity: 0.7 }]} 
            onPress={handleUpdate}
            disabled={updating}
          >
            {updating ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.updateButtonText}>Update Details</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Legal & Privacy</Text>
          
          <TouchableOpacity 
            style={styles.linkRow} 
            onPress={() => Linking.openURL('https://www.freeprivacypolicy.com/live/640f99e5-6864-4827-9e08-0fc2b80bcdc0')}
          >
            <Shield size={20} color="#555" style={styles.linkIcon} />
            <Text style={styles.linkText}>Privacy Policy</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Danger Zone</Text>
          
          <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteAccount}>
            <Trash2 size={20} color="#E74C3C" style={styles.linkIcon} />
            <Text style={styles.deleteButtonText}>Delete Account</Text>
          </TouchableOpacity>
          <Text style={styles.deleteWarning}>Deleting your account is permanent. All your progress, assessment data, and history will be erased simultaneously.</Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FAFAFA' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#EEEEEE', backgroundColor: '#FFFFFF' },
  backButton: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#222222' },
  container: { padding: 24, paddingBottom: 60 },
  section: { marginBottom: 32 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#222222', marginBottom: 16 },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: '#555555', marginBottom: 8 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#DDDDDD', borderRadius: 12, paddingHorizontal: 12 },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, height: 48, fontSize: 15, color: '#222222' },
  updateButton: { backgroundColor: '#38A389', borderRadius: 16, height: 48, justifyContent: 'center', alignItems: 'center', marginTop: 8 },
  updateButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '600' },
  linkRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', padding: 16, borderRadius: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 8, elevation: 2 },
  linkIcon: { marginRight: 16 },
  linkText: { fontSize: 15, fontWeight: '500', color: '#222222' },
  deleteButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FDF2F1', padding: 16, borderRadius: 16, marginBottom: 12 },
  deleteButtonText: { fontSize: 15, fontWeight: '600', color: '#E74C3C' },
  deleteWarning: { fontSize: 12, color: '#888888', lineHeight: 18, paddingHorizontal: 4 },
});
