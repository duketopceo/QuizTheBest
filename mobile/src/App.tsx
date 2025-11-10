import React, {useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {PaperProvider} from 'react-native-paper';
import {AuthProvider} from './context/AuthContext';
import {ThemeProvider} from './context/ThemeContext';
import {configureAmplify} from './config/amplify';
import LoginScreen from './screens/LoginScreen';
import DashboardScreen from './screens/DashboardScreen';
import TopicSearchScreen from './screens/TopicSearchScreen';
import StudySetScreen from './screens/StudySetScreen';
import FlashcardScreen from './screens/FlashcardScreen';
import QuizScreen from './screens/QuizScreen';

const Stack = createNativeStackNavigator();

function App(): React.JSX.Element {
  // Configure Amplify on app startup (before AuthProvider)
  useEffect(() => {
    configureAmplify();
  }, []);

  return (
    <PaperProvider>
      <ThemeProvider>
        <AuthProvider>
          <NavigationContainer>
            <Stack.Navigator
              initialRouteName="Login"
              screenOptions={{
                headerShown: true,
              }}>
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen name="Dashboard" component={DashboardScreen} />
              <Stack.Screen name="TopicSearch" component={TopicSearchScreen} />
              <Stack.Screen name="StudySet" component={StudySetScreen} />
              <Stack.Screen name="Flashcards" component={FlashcardScreen} />
              <Stack.Screen name="Quiz" component={QuizScreen} />
            </Stack.Navigator>
          </NavigationContainer>
        </AuthProvider>
      </ThemeProvider>
    </PaperProvider>
  );
}

export default App;
