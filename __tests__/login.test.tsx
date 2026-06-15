import React from 'react';
import { render, screen } from '@testing-library/react';
import LoginPage from '../app/login/page';

// Mock next/navigation router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      prefetch: jest.fn()
    };
  },
}));

// Mock next-auth/react
jest.mock('next-auth/react', () => ({
  signIn: jest.fn(() => Promise.resolve({ error: null })),
  signOut: jest.fn(),
  useSession: jest.fn(() => ({ data: null, status: 'unauthenticated' }))
}));

describe('LoginPage Component Tests', () => {
  it('renders school brand portal headers and welcome greetings', () => {
    render(<LoginPage />);
    expect(screen.getByText('SMART CONNECT')).toBeInTheDocument();
    expect(screen.getByText('GOVERNMENT HIGH SCHOOL PORTAL')).toBeInTheDocument();
    expect(screen.getByText('Welcome Back')).toBeInTheDocument();
  });

  it('renders form input labels and username/password placeholders', () => {
    render(<LoginPage />);
    expect(screen.getByLabelText(/Username or Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText('e.g. admin, student')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
  });

  it('renders demo credentials quick click board buttons', () => {
    render(<LoginPage />);
    expect(screen.getByText('Demo Login Credentials')).toBeInTheDocument();
    expect(screen.getByText('admin / admin123')).toBeInTheDocument();
    expect(screen.getByText('teacher / teacher123')).toBeInTheDocument();
    expect(screen.getByText('parent / parent123')).toBeInTheDocument();
    expect(screen.getByText('student / student123')).toBeInTheDocument();
  });
});
