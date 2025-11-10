import React, {useEffect, useState} from 'react';
import {View, StyleSheet, ScrollView, TouchableOpacity} from 'react-native';
import {Text, Card, Button, FAB, Searchbar} from 'react-native-paper';
import {useNavigation} from '@react-navigation/native';
import {useAuth} from '../context/AuthContext';
import {useApi} from '../hooks/useApi';

export default function DashboardScreen() {
  const {user, logout} = useAuth();
  const navigation = useNavigation();
  const {get} = useApi();
  const [topics, setTopics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadTopics();
  }, []);

  const loadTopics = async () => {
    try {
      const response = await get('/user/saved-topics');
      if (response.success) {
        setTopics(response.data || []);
      }
    } catch (error) {
      console.error('Failed to load topics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigation.navigate('TopicSearch' as never, {topic: searchQuery} as never);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigation.navigate('Login' as never);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text variant="headlineSmall">Welcome, {user?.username}</Text>
          <Button onPress={handleLogout}>Sign Out</Button>
        </View>

        <Searchbar
          placeholder="Search for a topic..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          onSubmitEditing={handleSearch}
          style={styles.searchbar}
        />

        <Text variant="titleLarge" style={styles.sectionTitle}>
          Recent Topics
        </Text>

        {topics.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Card.Content>
              <Text style={styles.emptyText}>
                No topics yet. Start by searching for a topic!
              </Text>
            </Card.Content>
          </Card>
        ) : (
          topics.map(topic => (
            <TouchableOpacity
              key={topic.id}
              onPress={() =>
                topic.studySetId &&
                navigation.navigate('StudySet' as never, {id: topic.studySetId} as never)
              }>
              <Card style={styles.topicCard}>
                <Card.Content>
                  <Text variant="titleMedium">{topic.name}</Text>
                  <Text variant="bodySmall" style={styles.dateText}>
                    {new Date(topic.createdAt).toLocaleDateString()}
                  </Text>
                </Card.Content>
              </Card>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => navigation.navigate('TopicSearch' as never, {topic: ''} as never)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  searchbar: {
    marginBottom: 16,
  },
  sectionTitle: {
    marginBottom: 12,
    fontWeight: 'bold',
  },
  topicCard: {
    marginBottom: 12,
    elevation: 2,
  },
  emptyCard: {
    marginTop: 16,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
  },
  dateText: {
    color: '#666',
    marginTop: 4,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});
