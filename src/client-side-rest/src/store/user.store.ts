import create from 'zustand';
import jwtDecode from 'jwt-decode';
import { HateoasLink, JwtEnvelope, JwtPayload } from 'services/rest-api-service';

export type AppUser = {
  data: JwtPayload,
  _links: HateoasLink[]
};

type UserStoreState = {
  jwt: string | null;
  user: AppUser | null;
  setUser: (jwt: JwtEnvelope) => void;
  removeUser: () => void;
};

export const getJwtFromStorage = (): string | null => {
  return localStorage.getItem('mthesis-jwt');
};

export const getUserFromStorage = (): AppUser | null => {
  const userStr = localStorage.getItem('mthesis-user');
  return userStr ? JSON.parse(userStr) : null;
};

export const useUserStore = create<UserStoreState>((set) => ({
  jwt: getJwtFromStorage(),
  user: getUserFromStorage(),
  setUser: (envelope: JwtEnvelope) => {
    localStorage.setItem('mthesis-jwt', envelope.access_token);
    const _user: AppUser = {
      data: jwtDecode<JwtPayload>(envelope.access_token),
      _links: envelope._links
    };
    localStorage.setItem('mthesis-user', JSON.stringify(_user));
    set({
      jwt: envelope.access_token,
      user: _user
    });
  },
  removeUser: () => {
    localStorage.removeItem('mthesis-jwt');
    localStorage.removeItem('mthesis-user');
    set({
      jwt: null,
      user: null,
    });
  },
}));