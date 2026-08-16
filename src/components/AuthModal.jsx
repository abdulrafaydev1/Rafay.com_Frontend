import { useEffect, useState } from 'react';
import './AuthModal.css';

const emptyForm = {
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getFriendlyError(message) {
  const normalized = message.toLowerCase();

  if (normalized.includes('user not found') || normalized.includes('account not found')) {
    return 'No account was found with that email.';
  }

  if (normalized.includes('incorrect password')) {
    return 'The password you entered is incorrect.';
  }

  if (normalized.includes('email already exists')) {
    return 'An account with this email already exists.';
  }

  if (normalized.includes('weak password')) {
    return 'Password is too weak. Use at least 8 characters.';
  }

  if (normalized.includes('network')) {
    return 'Network error. Please try again.';
  }

  if (normalized.includes('backend') || normalized.includes('unavailable')) {
    return 'Authentication service is temporarily unavailable.';
  }

  return message;
}

export default function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  const [authMode, setAuthMode] = useState('signin');
  const [formData, setFormData] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    if (!isOpen) return undefined;

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) {
      setFormData(emptyForm);
      setErrors({});
      setShowPassword(false);
      setShowConfirmPassword(false);
      setStatusMessage('');
      setIsSubmitting(false);
      return;
    }

    setAuthMode('signin');
    setFormData(emptyForm);
    setErrors({});
    setShowPassword(false);
    setShowConfirmPassword(false);
    setStatusMessage('');
    setIsSubmitting(false);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '', submit: '' }));
  };

  const validateSignin = () => {
    const nextErrors = {};

    if (!formData.email.trim()) {
      nextErrors.email = 'Email is required.';
    } else if (!emailRegex.test(formData.email.trim())) {
      nextErrors.email = 'Enter a valid email address.';
    }

    if (!formData.password) {
      nextErrors.password = 'Password is required.';
    } else if (formData.password.length < 8) {
      nextErrors.password = 'Password must be at least 8 characters.';
    }

    return nextErrors;
  };

  const validateSignup = () => {
    const nextErrors = {};

    if (!formData.name.trim()) {
      nextErrors.name = 'Full name is required.';
    }

    if (!formData.email.trim()) {
      nextErrors.email = 'Email is required.';
    } else if (!emailRegex.test(formData.email.trim())) {
      nextErrors.email = 'Enter a valid email address.';
    }

    if (!formData.password) {
      nextErrors.password = 'Password is required.';
    } else if (formData.password.length < 8) {
      nextErrors.password = 'Password must be at least 8 characters.';
    }

    if (!formData.confirmPassword) {
      nextErrors.confirmPassword = 'Please confirm your password.';
    } else if (formData.confirmPassword !== formData.password) {
      nextErrors.confirmPassword = 'Passwords do not match.';
    }

    return nextErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validation = authMode === 'signin' ? validateSignin() : validateSignup();
    setErrors(validation);

    if (Object.keys(validation).length > 0) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});
    setStatusMessage('');

    try {
      await new Promise((resolve) => setTimeout(resolve, 800));

      const storageKey = 'shopco_users';
      const existingUsers = JSON.parse(localStorage.getItem(storageKey) || '[]');

      if (authMode === 'signin') {
        const user = existingUsers.find(
          (item) => item.email.toLowerCase() === formData.email.trim().toLowerCase(),
        );

        if (!user) {
          throw new Error('User not found');
        }

        if (user.password !== formData.password) {
          throw new Error('Incorrect password');
        }

        const publicUser = {
          name: user.name,
          email: user.email,
        };

        localStorage.setItem('shopco_current_user', JSON.stringify(publicUser));
        onAuthSuccess?.(publicUser);
        onClose();
        return;
      }

      const emailExists = existingUsers.some(
        (item) => item.email.toLowerCase() === formData.email.trim().toLowerCase(),
      );

      if (emailExists) {
        throw new Error('Email already exists');
      }

      const newUser = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      };

      existingUsers.push(newUser);
      localStorage.setItem(storageKey, JSON.stringify(existingUsers));

      const publicUser = {
        name: newUser.name,
        email: newUser.email,
      };

      localStorage.setItem('shopco_current_user', JSON.stringify(publicUser));
      onAuthSuccess?.(publicUser);
      onClose();
    } catch (error) {
      setErrors({
        submit: getFriendlyError(error.message || 'Authentication failed. Please try again.'),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const switchMode = (mode) => {
    setAuthMode(mode);
    setErrors({});
    setStatusMessage('');
  };

  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="auth-backdrop" onClick={handleBackdropClick}>
      <div
        className="auth-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Authentication dialog"
        onClick={(event) => event.stopPropagation()}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button type="button" className="auth-close" onClick={onClose} aria-label="Close authentication modal">
          ×
        </button>

        <div className="auth-brand">SHOP.CO</div>

        {authMode === 'signin' ? (
          <>
            <h2 className="auth-title">Welcome back</h2>
            <p className="auth-subtitle">Sign in to track orders and keep your cart.</p>
          </>
        ) : (
          <>
            <h2 className="auth-title">Create your account</h2>
            <p className="auth-subtitle">Sign up to track orders and manage your shopping experience.</p>
          </>
        )}

        <div className="auth-tabs" role="tablist" aria-label="Authentication mode selector">
          <button
            type="button"
            className={authMode === 'signin' ? 'auth-tab active' : 'auth-tab'}
            onClick={() => switchMode('signin')}
            role="tab"
            aria-selected={authMode === 'signin'}
          >
            Sign In
          </button>
          <button
            type="button"
            className={authMode === 'signup' ? 'auth-tab active' : 'auth-tab'}
            onClick={() => switchMode('signup')}
            role="tab"
            aria-selected={authMode === 'signup'}
          >
            Sign Up
          </button>
        </div>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          {authMode === 'signup' && (
            <div className="field-group">
              <label htmlFor="auth-name">Full Name</label>
              <input
                id="auth-name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter your full name"
                className={errors.name ? 'has-error' : ''}
              />
              {errors.name && <span className="field-error">{errors.name}</span>}
            </div>
          )}

          <div className="field-group">
            <label htmlFor="auth-email">Email address</label>
            <input
              id="auth-email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Enter your email"
              className={errors.email ? 'has-error' : ''}
            />
            {errors.email && <span className="field-error">{errors.email}</span>}
          </div>

          <div className="field-group">
            <label htmlFor="auth-password">Password</label>
            <div className="password-wrap">
              <input
                id="auth-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter your password"
                className={errors.password ? 'has-error' : ''}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            {errors.password && <span className="field-error">{errors.password}</span>}
          </div>

          {authMode === 'signup' && (
            <div className="field-group">
              <label htmlFor="auth-confirm-password">Confirm Password</label>
              <div className="password-wrap">
                <input
                  id="auth-confirm-password"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Confirm your password"
                  className={errors.confirmPassword ? 'has-error' : ''}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                >
                  {showConfirmPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              {errors.confirmPassword && <span className="field-error">{errors.confirmPassword}</span>}
            </div>
          )}

          {errors.submit && <div className="submit-error">{errors.submit}</div>}
          {statusMessage && <div className="success-message">{statusMessage}</div>}

          <button type="submit" className="auth-primary-button" disabled={isSubmitting}>
            {isSubmitting
              ? authMode === 'signin'
                ? 'Signing In...'
                : 'Creating Account...'
              : authMode === 'signin'
                ? 'Sign In'
                : 'Create Account'}
          </button>
        </form>

        <div className="auth-switch-row">
          {authMode === 'signin' ? (
            <p>
              New to SHOP.CO?{' '}
              <button type="button" className="auth-link" onClick={() => switchMode('signup')}>
                Create one
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{' '}
              <button type="button" className="auth-link" onClick={() => switchMode('signin')}>
                Sign In
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
