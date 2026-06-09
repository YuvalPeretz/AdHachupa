import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from './index';

export interface GuestsState {
  /** The currently-active event pill tab on the Guests screen */
  activeEventId: string;
}

const initialState: GuestsState = {
  activeEventId: '',
};

const guestsSlice = createSlice({
  name: 'guests',
  initialState,
  reducers: {
    setActiveGuestEventId(state, action: PayloadAction<string>) {
      state.activeEventId = action.payload;
    },
  },
});

export const { setActiveGuestEventId } = guestsSlice.actions;

export const selectActiveGuestEventId = (state: RootState) =>
  state.guests.activeEventId;

export default guestsSlice.reducer;
