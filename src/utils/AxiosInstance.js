import {Alert} from 'react-native';
import axios from 'axios';
import {BASE_URL, API_KEY_SANDBOX} from './Constants';

const AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'X-Finnhub-Token': API_KEY_SANDBOX,
  },
});

AxiosInstance.interceptors.request.use(
  config => {
    if (__DEV__) {
      console.log('>>>REQUEST', {config});
    }
    return config;
  },
  error => {
    if (__DEV__) {
      console.log('>>>REQUEST ERROR', {error});
    }
    Alert.alert('Something went wrong');
    return Promise.reject(error);
  },
);

AxiosInstance.interceptors.response.use(
  response => {
    const {data} = response || {};
    if (__DEV__) {
      console.log('>>>RESPONSE', {response});
    }

    return data;
  },
  error => {
    if (__DEV__) {
      console.log('>>>RESPONSE ERROR', {error});
    }
    // const { status } = error || {};
    // switch (status) {
    //   case 401: //unatuh
    //   case 403: //forbidden
    //   //Redict to login in future
    //   case 404: //not found
    //   // redirect to not found page
    //   default:
    //     break;
    // }
    return Promise.reject(error);
  },
);

const HttpClient = {
  Post: (url, data, config) => {
    return AxiosInstance.post(url, data, config);
  },
  Get: (url, params) => {
    return AxiosInstance.get(url, {params});
  },
  request: axiosConfig => {
    return AxiosInstance.request(axiosConfig);
  },
};

export default HttpClient;
