// Separate token namespaces for admin and user sessions
type TokenScope = 'admin' | 'user';

function createScopedStorage(scope: TokenScope) {
    const prefix = scope === 'admin' ? 'admin_' : 'user_';
    const ACCESS_TOKEN_KEY = `${prefix}accessToken`;
    const REFRESH_TOKEN_KEY = `${prefix}refreshToken`;
    const USER_KEY = `${prefix}user`;

    return {
        getToken: (): string | null => localStorage.getItem(ACCESS_TOKEN_KEY),
        setToken: (token: string): void => localStorage.setItem(ACCESS_TOKEN_KEY, token),
        getRefreshToken: (): string | null => localStorage.getItem(REFRESH_TOKEN_KEY),
        setRefreshToken: (token: string): void => localStorage.setItem(REFRESH_TOKEN_KEY, token),
        getUser: (): string | null => localStorage.getItem(USER_KEY),
        setUser: (user: string): void => localStorage.setItem(USER_KEY, user),
        clear: (): void => {
            localStorage.removeItem(ACCESS_TOKEN_KEY);
            localStorage.removeItem(REFRESH_TOKEN_KEY);
            localStorage.removeItem(USER_KEY);
        },
    };
}

export const adminTokenStorage = createScopedStorage('admin');
export const userTokenStorage = createScopedStorage('user');

// Helper: get the right storage based on current URL path
export function getTokenStorageByPath(path?: string) {
    const currentPath = path || window.location.pathname;
    return currentPath.startsWith('/admin') ? adminTokenStorage : userTokenStorage;
}

// Legacy compatibility: default tokenStorage delegates to user storage
// (for any code that still imports tokenStorage directly)
export const tokenStorage = userTokenStorage;
