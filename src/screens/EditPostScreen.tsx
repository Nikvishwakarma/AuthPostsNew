
import React, { useEffect, useState } from 'react';
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
  fetchPostDetails,
  updatePost,
} from '../features/posts/postsSlice';

type Props = NativeStackScreenProps<RootStackParamList, 'EditPost'>;

export default function EditPostScreen({
  route,
  navigation,
}: Props) {
  const { postId } = route.params;
  const dispatch = useDispatch<AppDispatch>();

  const postFromList = useSelector((state: RootState) =>
    state.posts.items.find(item => item.id === postId),
  );

  const selectedPost = useSelector((state: RootState) =>
    state.posts.selectedPost?.id === postId
      ? state.posts.selectedPost
      : null,
  );

  const { detailsLoading, saving } = useSelector(
    (state: RootState) => state.posts,
  );

  const post = postFromList ?? selectedPost;

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [method, setMethod] = useState<'PUT' | 'PATCH'>('PUT');
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    dispatch(clearPostError());
    setInitialized(false);

    if (!post) {
      dispatch(fetchPostDetails(postId));
    }
  }, [dispatch, postId]);

  useEffect(() => {
    if (post && !initialized) {
      setTitle(post.title);
      setBody(post.body);
      setInitialized(true);
    }
  }, [post, initialized]);

  const handleUpdate = async () => {
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
        updatePost({
          id: postId,
          title: cleanTitle,
          body: cleanBody,
          method,
        }),
      ).unwrap();

      Alert.alert(
        'Success',
        `Post updated successfully using ${method}.`,
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Home'),
          },
        ],
      );
    } catch (error: unknown) {
      Alert.alert(
        'Update failed',
        typeof error === 'string'
          ? error
          : 'Unable to update post. Please try again.',
      );
    }
  };

  if (!post && detailsLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.muted}>Loading post...</Text>
      </View>
    );
  }

  if (!post) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Post not found.</Text>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.buttonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

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
          <Text style={styles.heading}>Edit Post</Text>
          <Text style={styles.subtitle}>Post ID: {postId}</Text>

          <Text style={styles.label}>Update Method</Text>

          <View style={styles.methodRow}>
            <TouchableOpacity
              style={[
                styles.methodButton,
                method === 'PUT' && styles.methodSelected,
              ]}
              onPress={() => setMethod('PUT')}
              disabled={saving}
            >
              <Text
                style={[
                  styles.methodText,
                  method === 'PUT' && styles.methodTextSelected,
                ]}
              >
                PUT
              </Text>

              <Text
                style={[
                  styles.methodDescription,
                  method === 'PUT' && styles.methodTextSelected,
                ]}
              >
                Replace resource
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.methodButton,
                method === 'PATCH' && styles.methodSelected,
              ]}
              onPress={() => setMethod('PATCH')}
              disabled={saving}
            >
              <Text
                style={[
                  styles.methodText,
                  method === 'PATCH' && styles.methodTextSelected,
                ]}
              >
                PATCH
              </Text>

              <Text
                style={[
                  styles.methodDescription,
                  method === 'PATCH' && styles.methodTextSelected,
                ]}
              >
                Partial update
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Post Title</Text>

          <TextInput
            style={styles.titleInput}
            value={title}
            onChangeText={setTitle}
            placeholder="Enter post title"
            placeholderTextColor="#94A3B8"
            maxLength={150}
            editable={!saving}
          />

          <Text style={styles.label}>Post Content</Text>

          <TextInput
            style={styles.bodyInput}
            value={body}
            onChangeText={setBody}
            placeholder="Enter post content"
            placeholderTextColor="#94A3B8"
            multiline
            textAlignVertical="top"
            maxLength={2000}
            editable={!saving}
          />

          <TouchableOpacity
            style={[styles.button, saving && styles.disabledButton]}
            onPress={handleUpdate}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>Save Changes</Text>
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
    borderRadius: 16,
    padding: 22,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  heading: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 6,
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 8,
  },
  methodRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 22,
  },
  methodButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
  },
  methodSelected: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  methodText: {
    color: '#334155',
    fontWeight: '700',
    fontSize: 15,
  },
  methodDescription: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 4,
  },
  methodTextSelected: {
    color: '#FFFFFF',
  },
  titleInput: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 13,
    color: '#0F172A',
    fontSize: 15,
    marginBottom: 20,
  },
  bodyInput: {
    minHeight: 150,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 13,
    color: '#0F172A',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 22,
  },
  button: {
    backgroundColor: '#2563EB',
    paddingVertical: 15,
    borderRadius: 10,
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
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  muted: {
    color: '#64748B',
    marginTop: 10,
  },
  errorText: {
    color: '#B91C1C',
    marginBottom: 16,
  },
});