export const logInSuccess = (data) => ({
  type: 'LOGIN_SUCCESS',
  payload: data
});

export const logOut = () => ({
  type: 'LOG_OUT'
});

// Add other action creators here if needed
// ../redux/actionCreators.js
export const setPersonalDetails = (details) => ({
  type: 'SET_PERSONAL_DETAILS',
  payload: details
});
