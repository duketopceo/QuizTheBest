import React, {useState, useEffect} from 'react';
import {View, StyleSheet, ScrollView, ActivityIndicator} from 'react-native';
import {Text, Card, Button} from 'react-native-paper';
import {useRoute, useNavigation} from '@react-navigation/native';
import {useApi} from '../hooks/useApi';

export default function TopicSearchScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const {post} = useApi();
  const topic = (route.params as any)?.topic || '';
  const [loading, setLoading] = useState(false);
  const [materials, setMaterials] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (topic) {
      handleGenerate();
    }
  }, [topic]);

  const handleGenerate = async () => {
    if (!topic) return;

    setLoading(true);
    setError('');
    setMaterials(null);

    try {
      const response = await post('/generate', {topic});

      if (response.success) {
        setMaterials(response.data);
      } else {
        setError(response.error?.message || 'Failed to generate materials');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Generating study materials...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text variant="headlineSmall" style={styles.title}>
        {topic}
      </Text>

      {error && (
        <Card style={styles.errorCard}>
          <Card.Content>
            <Text style={styles.errorText}>{error}</Text>
          </Card.Content>
        </Card>
      )}

      {materials && (
        <View>
          {materials.summary && (
            <Card style={styles.card}>
              <Card.Content>
                <Text variant="titleLarge">Summary</Text>
                <Text>{materials.summary}</Text>
              </Card.Content>
            </Card>
          )}

          {materials.flashcards && materials.flashcards.length > 0 && (
            <Card style={styles.card}>
              <Card.Content>
                <Text variant="titleLarge">Flashcards</Text>
                <Button
                  onPress={() =>
                    navigation.navigate('Flashcards' as never, {
                      flashcards: materials.flashcards,
                    } as never)
                  }>
                  View Flashcards ({materials.flashcards.length})
                </Button>
              </Card.Content>
            </Card>
          )}

          {materials.quiz && (
            <Card style={styles.card}>
              <Card.Content>
                <Text variant="titleLarge">Quiz</Text>
                <Button
                  onPress={() =>
                    navigation.navigate('Quiz' as never, {quiz: materials.quiz} as never)
                  }>
                  Take Quiz
                </Button>
              </Card.Content>
            </Card>
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    marginBottom: 16,
    fontWeight: 'bold',
  },
  loadingText: {
    marginTop: 16,
  },
  errorCard: {
    backgroundColor: '#ffebee',
    marginBottom: 16,
  },
  errorText: {
    color: '#c62828',
  },
  card: {
    marginBottom: 16,
    elevation: 2,
  },
});
