import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Input } from '@/components/Input';
import { Colors } from '@/constants/theme';
import { useAppState } from '@/context/AppState';
import { router } from 'expo-router';
import { Award, Bell, Calendar, Send } from 'lucide-react-native';
import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AdminNotificationBroadcaster() {
  let colorScheme = 'light' as 'light' | 'dark';
  const themeColors = Colors.light;
  const { notifications } = useAppState(); // We can display a log of past announcements

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [category, setCategory] = useState<'Event' | 'Announcement' | 'Recognition'>('Announcement');
  const [loading, setLoading] = useState(false);

  const handleBroadcast = () => {
    if (!title.trim() || !body.trim()) {
      Alert.alert('Error', 'Please fill out both the title and body of the announcement.');
      return;
    }

    setLoading(true);

    // Simulate sending push notifications to Apple / Google servers
    setTimeout(() => {
      setLoading(false);
      Alert.alert(
        'Broadcast Successful',
        `Your "${category}" notification has been broadcast to all registered donors in the district!`,
        [
          {
            text: 'OK',
            onPress: () => {
              setTitle('');
              setBody('');
              setCategory('Announcement');
              router.replace('/(admin)/dashboard');
            },
          },
        ]
      );
    }, 1200);
  };

  const categories = [
    { type: 'Announcement', icon: Bell, label: 'Alert Notice', color: '#EF233C' },
    { type: 'Event', icon: Calendar, label: 'Event/Camp', color: '#00B4D8' },
    { type: 'Recognition', icon: Award, label: 'Recognition', color: '#FFB703' },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: themeColors.text }]}>District Broadcaster</Text>
            <Text style={[styles.subtitle, { color: themeColors.textSecondary }]}>
              Send event invitations, blood donation drive alerts, or donor recognition news
            </Text>
          </View>

          {/* Broadcast Form */}
          <Card style={styles.formCard}>
            {/* Category Selector */}
            <Text style={[styles.selectorLabel, { color: themeColors.textSecondary }]}>
              Notification Category
            </Text>
            <View style={styles.categoryContainer}>
              {categories.map((cat) => {
                const IconComponent = cat.icon;
                const isSelected = category === cat.type;

                return (
                  <Pressable
                    key={cat.type}
                    style={[
                      styles.categoryCard,
                      {
                        backgroundColor: isSelected ? themeColors.primaryLight : themeColors.backgroundElement,
                        borderColor: isSelected ? themeColors.primary : themeColors.border,
                        borderWidth: 1,
                      },
                    ]}
                    onPress={() => setCategory(cat.type as any)}
                  >
                    <IconComponent size={20} color={isSelected ? themeColors.primary : themeColors.textSecondary} />
                    <Text
                      style={[
                        styles.categoryLabel,
                        {
                          color: isSelected ? themeColors.text : themeColors.textSecondary,
                          fontWeight: isSelected ? '700' : '500',
                        },
                      ]}
                    >
                      {cat.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Input
              label="Notification Title"
              placeholder="e.g. Mega Blood Donation Drive - July 5"
              value={title}
              onChangeText={setTitle}
            />

            <Input
              label="Message Body"
              placeholder="Enter the detailed announcement text here..."
              value={body}
              onChangeText={setBody}
              multiline
              numberOfLines={4}
              inputStyle={{ height: 60, textAlignVertical: 'top' }}
            />

            <Button
              title="Broadcast to All Donors"
              onPress={handleBroadcast}
              loading={loading}
              size="large"
              style={styles.broadcastBtn}
              icon={<Send size={18} color="#FFFFFF" />}
            />
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    padding: 20,
    paddingTop: 10,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 13,
    marginTop: 4,
  },
  formCard: {
    padding: 20,
    marginBottom: 20,
  },
  selectorLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
    marginLeft: 4,
  },
  categoryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 20,
  },
  categoryCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 14,
    gap: 6,
  },
  categoryLabel: {
    fontSize: 11,
    textAlign: 'center',
  },
  broadcastBtn: {
    marginTop: 20,
  },
});
