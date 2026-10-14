
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { RootStackParamList } from '../navigation/types';
import type { AppDispatch, RootState } from '../app/store';
import {
  clearPostError,
  createPost,
} from '../features/posts/postsSlice';

type Props = NativeStackScreenProps<RootStackParamList, 'CreatePost'>;

export default function CreatePostScreen({ navigation }: Props) {
  const dispatch = useDispatch<AppDispatch>();

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');

  const { saving } = useSelector((state: RootState) => state.posts);

  const handleCreatePost = async () => {
    const cleanTitle = title.trim();
    const cleanBody = body.trim();

    if (!cleanTitle || !cleanBody) {
      Alert.alert(
        'Missing fields',
        'Please enter both the title and post content.',
      );
      return;
    }

    dispatch(clearPostError());

    try {
      await dispatch(
        createPost({
          title: cleanTitle,
          body: cleanBody,
        }),
      ).unwrap();

      Alert.alert('Success', 'Post created successfully.', [
        {
          text: 'OK',
          onPress: () => navigation.navigate('Home'),
        },
      ]);
    } catch (error) {
      Alert.alert(
        'Error',
        typeof error === 'string'
          ? error
          : 'Unable to create post. Please try again.',
      );
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          <Text style={styles.heading}>Create New Post</Text>
          <Text style={styles.subtitle}>
            Enter a title and write something to share.
          </Text>

          <Text style={styles.label}>Post Title</Text>
          <TextInput
            style={styles.titleInput}
            placeholder="Enter post title"
            placeholderTextColor="#94A3B8"
            value={title}
            onChangeText={setTitle}
            maxLength={150}
            editable={!saving}
          />

          <Text style={styles.label}>Post Content</Text>
          <TextInput
            style={styles.bodyInput}
            placeholder="Write your post here..."
            placeholderTextColor="#94A3B8"
            value={body}
            onChangeText={setBody}
            multiline
            textAlignVertical="top"
            maxLength={2000}
            editable={!saving}
          />

          <TouchableOpacity
            style={[styles.button, saving && styles.disabledButton]}
            onPress={handleCreatePost}
            disabled={saving}
            activeOpacity={0.8}
          >
            {saving ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>Publish Post</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
            disabled={saving}
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EFF6FF',
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    padding: 22,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  heading: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 21,
    color: '#64748B',
    marginTop: 8,
    marginBottom: 26,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 8,
  },
  titleInput: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
    color: '#0F172A',
    marginBottom: 20,
  },
  bodyInput: {
    minHeight: 160,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
    lineHeight: 22,
    color: '#0F172A',
    marginBottom: 22,
  },
  button: {
    backgroundColor: '#2563EB',
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.65,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  cancelButton: {
    alignItems: 'center',
    paddingVertical: 14,
    marginTop: 6,
  },
  cancelText: {
    color: '#64748B',
    fontSize: 15,
    fontWeight: '600',
  },
});
