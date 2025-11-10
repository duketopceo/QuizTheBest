import React, {useState, useEffect} from 'react';
import {View, StyleSheet, ScrollView} from 'react-native';
import {Text, Card, SegmentedButtons} from 'react-native-paper';
import {useRoute, useNavigation} from '@react-navigation/native';
import {useApi} from '../hooks/useApi';

export default function StudySetScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const {id} = (route.params as any) || {};
  const {get} = useApi();
  const [studySet, setStudySet] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('summary');

  useEffect(() => {
    if (id) {
      loadStudySet();
    }
  }, [id]);

  const loadStudySet = async () => {
    try {
      const response = await get(`/study-sets/${id}`);
      if (response.success) {
        setStudySet(response.data);
      }
    } catch (error) {
      console.error('Failed to load study set:', error);
    }
  };

  if (!studySet) {
    return (
      <View style={styles.center}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text variant="headlineSmall" style={styles.title}>
        {studySet.topic}
      </Text>

      <SegmentedButtons
        value={activeTab}
        onValueChange={setActiveTab}
        buttons={[
          {value: 'summary', label: 'Summary'},
          {value: 'flashcards', label: 'Flashcards'},
          {value: 'quiz', label: 'Quiz'},
        ]}
        style={styles.segmented}
      />

      {activeTab === 'summary' && studySet.summary && (
        <Card style={styles.card}>
          <Card.Content>
            <Text>{studySet.summary}</Text>
          </Card.Content>
        </Card>
      )}

      {activeTab === 'flashcards' && studySet.flashcards && (
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium">
              {studySet.flashcards.length} flashcards available
            </Text>
            <Text
              onPress={() =>
                navigation.navigate('Flashcards' as never, {
                  flashcards: studySet.flashcards,
                } as never)
              }
              style={styles.link}>
              View Flashcards →
            </Text>
          </Card.Content>
        </Card>
      )}

      {activeTab === 'quiz' && studySet.quiz && (
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium">Quiz available</Text>
            <Text
              onPress={() =>
                navigation.navigate('Quiz' as never, {quiz: studySet.quiz} as never)
              }
              style={styles.link}>
              Take Quiz →
            </Text>
          </Card.Content>
        </Card>
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
  segmented: {
    marginBottom: 16,
  },
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  link: {
    color: '#6200ee',
    marginTop: 8,
    textDecorationLine: 'underline',
  },
});
