import AsyncStorage from '@react-native-async-storage/async-storage';

const USER_KEY = 'APP_USER';

export const saveUser = async (email: string, password: string) => {
  const user = { email, password };
  await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const getUser = async () => {
  const userStr = await AsyncStorage.getItem(USER_KEY);
  return userStr ? JSON.parse(userStr) : null;
};
