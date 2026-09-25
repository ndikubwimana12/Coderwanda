import { createContext, useContext } from 'react';
export const NotificationContext=createContext({items:[],unread:0,sections:{},latest:0,error:'',refresh:()=>{},read:async()=>{}});
export const useNotifications=()=>useContext(NotificationContext);
