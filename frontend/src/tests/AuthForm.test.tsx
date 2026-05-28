import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import AuthForm from '../components/AuthForm';

vi.mock('../services/api', () => ({
  authService: {
    login: vi.fn(),
    register: vi.fn(),
  },
  getApiErrorMessage: vi.fn(),
}));

describe('AuthForm', () => {
  it('renderuje domyślnie formularz logowania', () => {
    render(<AuthForm onAuthSuccess={() => {}} />);

    expect(
      screen.getByRole('heading', { name: /zaloguj się do konta/i })
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument();
    expect(screen.queryByPlaceholderText('Jan Kowalski')).not.toBeInTheDocument();
  });

  it('po przełączeniu na rejestrację pokazuje pole "Imię"', () => {
    render(<AuthForm onAuthSuccess={() => {}} />);

    fireEvent.click(
      screen.getByRole('button', { name: /zarejestruj się, jeśli nie masz konta/i })
    );

    expect(
      screen.getByRole('heading', { name: /utwórz nowe konto/i })
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Jan Kowalski')).toBeInTheDocument();
  });

  it('pokazuje błąd walidacji gdy rejestracja bez imienia', () => {
    const { container } = render(<AuthForm onAuthSuccess={() => {}} />);

    fireEvent.click(
      screen.getByRole('button', { name: /zarejestruj się, jeśli nie masz konta/i })
    );
    fireEvent.submit(container.querySelector('form')!);

    expect(screen.getByText(/imię jest wymagane przy rejestracji/i)).toBeInTheDocument();
  });
});
