import axios from 'axios';
import { API_URL } from "config";

export const signin = (data) =>{

  const baseUrl = API_URL+'auth/login';
  return axios.post(
      baseUrl, 
      data.data
    ).then(res => res.data)
    .catch(error => {
      throw error
    });
}

export const signup = (data) =>{
  const baseUrl = API_URL+'auth/register';
  return axios.post(
      baseUrl, 
      data.data
    ).then(res => res.data)
    .catch(error => {
      throw error
    });
}

export const getBalance = () => {
  const baseUrl = API_URL+'market/all-balance';
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


export const orderSend = (data) => {

  const baseUrl = API_URL+'market/ordersend';
  return axios.post(
    baseUrl, 
    data,
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

