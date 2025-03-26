const initialState = {
    token: null,
    data: null
  };
  
  const resumeReducer = (state = initialState, action) => {
    switch (action.type) {
      case 'LOG_IN_SUCCESS':
        return {
          ...state,
          token: action.payload
        };
      case 'LOG_OUT':
        return {
          ...state,
          token: null
        };
      default:
        return state;
    }
  };
  
  export default resumeReducer;
  