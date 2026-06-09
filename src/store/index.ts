import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';
import onboardingReducer from './onboardingSlice';
import authReducer from '../features/auth/authSlice';
import guestsReducer from './guestsSlice';
import tasksReducer from './tasksSlice';
import uiReducer from './uiSlice';

export const store = configureStore({
  reducer: {
    onboarding: onboardingReducer,
    auth: authReducer,
    guests: guestsReducer,
    tasks: tasksReducer,
    ui: uiReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export function useAppDispatch() {
  return useDispatch<AppDispatch>();
}

export function useAppSelector<T>(selector: (state: RootState) => T): T {
  return useSelector(selector);
}
