import React, {useState} from 'react';
import {View, StyleSheet, ScrollView} from 'react-native';
import {Text, Card, Button, RadioButton} from 'react-native-paper';
import {useRoute} from '@react-navigation/native';
import {Quiz, QuizQuestion} from '@shared/types/study';

export default function QuizScreen() {
  const route = useRoute();
  const quiz: Quiz = (route.params as any)?.quiz;
  const [answers, setAnswers] = useState<Record<number, string | number>>({});
  const [submitted, setSubmitted] = useState(false);

  if (!quiz) {
    return (
      <View style={styles.center}>
        <Text>No quiz available</Text>
      </View>
    );
  }

  const handleAnswer = (questionIndex: number, answer: string | number) => {
    setAnswers({...answers, [questionIndex]: answer});
  };

  const calculateScore = () => {
    let correct = 0;
    quiz.questions.forEach((question, index) => {
      if (answers[index] === question.correctAnswer) {
        correct++;
      }
    });
    return {correct, total: quiz.questions.length, percentage: Math.round((correct / quiz.questions.length) * 100)};
  };

  const {correct, total, percentage} = submitted ? calculateScore() : {correct: 0, total: 0, percentage: 0};

  return (
    <ScrollView style={styles.container}>
      {!submitted ? (
        <>
          <Text variant="headlineSmall" style={styles.title}>
            {quiz.title}
          </Text>
          {quiz.questions.map((question, index) => (
            <Card key={question.id} style={styles.card}>
              <Card.Content>
                <Text variant="titleMedium" style={styles.question}>
                  {index + 1}. {question.question}
                </Text>

                {question.type === 'multiple-choice' && question.options && (
                  <RadioButton.Group
                    onValueChange={value => handleAnswer(index, question.options!.indexOf(value))}
                    value={answers[index] !== undefined ? question.options[answers[index] as number] : ''}>
                    {question.options.map((option, optIndex) => (
                      <RadioButton.Item
                        key={optIndex}
                        label={option}
                        value={option}
                        disabled={submitted}
                      />
                    ))}
                  </RadioButton.Group>
                )}

                {question.type === 'true-false' && (
                  <RadioButton.Group
                    onValueChange={value => handleAnswer(index, value === 'true')}
                    value={answers[index] === true ? 'true' : answers[index] === false ? 'false' : ''}>
                    <RadioButton.Item label="True" value="true" disabled={submitted} />
                    <RadioButton.Item label="False" value="false" disabled={submitted} />
                  </RadioButton.Group>
                )}
              </Card.Content>
            </Card>
          ))}

          <Button
            mode="contained"
            onPress={() => setSubmitted(true)}
            style={styles.submitButton}
            disabled={Object.keys(answers).length !== quiz.questions.length}>
            Submit Quiz
          </Button>
        </>
      ) : (
        <View>
          <Card style={styles.resultCard}>
            <Card.Content>
              <Text variant="headlineMedium" style={styles.score}>
                {percentage}%
              </Text>
              <Text variant="titleMedium">
                You got {correct} out of {total} questions correct
              </Text>
            </Card.Content>
          </Card>

          {quiz.questions.map((question, index) => {
            const userAnswer = answers[index];
            const isCorrect = userAnswer === question.correctAnswer;

            return (
              <Card
                key={question.id}
                style={[styles.card, isCorrect ? styles.correctCard : styles.incorrectCard]}>
                <Card.Content>
                  <Text variant="titleMedium">{question.question}</Text>
                  <Text style={styles.answerText}>
                    Your answer: {question.type === 'multiple-choice' && question.options
                      ? question.options[userAnswer as number]
                      : userAnswer === true
                      ? 'True'
                      : 'False'}
                  </Text>
                  <Text style={styles.answerText}>
                    Correct: {question.type === 'multiple-choice' && question.options
                      ? question.options[question.correctAnswer as number]
                      : question.correctAnswer === true
                      ? 'True'
                      : 'False'}
                  </Text>
                  {question.explanation && (
                    <Text style={styles.explanation}>{question.explanation}</Text>
                  )}
                </Card.Content>
              </Card>
            );
          })}
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
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  question: {
    marginBottom: 16,
  },
  submitButton: {
    marginTop: 16,
    marginBottom: 32,
  },
  resultCard: {
    marginBottom: 16,
    backgroundColor: '#e3f2fd',
  },
  score: {
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  correctCard: {
    backgroundColor: '#e8f5e9',
  },
  incorrectCard: {
    backgroundColor: '#ffebee',
  },
  answerText: {
    marginTop: 8,
    fontWeight: 'bold',
  },
  answerText: {
    marginTop: 4,
  },
  explanation: {
    marginTop: 8,
    fontStyle: 'italic',
    color: '#666',
  },
});
