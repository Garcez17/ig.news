import { render, screen } from '@testing-library/react';
import { mocked } from 'jest-mock';
import { useSession } from 'next-auth/client';
import { SignInButton } from '.';

jest.mock('next/router', () => {
  return {
    useRouter() {
      return {
        asPath: '/',
      }
    }
  }
})

jest.mock('next-auth/client');

describe('SignInButton Component', () => {
  it('renders correctly when user isnt authenticated', () => {
    const useSessionMocked = mocked(useSession);

    useSessionMocked.mockReturnValueOnce([null, false]);
    
    render(<SignInButton />);
  
    expect(screen.getByText('Sign in with GitHub')).toBeInTheDocument();
  });

  it('renders correctly when user isnt authenticated', () => {
    const useSessionMocked = mocked(useSession);

    useSessionMocked.mockReturnValueOnce([{
      user: {
        name: 'John Doe'
      },
      expires: 'test-expires'
    }, false]);
    
    render(<SignInButton />);
  
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });
})