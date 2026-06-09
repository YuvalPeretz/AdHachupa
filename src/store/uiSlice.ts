import { createSlice } from '@reduxjs/toolkit';
import type { RootState } from '.';

export type AddSheet = 'guest' | 'task' | 'expense';

interface UiState {
  addSheetOpen: AddSheet | null;
}

const initialState: UiState = {
  addSheetOpen: null,
};

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    openAddSheet: (state, action: { payload: AddSheet }) => {
      state.addSheetOpen = action.payload;
    },
    closeAddSheet: (state) => {
      state.addSheetOpen = null;
    },
  },
});

export const { openAddSheet, closeAddSheet } = uiSlice.actions;
export const selectAddSheetOpen = (state: RootState) => state.ui.addSheetOpen;
export default uiSlice.reducer;
