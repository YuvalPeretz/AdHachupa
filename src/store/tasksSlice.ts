import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from './index';

export interface TasksState {
  /** The currently-active event pill tab on the Tasks screen */
  activeEventId: string;
  /** The currently-active category filter chip */
  activeCategory: string;
}

const initialState: TasksState = {
  activeEventId: '',
  activeCategory: 'all',
};

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    setActiveTaskEventId(state, action: PayloadAction<string>) {
      state.activeEventId = action.payload;
    },
    setActiveTaskCategory(state, action: PayloadAction<string>) {
      state.activeCategory = action.payload;
    },
  },
});

export const { setActiveTaskEventId, setActiveTaskCategory } = tasksSlice.actions;

export const selectActiveTaskEventId = (state: RootState) => state.tasks.activeEventId;
export const selectActiveTaskCategory = (state: RootState) => state.tasks.activeCategory;

export default tasksSlice.reducer;
