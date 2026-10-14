
import React, { useEffect } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useDispatch, useSelector } from 'react-redux';

import type { AppDispatch, RootState } from '../app/store';
import { restoreSession } from '../features/auth/authSlice';
import type { RootStackParamList } from './types';

import SignupScreen from '../screens/SignupScreen';
import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import PostDetailsScreen from '../screens/PostDetailsScreen';
import CreatePostScreen from '../screens/CreatePostScreen';
import EditPostScreen from '../screens/EditPostScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const dispatch = useDispatch<AppDispatch>();

  const { isAuthenticated, loading } = useSelector(
    (state: RootState) => state.auth,
  );

  useEffect(() => {
    dispatch(restoreSession());
  }, [dispatch]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        key={isAuthenticated ? 'authenticated' : 'guest'}
        initialRouteName={isAuthenticated ? 'Home' : 'Signup'}
        screenOptions={{
          headerStyle: { backgroundColor: '#2563EB' },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: { fontWeight: 'bold' },
          contentStyle: { backgroundColor: '#F8FAFC' },
        }}
      >
        {isAuthenticated ? (
          <>
            <Stack.Screen
              name="Home"
              component={HomeScreen}
              options={{ title: 'Posts' }}
            />
            <Stack.Screen
              name="PostDetails"
              component={PostDetailsScreen}
              options={{ title: 'Post Details' }}
            />
            <Stack.Screen
              name="CreatePost"
              component={CreatePostScreen}
              options={{ title: 'Create Post' }}
            />
            <Stack.Screen
              name="EditPost"
              component={EditPostScreen}
              options={{ title: 'Edit Post' }}
            />
          </>
        ) : (
          <>
            <Stack.Screen
              name="Signup"
              component={SignupScreen}
              options={{ title: 'Create Account' }}
            />
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{ title: 'Login' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#334155',
  },
});
