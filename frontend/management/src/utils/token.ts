const TOKEN_KEY = 'lili_mgmt_token';
const USER_KEY = 'lili_mgmt_user';

export const tokenStorage = {
    getToken: (): string | null => localStorage.getItem(TOKEN_KEY),
    setToken: (token: string): void => localStorage.setItem(TOKEN_KEY, token),
    removeToken: (): void => localStorage.removeItem(TOKEN_KEY),
    getUser: (): string | null => localStorage.getItem(USER_KEY),
    setUser: (user: string): void => localStorage.setItem(USER_KEY, user),
    removeUser: (): void => localStorage.removeItem(USER_KEY),
    clear: (): void => {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
    },
};
