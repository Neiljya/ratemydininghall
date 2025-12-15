import type { RootState } from '../store';

export const selectAuth = (state: RootState) => state.auth;
export const selectIsAuthed = (state: RootState) => state.auth.ok;
export const selectAuthRole = (state: RootState) => state.auth.role;
export const selectAuthLoading = (state: RootState) => state.auth.loading;
export const selectAuthError = (state: RootState) => state.auth.error;
export const selectIsAdmin = (state: RootState) =>
    state.auth.role === 'admin';