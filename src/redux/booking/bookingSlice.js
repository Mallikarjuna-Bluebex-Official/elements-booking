import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  selectedDate: "",
  services: [],
  addOns: [],
  userInfo: {},
  priceSummary: {},
};

const bookingSlice = createSlice({
  name: "booking",
  initialState,

  reducers: {
    setSelectedDate: (state, action) => {
      state.selectedDate = action.payload;
    },

    setServices: (state, action) => {
      state.services = action.payload;
    },

    setAddOns: (state, action) => {
      state.addOns = action.payload;
    },

    updateBookingData: (state, action) => {
    return {
      ...state,
      ...action.payload,
    };
  },

    clearBooking: () => initialState,
  },
});

export const {
  setSelectedDate,
  setServices,
  setAddOns,
  updateBookingData,
  clearBooking,
} = bookingSlice.actions;

export default bookingSlice.reducer;