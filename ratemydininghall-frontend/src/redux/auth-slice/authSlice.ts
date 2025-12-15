import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { graphQLRequest } from '@graphQL/graphQLClient';

export type Role = 'admin' | 'user' | null;

type MeResult = { ok: boolean; role: Role };
type LoginResult = { ok: boolean; role: Role };

const meQuery = `
  query Me {
    me { ok role }
  }
`;

const loginMutation = `
  mutation Login($input: LoginInput!) {
    login(input: $input) { ok role }
  }
`;

const logoutMutation = `
  mutation Logout {
    logout
  }
`;

type AuthState = {
  ok: boolean;
  role: Role;
  loading: boolean;
  error: string | null;
};

const initialState: AuthState = {
  ok: false,
  role: null,
  loading: false,
  error: null,
};

export const fetchMe = createAsyncThunk<MeResult>(
  'auth/fetchMe',
  async () => {
    const data = await graphQLRequest<{ me: MeResult }>(meQuery);
    return data.me;
  }
);

export const login = createAsyncThunk<
  LoginResult,
  { username: string; password: string }
>('auth/login', async (vars) => {
  const data = await graphQLRequest<{ login: LoginResult }>(loginMutation, {
    input: vars,
  });
  return data.login;
});

export const logout = createAsyncThunk<boolean>(
  'auth/logout',
  async () => {
    const data = await graphQLRequest<{ logout: boolean }>(logoutMutation);
    return data.logout;
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {},
  extraReducers: (b) => {
    b.addCase(fetchMe.pending, (state) => {
      state.loading = true; state.error = null;
    });
    b.addCase(fetchMe.fulfilled, (state, auth) => {
      state.loading = false;
      state.ok = auth.payload.ok;
      state.role = auth.payload.role;
    });
    b.addCase(fetchMe.rejected, (state, auth) => {
      state.loading = false;
      state.ok = false;
      state.role = null;
      state.error = auth.error.message ?? 'Failed to check session';
    });

    b.addCase(login.pending, (state) => {
      state.loading = true; state.error = null;
    });
    b.addCase(login.fulfilled, (state, auth) => {
      state.loading = false;
      state.ok = auth.payload.ok;
      state.role = auth.payload.role;
      if (!auth.payload.ok) state.error = 'Invalid credentials';
    });
    b.addCase(login.rejected, (state, auth) => {
      state.loading = false;
      state.error = auth.error.message ?? 'Login failed';
    });

    b.addCase(logout.fulfilled, (state) => {
      state.ok = false; state.role = null; state.error = null; state.loading = false;
    });
  },
});

export default authSlice.reducer;
