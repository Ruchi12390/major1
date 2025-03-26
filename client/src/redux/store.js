import { createStore } from 'redux';
import rootReducer from './reducers'; // Adjust the path if needed

const store = createStore(rootReducer);

export default store;
