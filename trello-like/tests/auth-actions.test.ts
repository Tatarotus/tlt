import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { login, register, logout } from '../app/actions/auth-actions';
import { db } from '@/db';
import { getSession, createSession, deleteSession } from '@/lib/session';
import bcrypt from 'bcryptjs';
import { redirect } from 'next/navigation';

jest.mock('@/db', () => ({
  db: {
    query: {
      users: { findFirst: jest.fn() },
    },
    insert: jest.fn(),
  },
}));

jest.mock('@/lib/session', () => ({
  getSession: jest.fn(),
  createSession: jest.fn(),
  deleteSession: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
}));

jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

describe('auth server actions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const createFormData = (data: Record<string, string>) => {
    const fd = new FormData();
    for (const [key, value] of Object.entries(data)) {
      fd.append(key, value);
    }
    return fd;
  };

  describe('login', () => {
    it('returns error if user not found', async () => {
      (db.query.users.findFirst as jest.Mock).mockResolvedValue(null);
      const result = await login(createFormData({ email: 'test@example.com', password: 'password' }));
      expect(result).toEqual({ error: 'Invalid credentials' });
    });

    it('returns error if password incorrect', async () => {
      (db.query.users.findFirst as jest.Mock).mockResolvedValue({ id: '1', password: 'hashed' });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      const result = await login(createFormData({ email: 'test@example.com', password: 'password' }));
      expect(result).toEqual({ error: 'Invalid credentials' });
    });

    it('logs in successfully and sets session', async () => {
      (db.query.users.findFirst as jest.Mock).mockResolvedValue({ id: '1', password: 'hashed' });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      
      const result = await login(createFormData({ email: 'test@example.com', password: 'password' }));
      
      expect(createSession).toHaveBeenCalledWith('1');
      expect(redirect).toHaveBeenCalledWith('/');
      expect(result).toBeUndefined(); // Redirect throws or returns undefined in Next.js test mock
    });
  });

  describe('register', () => {
    it('returns error if email exists', async () => {
      (db.query.users.findFirst as jest.Mock).mockResolvedValue({ id: '1' });
      const result = await register(createFormData({ name: 'Test', email: 'test@example.com', password: 'password' }));
      expect(result).toEqual({ error: 'Email already in use' });
    });

    it('registers user and sets session', async () => {
      (db.query.users.findFirst as jest.Mock).mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');
      const returning = jest.fn().mockResolvedValue([{ id: 'new-user' }]);
      const values = jest.fn().mockReturnValue({ returning });
      (db.insert as jest.Mock).mockReturnValue({ values });
      
      const result = await register(createFormData({ name: 'Test', email: 'test@example.com', password: 'password' }));
      
      expect(db.insert).toHaveBeenCalled();
      expect(createSession).toHaveBeenCalledWith('new-user');
      expect(redirect).toHaveBeenCalledWith('/');
      expect(result).toBeUndefined();
    });
    
    it('catches database errors during registration', async () => {
      (db.query.users.findFirst as jest.Mock).mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');
      (db.insert as jest.Mock).mockImplementation(() => { throw new Error('DB Error') });
      
      try {
        await register(createFormData({ name: 'Test', email: 'test@example.com', password: 'password' }));
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('logout', () => {
    it('clears session', async () => {
      await logout();
      expect(deleteSession).toHaveBeenCalled();
      expect(redirect).toHaveBeenCalledWith('/login');
    });
  });
});

