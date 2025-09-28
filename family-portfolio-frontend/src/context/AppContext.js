import React, { createContext, useContext, useReducer } from 'react';

// Initial state
const initialState = {
  theme: 'light',
  page: 'dashboard',
  selectedPerson: null,
  notifications: [],
  user: {
    name: 'John Smith',
    email: 'john.smith@family.com',
    avatar: '/images/avatar1.svg',
    role: 'Family Admin',
    joinDate: '2023-01-15',
    location: 'New York, NY',
    bio: 'Family historian and genealogy enthusiast. Passionate about preserving our family heritage for future generations.'
  },
  loading: false
};

// Reducer function
function appReducer(state, action) {
  switch (action.type) {
    case 'SET_THEME':
      return { ...state, theme: action.payload };
    case 'SET_PAGE':
      return { ...state, page: action.payload };
    case 'SET_SELECTED_PERSON':
      return { ...state, selectedPerson: action.payload };
    case 'ADD_NOTIFICATION':
      return { 
        ...state, 
        notifications: [...state.notifications, action.payload] 
      };
    case 'REMOVE_NOTIFICATION':
      return { 
        ...state, 
        notifications: state.notifications.filter(n => n.id !== action.payload) 
      };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_USER':
      return { ...state, user: action.payload };
    default:
      return state;
  }
}

// Create context
const AppContext = createContext();

// Provider component
export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

// Custom hook to use context
export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}

export default AppContext;