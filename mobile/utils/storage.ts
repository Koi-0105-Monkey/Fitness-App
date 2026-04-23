import * as SecureStore from 'expo-secure-store';

/**
 * Lưu giá trị vào SecureStore (encrypted on device)
 */
export const setItem = async (key: string, value: string): Promise<void> => {
  await SecureStore.setItemAsync(key, value);
};

/**
 * Lấy giá trị từ SecureStore
 */
export const getItem = async (key: string): Promise<string | null> => {
  return SecureStore.getItemAsync(key);
};

/**
 * Xoá giá trị khỏi SecureStore
 */
export const removeItem = async (key: string): Promise<void> => {
  await SecureStore.deleteItemAsync(key);
};

/**
 * Xoá toàn bộ auth tokens (dùng khi logout)
 */
export const clearTokens = async (): Promise<void> => {
  await removeItem('accessToken');
  await removeItem('refreshToken');
};
