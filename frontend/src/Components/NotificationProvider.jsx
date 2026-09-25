import { useCallback, useEffect, useState } from 'react';
import api from '../Utils/api';
import { NotificationContext } from '../Utils/notificationStore';
const empty={items:[],unread:0,sections:{},latest:0};
export default function NotificationProvider({children}){
  const[data,setData]=useState(empty);const[error,setError]=useState('');
  const refresh=useCallback(async()=>{const token=localStorage.getItem('coderwanda_token');if(!token){setData(empty);setError('');return;}try{const response=await api.get('/notifications');if(localStorage.getItem('coderwanda_token')===token){setData(response.data);setError('');}}catch{if(localStorage.getItem('coderwanda_token')===token)setError('Notifications could not refresh. Try again.');}},[]);
  useEffect(()=>{const update=()=>{void refresh();};const visible=()=>{if(!document.hidden)update();};update();const timer=setInterval(visible,10000);window.addEventListener('authChanged',update);window.addEventListener('storage',update);document.addEventListener('visibilitychange',visible);return()=>{clearInterval(timer);window.removeEventListener('authChanged',update);window.removeEventListener('storage',update);document.removeEventListener('visibilitychange',visible);};},[refresh]);
  async function read(body){await api.post('/notifications/read',body);await refresh();}
  return <NotificationContext.Provider value={{...data,error,refresh,read}}>{children}</NotificationContext.Provider>;
}
