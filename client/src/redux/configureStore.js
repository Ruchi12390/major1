import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import rootReducer from './reducers'; // Adjust import path to your root reducer file

export const ConfigureStore = () => {
    const store = createStore(
        rootReducer,
        applyMiddleware(thunk)
    );

    return store;
};
