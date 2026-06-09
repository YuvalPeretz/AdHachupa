import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../../store/index';

export type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'unauthenticated';

export interface AuthUser {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  coupleId: string | null;
}

export interface AuthState {
  uid: string | null;
  coupleId: string | null;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  status: AuthStatus;
}

const initialState: AuthState = {
  uid: null,
  coupleId: null,
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
      const { uid, coupleId, displayName, email, photoURL } = action.payload;
      state.uid = uid;
      state.coupleId = coupleId;
      state.displayName = displayName;
      state.email = email;
      state.photoURL = photoURL;
      state.status = 'authenticated';
    },

    setCoupleId(state, action: PayloadAction<string>) {
      state.coupleId = action.payload;
    },

    clearAuthUser(state) {
      state.uid = null;
      state.coupleId = null;
      state.displayName = null;
      state.email = null;
      state.photoURL = null;
      state.status = 'unauthenticated';
    },
  },
});

export const { setAuthLoading, setAuthUser, setCoupleId, clearAuthUser } = authSlice.actions;

// Selectors
export const selectAuthStatus = (state: RootState) => state.auth.status;
export const selectAuthUid = (state: RootState) => state.auth.uid;
export const selectCoupleId = (state: RootState) => state.auth.coupleId;
export const selectAuthUser = (state: RootState) => ({
  uid: state.auth.uid,
  coupleId: state.auth.coupleId,
  displayName: state.auth.displayName,
  email: state.auth.email,
  photoURL: state.auth.photoURL,
});

export default authSlice.reducer;
