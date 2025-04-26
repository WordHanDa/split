// Api.js - Shared API utility for handling ngrok and API requests
import Axios from 'axios';
import { toast } from 'react-toastify';

// Track if ngrok warning has been shown to prevent multiple alerts
let hasShownNgrokWarning = false;

/**
 * Show instructions for validating the ngrok tunnel
 * @param {string} hostname - The base URL of the ngrok tunnel
 */
const showNgrokInstructions = (hostname) => {
  if (hasShownNgrokWarning) return;
  
  hasShownNgrokWarning = true;
  
  // Create a simple alert message
  const message = `
請先完成 ngrok 驗證:
1. 請在新視窗開啟: ${hostname}
2. 點擊 "Visit Site" 按鈕
3. 返回此頁面，重新整理頁面

Do you want to open the ngrok URL now?
  `;
  
  if (window.confirm(message)) {
    window.open(hostname, '_blank');
  }
  
  // Also show a toast message for those who missed the alert
  try {
    toast.info("請完成 ngrok 驗證後重新整理頁面", {
      autoClose: false,
      position: "top-center"
    });
  } catch (e) {
    // Toast might not be available in all components
    console.warn("Toast notification failed:", e);
  }
  
  // Store in sessionStorage that we've shown the warning
  try {
    sessionStorage.setItem('ngrokWarningShown', 'true');
  } catch (e) {
    console.warn("Could not store in sessionStorage:", e);
  }
};

/**
 * Reset the ngrok warning flag (for testing or after page refresh)
 */
export const resetNgrokWarning = () => {
  hasShownNgrokWarning = false;
  try {
    sessionStorage.removeItem('ngrokWarningShown');
  } catch (e) {
    console.warn("Could not remove from sessionStorage:", e);
  }
};

/**
 * Core API request function that handles ngrok warnings
 * @param {Object} options - Request options
 * @returns {Promise<any>} API response or empty array/object
 */
export const apiRequest = async (options) => {
    const { 
        url, 
        method = 'GET', 
        data = null, 
        params = null,
        headers = {},
        defaultValue = method === 'GET' ? [] : { success: false } 
    } = options;

    try {
        const response = await Axios({
            url,
            method,
            data,
            params,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Bypass-Tunnel-Reminder': 'true',
                'ngrok-skip-browser-warning': 'true',
                ...headers
            },
            timeout: 10000,
            validateStatus: (status) => {
                return (status >= 200 && status < 300) || status === 404;
            }
        });

        // 處理 ngrok 的 HTML 回應
        if (typeof response.data === 'string' && response.data.includes('<!DOCTYPE html>')) {
            console.warn('Received HTML response, might be ngrok warning page');
            return defaultValue;
        }

        // 處理 404 回應
        if (response.status === 404) {
            console.warn('Resource not found:', url);
            return defaultValue;
        }

        return response.data;
    } catch (error) {
        console.error("API request failed:", {
            url,
            error: error.message,
            response: error.response?.data
        });

        // 如果是網路錯誤或 timeout，返回預設值
        return defaultValue;
    }
};

// Common API functions used across components
export const fetchGroups = async (hostname) => {
  return apiRequest({
    url: `${hostname}/GROUP`,
    method: 'GET',
    defaultValue: []
  });
};

export const updateGroup = async (hostname, groupId, name) => {
  return apiRequest({
    url: `${hostname}/updateGroup`,
    method: 'PUT',
    data: { group_id: groupId, name },
    defaultValue: { success: false }
  });
};

export const deleteGroup = async (hostname, groupId) => {
  return apiRequest({
    url: `${hostname}/api/groups/${groupId}`,
    method: 'DELETE',
    defaultValue: { success: false }
  });
};

export const fetchUsers = async (hostname, groupId = null) => {
  const url = groupId 
    ? `${hostname}/getUsersByGroupId?group_id=${groupId}`
    : `${hostname}/USER`;
    
  return apiRequest({
    url,
    method: 'GET',
    defaultValue: []
  });
};

export const addUserToGroup = async (hostname, groupId, userId) => {
  return apiRequest({
    url: `${hostname}/addGroupUser`,
    method: 'POST',
    data: { group_id: groupId, user_id: userId },
    defaultValue: { success: false }
  });
};

export const createGroup = async (hostname, name) => {
  return apiRequest({
    url: `${hostname}/createGroup`,
    method: 'POST',
    data: { name },
    defaultValue: { success: false }
  });
};

export const createBill = async (hostname, billData) => {
  return apiRequest({
    url: `${hostname}/createBill`,
    method: 'POST',
    data: billData,
    defaultValue: { success: false }
  });
};

export const createSplitRecord = async (hostname, billId, percentages) => {
  return apiRequest({
    url: `${hostname}/createSplitRecord`,
    method: 'POST',
    data: { bill_id: billId, percentages },
    defaultValue: { success: false }
  });
};

export const createItem = async (hostname, billId, items) => {
  return apiRequest({
    url: `${hostname}/createItem`,
    method: 'POST',
    data: { bill_id: billId, items },
    defaultValue: { success: false }
  });
};

export const fetchRates = async (hostname) => {
  return apiRequest({
    url: `${hostname}/RATE`,
    method: 'GET',
    defaultValue: []
  });
};

export const fetchUserRates = async (hostname, userId) => {
  return apiRequest({
    url: `${hostname}/YOUR_RATE`,
    method: 'GET',
    params: { user_id: userId },
    defaultValue: []
  });
};

export const createRate = async (hostname, JPY, NTD, userId) => {
  return apiRequest({
    url: `${hostname}/createRate`,
    method: 'POST',
    data: { JPY, NTD, user_id: parseInt(userId, 10) },
    defaultValue: { success: false }
  });
};