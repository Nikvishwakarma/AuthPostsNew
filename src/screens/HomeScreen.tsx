
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
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
import { logout } from '../features/auth/authSlice';
import { fetchPosts, type Post } from '../features/posts/postsSlice';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export default function HomeScreen({ navigation }: Props) {
  const dispatch = useDispatch<AppDispatch>();

  const { items, loading, error } = useSelector(
    (state: RootState) => state.posts,
  );
  const user = useSelector((state: RootState) => state.auth.user);

  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    dispatch(fetchPosts());
  }, [dispatch]);

  const filteredPosts = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return items;
    }

    return items.filter(
      post =>
        post.title.toLowerCase().includes(query) ||
        post.body.toLowerCase().includes(query),
    );
  }, [items, search]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);

    try {
      await dispatch(fetchPosts()).unwrap();
    } catch {
      Alert.alert('Error', 'Unable to refresh posts. Please try again.');
    } finally {
      setRefreshing(false);
    }
  }, [dispatch]);

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          try {
            await dispatch(logout()).unwrap();
          } catch {
            Alert.alert('Error', 'Unable to log out. Please try again.');
          }
        },
      },
    ]);
  };

  const renderPost = ({ item }: { item: Post }) => (
    <TouchableOpacity
      style={styles.postCard}
      activeOpacity={0.8}
      onPress={() =>
        navigation.navigate('PostDetails', { postId: item.id })
      }
    >
      <Text style={styles.postTitle} numberOfLines={2}>
        {item.title}
      </Text>

      <Text style={styles.postBody} numberOfLines={3}>
        {item.body}
      </Text>

      <Text style={styles.readMore}>View details →</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.heading}>Posts</Text>
          <Text style={styles.welcome}>
            Welcome{user?.name ? `, ${user.name}` : ''}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.createButton}
        onPress={() => navigation.navigate('CreatePost')}
      >
        <Text style={styles.createButtonText}>+ Create New Post</Text>
      </TouchableOpacity>

      <TextInput
        style={styles.searchInput}
        placeholder="Search posts by title or body..."
        placeholderTextColor="#94A3B8"
        value={search}
        onChangeText={setSearch}
        autoCapitalize="none"
        autoCorrect={false}
      />

      {loading && items.length === 0 ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.statusText}>Loading posts...</Text>
        </View>
      ) : error && items.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={onRefresh}>
            <Text style={styles.retryText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredPosts}
          keyExtractor={item => String(item.id)}
          renderItem={renderPost}
          contentContainerStyle={
            filteredPosts.length === 0
              ? styles.emptyList
              : styles.listContent
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#2563EB"
            />
          }
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              {search.trim()
                ? 'No posts match your search.'
                : 'No posts available.'}
            </Text>
          }
          ListFooterComponent={
            error && items.length > 0 ? (
              <Text style={styles.footerError}>
                Could not refresh posts. Pull down to retry.
              </Text>
            ) : null
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 18,
    paddingBottom: 14,
  },
  headerText: {
    flex: 1,
  },
  heading: {
    fontSize: 26,
    fontWeight: '700',
    color: '#0F172A',
  },
  welcome: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
  },
  logoutButton: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 8,
  },
  logoutText: {
    color: '#B91C1C',
    fontWeight: '600',
  },
  createButton: {
    backgroundColor: '#2563EB',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 14,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
  searchInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#0F172A',
    marginBottom: 14,
  },
  listContent: {
    paddingBottom: 24,
  },
  postCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 1,
  },
  postTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
    textTransform: 'capitalize',
  },
  postBody: {
    color: '#475569',
    fontSize: 14,
    lineHeight: 21,
    marginTop: 8,
  },
  readMore: {
    color: '#2563EB',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 12,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  statusText: {
    color: '#64748B',
    marginTop: 10,
  },
  errorText: {
    color: '#B91C1C',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 14,
    backgroundColor: '#2563EB',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  emptyList: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingBottom: 30,
  },
  emptyText: {
    textAlign: 'center',
    color: '#64748B',
    fontSize: 15,
  },
  footerError: {
    textAlign: 'center',
    color: '#B91C1C',
    paddingVertical: 12,
  },
});