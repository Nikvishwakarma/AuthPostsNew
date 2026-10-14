
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api from '../../api/axios';

export type Post = {
  userId: number;
  id: number;
  title: string;
  body: string;
};

export type Comment = {
  postId: number;
  id: number;
  name: string;
  email: string;
  body: string;
};

type PostsState = {
  items: Post[];
  selectedPost: Post | null;
  comments: Comment[];
  loading: boolean;
  detailsLoading: boolean;
  commentsLoading: boolean;
  saving: boolean;
  error: string | null;
};

const initialState: PostsState = {
  items: [],
  selectedPost: null,
  comments: [],
  loading: false,
  detailsLoading: false,
  commentsLoading: false,
  saving: false,
  error: null,
};

// Fetch all posts
export const fetchPosts = createAsyncThunk(
  'posts/fetchPosts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get<Post[]>('/posts');
      return response.data;
    } catch {
      return rejectWithValue('Unable to fetch posts. Please try again.');
    }
  },
);

// Fetch a single post
export const fetchPostDetails = createAsyncThunk(
  'posts/fetchPostDetails',
  async (postId: number, { rejectWithValue }) => {
    try {
      const response = await api.get<Post>(`/posts/${postId}`);
      return response.data;
    } catch {
      return rejectWithValue('Unable to fetch post details.');
    }
  },
);

// Fetch comments using the query parameter
export const fetchComments = createAsyncThunk(
  'posts/fetchComments',
  async (postId: number, { rejectWithValue }) => {
    try {
      const response = await api.get<Comment[]>('/comments', {
        params: { postId },
      });
      return response.data;
    } catch {
      return rejectWithValue('Unable to fetch comments.');
    }
  },
);

// Fetch comments using the nested endpoint
export const fetchCommentsByPath = createAsyncThunk(
  'posts/fetchCommentsByPath',
  async (postId: number, { rejectWithValue }) => {
    try {
      const response = await api.get<Comment[]>(`/posts/${postId}/comments`);
      return response.data;
    } catch {
      return rejectWithValue('Unable to fetch comments.');
    }
  },
);

// Create a post
export const createPost = createAsyncThunk(
  'posts/createPost',
  async (
    post: { title: string; body: string },
    { rejectWithValue },
  ) => {
    try {
      const response = await api.post<Post>('/posts', {
        title: post.title,
        body: post.body,
        userId: 1,
      });

      return response.data;
    } catch {
      return rejectWithValue('Unable to create post.');
    }
  },
);

// Update a post using PUT or PATCH
export const updatePost = createAsyncThunk(
  'posts/updatePost',
  async (
    post: {
      id: number;
      title: string;
      body: string;
      method: 'PUT' | 'PATCH';
    },
    { getState, rejectWithValue },
  ) => {
    try {
      const state = getState() as { posts: PostsState };
      const existingPost = state.posts.items.find(item => item.id === post.id);

      const userId = existingPost?.userId ?? 1;

      const payload =
        post.method === 'PUT'
          ? { id: post.id, title: post.title, body: post.body, userId }
          : { title: post.title, body: post.body };

      const response =
        post.method === 'PUT'
          ? await api.put<Post>(`/posts/${post.id}`, payload)
          : await api.patch<Post>(`/posts/${post.id}`, payload);

      return {
        ...response.data,
        id: post.id,
        userId,
        title: post.title,
        body: post.body,
      };
    } catch {
      return rejectWithValue('Unable to update post.');
    }
  },
);

// Delete a post
export const deletePost = createAsyncThunk(
  'posts/deletePost',
  async (postId: number, { rejectWithValue }) => {
    try {
      await api.delete(`/posts/${postId}`);
      return postId;
    } catch {
      return rejectWithValue('Unable to delete post.');
    }
  },
);

const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    clearPostDetails: state => {
      state.selectedPost = null;
      state.comments = [];
      state.error = null;
    },
    clearPostError: state => {
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
      // Fetch posts
      .addCase(fetchPosts.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.loading = false;
        state.error = String(action.payload ?? action.error.message);
      })

      // Fetch post details
      .addCase(fetchPostDetails.pending, state => {
        state.detailsLoading = true;
        state.error = null;
      })
      .addCase(fetchPostDetails.fulfilled, (state, action) => {
        state.detailsLoading = false;
        state.selectedPost = action.payload;

        const index = state.items.findIndex(
          item => item.id === action.payload.id,
        );

        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(fetchPostDetails.rejected, (state, action) => {
        state.detailsLoading = false;
        state.error = String(action.payload ?? action.error.message);
      })

      // Fetch comments
      .addCase(fetchComments.pending, state => {
        state.commentsLoading = true;
      })
      .addCase(fetchComments.fulfilled, (state, action) => {
        state.commentsLoading = false;
        state.comments = action.payload;
      })
      .addCase(fetchComments.rejected, (state, action) => {
        state.commentsLoading = false;
        state.error = String(action.payload ?? action.error.message);
      })
      .addCase(fetchCommentsByPath.pending, state => {
        state.commentsLoading = true;
      })
      .addCase(fetchCommentsByPath.fulfilled, (state, action) => {
        state.commentsLoading = false;
        state.comments = action.payload;
      })
      .addCase(fetchCommentsByPath.rejected, (state, action) => {
        state.commentsLoading = false;
        state.error = String(action.payload ?? action.error.message);
      })

      // Create post
      .addCase(createPost.pending, state => {
        state.saving = true;
        state.error = null;
      })
      .addCase(createPost.fulfilled, (state, action) => {
        state.saving = false;
        state.items.unshift(action.payload);
      })
      .addCase(createPost.rejected, (state, action) => {
        state.saving = false;
        state.error = String(action.payload ?? action.error.message);
      })

      // Update post
      .addCase(updatePost.pending, state => {
        state.saving = true;
        state.error = null;
      })
      .addCase(updatePost.fulfilled, (state, action) => {
        state.saving = false;
        state.selectedPost = action.payload;

        const index = state.items.findIndex(
          item => item.id === action.payload.id,
        );

        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(updatePost.rejected, (state, action) => {
        state.saving = false;
        state.error = String(action.payload ?? action.error.message);
      })

      // Delete post
      .addCase(deletePost.pending, state => {
        state.saving = true;
        state.error = null;
      })
      .addCase(deletePost.fulfilled, (state, action) => {
        state.saving = false;
        state.items = state.items.filter(
          item => item.id !== action.payload,
        );

        if (state.selectedPost?.id === action.payload) {
          state.selectedPost = null;
        }
      })
      .addCase(deletePost.rejected, (state, action) => {
        state.saving = false;
        state.error = String(action.payload ?? action.error.message);
      });
  },
});

export const { clearPostDetails, clearPostError } = postsSlice.actions;

export default postsSlice.reducer;
