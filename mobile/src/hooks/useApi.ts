import {useAuth} from '../context/AuthContext';
import {fetchAuthSession} from 'aws-amplify/auth';
import {ApiClient} from '@shared/services/api';
import {API_URL} from '@env';

const apiClient = new ApiClient(API_URL || 'http://localhost:3000/api');

export function useApi() {
  const {refreshSession} = useAuth();

  const get = async (endpoint: string) => {
    try {
      const session = await fetchAuthSession();
      return await apiClient.get(endpoint, session.tokens?.idToken?.toString());
    } catch (error: any) {
      if (error.status === 401) {
        await refreshSession();
        const session = await fetchAuthSession();
        return await apiClient.get(endpoint, session.tokens?.idToken?.toString());
      }
      throw error;
    }
  };

  const post = async (endpoint: string, data: any) => {
    try {
      const session = await fetchAuthSession();
      return await apiClient.post(endpoint, data, session.tokens?.idToken?.toString());
    } catch (error: any) {
      if (error.status === 401) {
        await refreshSession();
        const session = await fetchAuthSession();
        return await apiClient.post(endpoint, data, session.tokens?.idToken?.toString());
      }
      throw error;
    }
  };

  return {get, post};
}
