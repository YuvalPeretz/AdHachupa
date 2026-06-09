import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { EventType } from '../types';
import type { RootState } from './index';

export type Gender = 'male' | 'female' | 'other';

export interface EventConfig {
  type: EventType;
  guestCount: number;
  date: string | null; // ISO month string e.g. "2026-09" or null if skipped
  skipDate: boolean;
}

export interface CoupleInfo {
  name1: string;
  name2: string;
  gender1: Gender;
  gender2: Gender;
  region: string;
  isKosher: boolean;
}

export interface OnboardingState {
  selectedEventTypes: EventType[];
  eventConfigs: Record<EventType, EventConfig>;
  totalBudget: number | null;
  coupleInfo: CoupleInfo;
}

const defaultEventConfig = (type: EventType): EventConfig => ({
  type,
  guestCount: 100,
  date: null,
  skipDate: false,
});

const initialState: OnboardingState = {
  selectedEventTypes: [],
  eventConfigs: {} as Record<EventType, EventConfig>,
  totalBudget: null,
  coupleInfo: {
    name1: '',
    name2: '',
    gender1: 'female',
    gender2: 'male',
    region: '',
    isKosher: false,
  },
};

const onboardingSlice = createSlice({
  name: 'onboarding',
  initialState,
  reducers: {
    toggleEventType(state, action: PayloadAction<EventType>) {
      const type = action.payload;
      if (state.selectedEventTypes.includes(type)) {
        state.selectedEventTypes = state.selectedEventTypes.filter((t) => t !== type);
        delete state.eventConfigs[type];
      } else {
        state.selectedEventTypes.push(type);
        state.eventConfigs[type] = defaultEventConfig(type);
      }
    },

    setEventGuestCount(
      state,
      action: PayloadAction<{ type: EventType; count: number }>,
    ) {
      const { type, count } = action.payload;
      if (state.eventConfigs[type]) {
        state.eventConfigs[type].guestCount = Math.max(0, count);
      }
    },

    setEventDate(
      state,
      action: PayloadAction<{ type: EventType; date: string | null }>,
    ) {
      const { type, date } = action.payload;
      if (state.eventConfigs[type]) {
        state.eventConfigs[type].date = date;
      }
    },

    setEventSkipDate(
      state,
      action: PayloadAction<{ type: EventType; skip: boolean }>,
    ) {
      const { type, skip } = action.payload;
      if (state.eventConfigs[type]) {
        state.eventConfigs[type].skipDate = skip;
        if (skip) {
          state.eventConfigs[type].date = null;
        }
      }
    },

    setTotalBudget(state, action: PayloadAction<number>) {
      state.totalBudget = action.payload;
    },

    setCoupleInfo(state, action: PayloadAction<Partial<CoupleInfo>>) {
      state.coupleInfo = { ...state.coupleInfo, ...action.payload };
    },

    resetOnboarding() {
      return initialState;
    },
  },
});

export const {
  toggleEventType,
  setEventGuestCount,
  setEventDate,
  setEventSkipDate,
  setTotalBudget,
  setCoupleInfo,
  resetOnboarding,
} = onboardingSlice.actions;

// Selectors
export const selectSelectedEventTypes = (state: RootState) =>
  state.onboarding.selectedEventTypes;

export const selectEventConfigs = (state: RootState) =>
  state.onboarding.eventConfigs;

export const selectEventConfig = (type: EventType) => (state: RootState) =>
  state.onboarding.eventConfigs[type];

export const selectTotalBudget = (state: RootState) =>
  state.onboarding.totalBudget;

export const selectCoupleInfo = (state: RootState) =>
  state.onboarding.coupleInfo;

export default onboardingSlice.reducer;
