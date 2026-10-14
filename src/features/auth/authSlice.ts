
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type User = {
  name: string;
  email: string;
};

type AuthState = {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
};

type RegisterPayload = User & {
  password: string;
};

const MOCK_USER_KEY = 'mock_user';
const AUTH_SESSION_KEY = 'auth_session';

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: true,
  error: null,
};

// Restore login session when the app starts
export const restoreSession = createAsyncThunk(
  'auth/restoreSession',
  async () => {
    const session = await AsyncStorage.getItem(AUTH_SESSION_KEY);
    return session ? (JSON.parse(session) as User) : null;
  },
);

// Mock signup
export const registerMockUser = createAsyncThunk(
  'auth/register',
  async (payload: RegisterPayload, { rejectWithValue }) => {
    try {
      const existingUser = await AsyncStorage.getItem(MOCK_USER_KEY);

      if (existingUser) {
        const parsedUser = JSON.parse(existingUser) as RegisterPayload;

        if (parsedUser.email.toLowerCase() === payload.email.toLowerCase()) {
          return rejectWithValue('This email is already registered.');
        }
      }

      await AsyncStorage.setItem(MOCK_USER_KEY, JSON.stringify(payload));

      return {
        name: payload.name,
        email: payload.email,
      };
    } catch {
      return rejectWithValue('Unable to register. Please try again.');
    }
  },
);

// Mock login
export const loginMockUser = createAsyncThunk(
  'auth/login',
  async (
    credentials: { email: string; password: string },
    { rejectWithValue },
  ) => {
    try {
      const savedUser = await AsyncStorage.getItem(MOCK_USER_KEY);

      if (!savedUser) {
        return rejectWithValue('No account found. Please sign up first.');
      }

      const userData = JSON.parse(savedUser) as RegisterPayload;

      if (
        userData.email.toLowerCase() !== credentials.email.toLowerCase() ||
        userData.password !== credentials.password
      ) {
        return rejectWithValue('Invalid email or password.');
      }

      const user: User = {
        name: userData.name,
        email: userData.email,
      };

      await AsyncStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(user));

      return user;
    } catch {
      return rejectWithValue('Unable to login. Please try again.');
    }
  },
);

// Logout
export const logout = createAsyncThunk('auth/logout', async () => {
  await AsyncStorage.removeItem(AUTH_SESSION_KEY);
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuthError: state => {
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(restoreSession.pending, state => {
        state.loading = true;
      })
      .addCase(restoreSession.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = Boolean(action.payload);
        state.error = null;
      })
      .addCase(restoreSession.rejected, state => {
        state.loading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.error = 'Unable to restore session.';
      })
      .addCase(registerMockUser.pending, state => {
        state.error = null;
      })
      .addCase(registerMockUser.fulfilled, state => {
        state.error = null;
      })
      .addCase(registerMockUser.rejected, (state, action) => {
        state.error = String(action.payload ?? action.error.message);
      })
      .addCase(loginMockUser.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginMockUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginMockUser.rejected, (state, action) => {
        state.loading = false;
        state.error = String(action.payload ?? action.error.message);
      })
      .addCase(logout.fulfilled, state => {
        state.user = null;
        state.isAuthenticated = false;
        state.error = null;
      })
      .addCase(logout.rejected, (state, action) => {
        state.error = action.error.message ?? 'Unable to logout.';
      });
  },
});

export const { clearAuthError } = authSlice.actions;

export default authSlice.reducer;
