
import React, { useEffect } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { RootStackParamList } from '../navigation/types';
import type { AppDispatch, RootState } from '../app/store';
import {
  clearPostDetails,
  deletePost,
  fetchComments,
  fetchPostDetails,
} from '../features/posts/postsSlice';

type Props = NativeStackScreenProps<RootStackParamList, 'PostDetails'>;

export default function PostDetailsScreen({ route, navigation }: Props) {
  const { postId } = route.params;
  const dispatch = useDispatch<AppDispatch>();

  const { items, selectedPost, comments, detailsLoading, commentsLoading, error, saving } =
    useSelector((state: RootState) => state.posts);

  const postFromList = items.find(item => item.id === postId);
  const post =
    selectedPost?.id === postId ? selectedPost : postFromList ?? null;

  useEffect(() => {
    dispatch(fetchPostDetails(postId));
    dispatch(fetchComments(postId));

    return () => {
      dispatch(clearPostDetails());
    };
  }, [dispatch, postId]);

  const handleDelete = () => {
    Alert.alert(
      'Delete Post',
      'Are you sure you want to delete this post?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await dispatch(deletePost(postId)).unwrap();

              Alert.alert('Success', 'Post deleted successfully.', [
                {
                  text: 'OK',
                  onPress: () => navigation.navigate('Home'),
                },
              ]);
            } catch (deleteError) {
              Alert.alert(
                'Delete failed',
                typeof deleteError === 'string'
                  ? deleteError
                  : 'Unable to delete the post. Please try again.',
              );
            }
          },
        },
      ],
    );
  };

  if (detailsLoading && !post) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.muted}>Loading post details...</Text>
      </View>
    );
  }

  if (!post) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>
          {error || 'Post could not be found.'}
        </Text>
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
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <Text style={styles.postId}>POST #{post.id}</Text>
        <Text style={styles.title}>{post.title}</Text>
        <Text style={styles.body}>{post.body}</Text>

        <Text style={styles.author}>Author ID: {post.userId}</Text>

        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.button, styles.editButton]}
            onPress={() => navigation.navigate('EditPost', { postId })}
            disabled={saving}
          >
            <Text style={styles.buttonText}>Edit Post</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.deleteButton]}
            onPress={handleDelete}
            disabled={saving}
          >
            <Text style={styles.buttonText}>
              {saving ? 'Deleting...' : 'Delete Post'}
            </Text>
          </TouchableOpacity>
        </View>

        {error ? <Text style={styles.inlineError}>{error}</Text> : null}
      </View>

      <Text style={styles.sectionTitle}>Comments</Text>

      {commentsLoading ? (
        <ActivityIndicator
          style={styles.commentLoader}
          size="small"
          color="#2563EB"
        />
      ) : comments.length === 0 ? (
        <Text style={styles.muted}>
          {error ? 'Unable to load comments.' : 'No comments available.'}
        </Text>
      ) : (
        comments.map(comment => (
          <View key={comment.id} style={styles.commentCard}>
            <Text style={styles.commentTitle}>{comment.name}</Text>
            <Text style={styles.commentEmail}>{comment.email}</Text>
            <Text style={styles.commentBody}>{comment.body}</Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    padding: 16,
    paddingBottom: 30,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  postId: {
    color: '#2563EB',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 10,
  },
  title: {
    color: '#0F172A',
    fontSize: 22,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  body: {
    color: '#475569',
    fontSize: 15,
    lineHeight: 24,
    marginTop: 14,
  },
  author: {
    color: '#64748B',
    fontSize: 13,
    marginTop: 16,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editButton: {
    flex: 1,
    backgroundColor: '#2563EB',
  },
  deleteButton: {
    flex: 1,
    backgroundColor: '#DC2626',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  sectionTitle: {
    color: '#0F172A',
    fontSize: 20,
    fontWeight: '700',
    marginTop: 26,
    marginBottom: 14,
  },
  commentLoader: {
    marginTop: 16,
  },
  commentCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  commentTitle: {
    color: '#0F172A',
    fontSize: 15,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  commentEmail: {
    color: '#2563EB',
    fontSize: 12,
    marginTop: 5,
  },
  commentBody: {
    color: '#475569',
    fontSize: 14,
    lineHeight: 21,
    marginTop: 8,
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
    textAlign: 'center',
  },
  errorText: {
    color: '#B91C1C',
    textAlign: 'center',
  },
  inlineError: {
    color: '#B91C1C',
    marginTop: 12,
  },
});
