import { configureStore } from "@reduxjs/toolkit";
import basketReducer from "../slices/basketSlice";

export const store = configureStore({
  reducer: {
    basket: basketReducer,
  },
});

// 1. Configure Store and define reducer
// 2. Create Slice, give name, define initial state, and define reducer(actions)
// 3. export actions
// 4. Make changes through useSelector
// 5. Dispatch actions by using useDispatch provided by react-redux
// 6. Use useSelector to access items in the store
