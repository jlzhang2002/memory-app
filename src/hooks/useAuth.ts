import { useState, useEffect } from 'react';
import { User, AuthState } from '../types';

const STORAGE_KEY = 'auth_state';
const USERS_KEY = 'registered_users';

interface RegisteredUser {
  id: string;
  username: string;
  email: string;
  password: string;
  createdAt: string;
  lastLogin: string;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          isAuthenticated: parsed.isAuthenticated || false,
          user: parsed.user || null,
          token: parsed.token || null
        };
      }
    } catch (error) {
      console.error('Error loading auth state:', error);
    }
    return {
      isAuthenticated: false,
      user: null,
      token: null
    };
  });

  const saveAuthState = (state: AuthState) => {
    setAuthState(state);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  };

  const getRegisteredUsers = (): RegisteredUser[] => {
    try {
      const stored = localStorage.getItem(USERS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading users:', error);
      return [];
    }
  };

  const saveRegisteredUsers = (users: RegisteredUser[]) => {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  };

  const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  };

  const generateToken = () => {
    return btoa(Date.now().toString() + Math.random().toString());
  };

  const hashPassword = (password: string): string => {
    // 简单的密码哈希（生产环境应使用更安全的方法）
    return btoa(password + 'salt_key_2024');
  };

  const register = async (username: string, email: string, password: string): Promise<{ success: boolean; message: string }> => {
    try {
      const users = getRegisteredUsers();
      
      // 检查用户名是否已存在
      if (users.some(user => user.username === username)) {
        return { success: false, message: '用户名已存在' };
      }
      
      // 检查邮箱是否已存在
      if (users.some(user => user.email === email)) {
        return { success: false, message: '邮箱已被注册' };
      }

      const newUser: RegisteredUser = {
        id: generateId(),
        username,
        email,
        password: hashPassword(password),
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString()
      };

      users.push(newUser);
      saveRegisteredUsers(users);

      // 自动登录
      const token = generateToken();
      const authUser: User = {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        createdAt: newUser.createdAt,
        lastLogin: newUser.lastLogin
      };

      saveAuthState({
        isAuthenticated: true,
        user: authUser,
        token
      });

      return { success: true, message: '注册成功' };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, message: '注册失败，请重试' };
    }
  };

  const login = async (username: string, password: string): Promise<{ success: boolean; message: string }> => {
    try {
      const users = getRegisteredUsers();
      const hashedPassword = hashPassword(password);
      
      const user = users.find(u => 
        (u.username === username || u.email === username) && 
        u.password === hashedPassword
      );

      if (!user) {
        return { success: false, message: '用户名或密码错误' };
      }

      // 更新最后登录时间
      user.lastLogin = new Date().toISOString();
      saveRegisteredUsers(users);

      const token = generateToken();
      const authUser: User = {
        id: user.id,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin
      };

      saveAuthState({
        isAuthenticated: true,
        user: authUser,
        token
      });

      return { success: true, message: '登录成功' };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: '登录失败，请重试' };
    }
  };

  const logout = () => {
    saveAuthState({
      isAuthenticated: false,
      user: null,
      token: null
    });
  };

  const updateProfile = async (updates: Partial<Pick<User, 'username' | 'email'>>): Promise<{ success: boolean; message: string }> => {
    if (!authState.user) {
      return { success: false, message: '用户未登录' };
    }

    try {
      const users = getRegisteredUsers();
      const userIndex = users.findIndex(u => u.id === authState.user!.id);
      
      if (userIndex === -1) {
        return { success: false, message: '用户不存在' };
      }

      // 检查用户名冲突
      if (updates.username && updates.username !== authState.user.username) {
        if (users.some(u => u.username === updates.username && u.id !== authState.user!.id)) {
          return { success: false, message: '用户名已存在' };
        }
      }

      // 检查邮箱冲突
      if (updates.email && updates.email !== authState.user.email) {
        if (users.some(u => u.email === updates.email && u.id !== authState.user!.id)) {
          return { success: false, message: '邮箱已被使用' };
        }
      }

      // 更新用户信息
      if (updates.username) users[userIndex].username = updates.username;
      if (updates.email) users[userIndex].email = updates.email;
      
      saveRegisteredUsers(users);

      // 更新认证状态
      const updatedUser = { ...authState.user, ...updates };
      saveAuthState({
        ...authState,
        user: updatedUser
      });

      return { success: true, message: '资料更新成功' };
    } catch (error) {
      console.error('Profile update error:', error);
      return { success: false, message: '更新失败，请重试' };
    }
  };

  return {
    authState,
    login,
    register,
    logout,
    updateProfile
  };
}