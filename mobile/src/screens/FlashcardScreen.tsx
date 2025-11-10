import React, {useState} from 'react';
import {View, StyleSheet, Dimensions} from 'react-native';
import {Text, Card, Button} from 'react-native-paper';
import {useRoute} from '@react-navigation/native';
import {Flashcard} from '@shared/types/study';

const {width} = Dimensions.get('window');

export default function FlashcardScreen() {
  const route = useRoute();
  const flashcards = (route.params as any)?.flashcards || [];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const currentCard = flashcards[currentIndex];
  const hasNext = currentIndex < flashcards.length - 1;
  const hasPrev = currentIndex > 0;

  if (flashcards.length === 0) {
    return (
      <View style={styles.center}>
        <Text>No flashcards available</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.counter}>
        {currentIndex + 1} / {flashcards.length}
      </Text>

      <Card
        style={styles.card}
        onPress={() => setFlipped(!flipped)}
        accessible={true}
        accessibilityLabel={flipped ? 'Flashcard showing answer' : 'Flashcard showing question'}>
        <Card.Content style={styles.cardContent}>
          <Text variant="labelLarge" style={styles.label}>
            {flipped ? 'Answer' : 'Question'}
          </Text>
          <Text variant="headlineSmall" style={styles.text}>
            {flipped ? currentCard.answer : currentCard.question}
          </Text>
        </Card.Content>
      </Card>

      <View style={styles.controls}>
        <Button
          mode="outlined"
          onPress={() => {
            if (hasPrev) {
              setCurrentIndex(currentIndex - 1);
              setFlipped(false);
            }
          }}
          disabled={!hasPrev}>
          Previous
        </Button>
        <Button mode="contained" onPress={() => setFlipped(!flipped)}>
          {flipped ? 'Show Question' : 'Show Answer'}
        </Button>
        <Button
          mode="outlined"
          onPress={() => {
            if (hasNext) {
              setCurrentIndex(currentIndex + 1);
              setFlipped(false);
            }
          }}
          disabled={!hasNext}>
          Next
        </Button>
      </View>
    </View>
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
  counter: {
    textAlign: 'center',
    marginBottom: 16,
    color: '#666',
  },
  card: {
    flex: 1,
    marginBottom: 16,
    elevation: 4,
  },
  cardContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  label: {
    marginBottom: 16,
    color: '#666',
  },
  text: {
    textAlign: 'center',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
});
