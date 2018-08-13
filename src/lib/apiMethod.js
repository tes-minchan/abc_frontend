import axios from 'axios';

const BASE_URL = "http://localhost:3100/api/";
// const BASE_URL = "http://www.xchainz.com:3000//api/";





export const signin = (data) =>{

  const baseUrl = BASE_URL+'auth/login';
  return axios.post(
      baseUrl, 
      data.data
    ).then(res => res.data)
    .catch(error => {
      throw error
    });
}

export const signup = (data) =>{
  const baseUrl = BASE_URL+'auth/register';
  return axios.post(
      baseUrl, 
      data.data
    ).then(res => res.data)
    .catch(error => {
      throw error
    });
}

export const getBalance = () => {
  const baseUrl = BASE_URL+'market/all-balance';
  return axios.get(
      baseUrl, 
      {
        headers: {
        "x-access-token": sessionStorage.getItem('token')
        }
      }
    ).then(res => res.data)
    .catch(error => {
      throw error
    }); 
}

