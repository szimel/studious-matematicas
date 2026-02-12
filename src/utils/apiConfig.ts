// const isProd = process.env.NODE_ENV === 'production';

// TODO: REMOVE THIS
const isProd = true;


export const API_CONFIG = {
  BASE_URL: isProd 
    ? process.env.REACT_APP_API_URL_PROD 
    : process.env.REACT_APP_API_URL_LOCAL,
    
  API_KEY: isProd 
    ? process.env.REACT_APP_API_KEY_PROD 
    : process.env.REACT_APP_API_KEY_LOCAL,
};