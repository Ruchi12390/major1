import { combineReducers } from 'redux';
import resumeReducer from './resumeReducer'; // Ensure the path is correct

const rootReducer = combineReducers({
  resume: resumeReducer
  // Add other reducers here if needed
});

export default rootReducer;
