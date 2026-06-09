import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../../store/index';

export type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'unauthenticated';

export interface AuthUser {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
}

export interface AuthState {
  uid: string | null;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  status: AuthStatus;
}

const initialState: AuthState = {
  uid: null,
  displayName: null,
  email: null,
  photoURL: null,
  status: 'idle',
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuthLoading(state) {
      state.status = 'loading';
    },

    setAuthUser(state, action: PayloadAction<AuthUser>) {
      const { uid, displayName, email, photoURL } = action.payload;
      state.uid = uid;
      state.displayName = displayName;
      state.email = email;
      state.photoURL = photoURL;
      state.status = 'authenticated';
    },

    clearAuthUser(state) {
      state.uid = null;
      state.displayName = null;
      state.email = null;
      state.photoURL = null;
      state.status = 'unauthenticated';
    },
  },
});

export const { setAuthLoading, setAuthUser, clearAuthUser } = authSlice.actions;

// Selectors
export const selectAuthStatus = (state: RootState) => state.auth.status;
export const selectAuthUid = (state: RootState) => state.auth.uid;
export const selectAuthUser = (state: RootState) => ({
  uid: state.auth.uid,
  displayName: state.auth.displayName,
  email: state.auth.email,
  photoURL: state.auth.photoURL,
});

export default authSlice.reducer;
