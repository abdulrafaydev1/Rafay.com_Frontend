import { useState } from 'react';
import { Link } from 'react-router-dom';
import { adminRequest } from './api';
import { Badge, Button, ErrorState } from './components';
import Icon from './icons';

export default function AdminLogin({ onLogin, expired }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [visible, setVisible] = useState(false);
  const [errors, setErrors] = useState({});
  const [pending, setPending] = useState(false);
  const submit = async (event) => {
    event.preventDefault();
    if (pending) return;
    const nextErrors = {};
    if (!email.trim()) nextErrors.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) nextErrors.email = 'Enter a valid email address.';
    if (!password) nextErrors.password = 'Password is required.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    setPending(true);
    try {
      const session = await adminRequest('/login', { method: 'POST', body: { email: email.trim(), password } });
      setPassword(''); onLogin(session);
    } catch (error) { setPassword(''); setErrors({ submit: error.message }); }
    finally { setPending(false); }
  };
  return <main className="ad-login">
    <section className="ad-login-story">
      <Link to="/" className="ad-brand"><span className="ad-brand-mark"><Icon name="box" size={24} /></span><span>Rafay<span className="ad-brand-light">Commerce</span></span></Link>
      <div className="ad-login-story-content"><Badge tone="success" dot>Merchant workspace</Badge><h1>A clear view.<br />A confident next move.</h1><p>Your store, products, and operations.<br />One focused place to stay in control.</p>
      <div className="ad-login-illustration" aria-hidden="true"><div className="ad-illustration-top"><span /><span /><span /><i /></div><div className="ad-illustration-body"><div className="ad-illustration-nav">{[1,2,3,4,5].map((i) => <span key={i} />)}</div><div className="ad-illustration-main"><div className="ad-illustration-stats"><span /><span /><span /></div><svg viewBox="0 0 350 130"><defs><linearGradient id="login-gradient" x1="0" x2="0" y1="0" y2="1"><stop stopColor="#4f46e5" stopOpacity=".22" /><stop offset="1" stopColor="#4f46e5" stopOpacity="0" /></linearGradient></defs><path d="M0 108 Q35 100 65 80 T130 64 T190 50 T250 30 T350 10 L350 130 H0Z" fill="url(#login-gradient)" /><path d="M0 108 Q35 100 65 80 T130 64 T190 50 T250 30 T350 10" stroke="#4f46e5" fill="none" strokeWidth="3" /><path d="M0 122 Q45 116 90 99 T180 85 T270 63 T350 48" stroke="#006e4c" fill="none" strokeWidth="2" /></svg><div className="ad-illustration-lines"><span /><span /><span /></div></div></div></div></div>
      <footer><Icon name="lock" size={14} /> Secure access. Focused operations.</footer>
    </section>
    <section className="ad-login-form-side"><Link to="/" className="ad-back-store">← Back to store</Link><div className="ad-login-form-wrap"><span className="ad-login-lock"><Icon name="lock" size={26} /></span><span className="ad-eyebrow">ADMIN PORTAL</span><h2>Welcome back</h2><p>Sign in to your merchant workspace.</p>{expired && <div className="ad-notice" role="status">Your session has expired. Please sign in again.</div>}
    <form onSubmit={submit} noValidate>
      <div className="ad-field"><label htmlFor="admin-email">Email address</label><input id="admin-email" type="email" name="email" autoComplete="username" maxLength={254} placeholder="Enter your email address" value={email} onChange={(event) => { setEmail(event.target.value); setErrors({}); }} aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? 'admin-email-error' : undefined} disabled={pending} />{errors.email && <span id="admin-email-error" className="ad-field-error">{errors.email}</span>}</div>
      <div className="ad-field"><label htmlFor="admin-password">Password</label><div className="ad-password"><input id="admin-password" type={visible ? 'text' : 'password'} name="password" autoComplete="current-password" maxLength={1024} placeholder="Enter your password" value={password} onChange={(event) => { setPassword(event.target.value); setErrors({}); }} aria-invalid={Boolean(errors.password)} aria-describedby={errors.password ? 'admin-password-error' : undefined} disabled={pending} /><button type="button" aria-label={visible ? 'Hide password' : 'Show password'} aria-pressed={visible} onClick={() => setVisible(!visible)}><Icon name="eye" /></button></div>{errors.password && <span id="admin-password-error" className="ad-field-error">{errors.password}</span>}</div>
      {errors.submit && <ErrorState message={errors.submit} />}
      <Button type="submit" primary disabled={pending} className="ad-login-submit">{pending ? 'Signing in…' : 'Sign in to dashboard'}<Icon name={pending ? 'refresh' : 'arrow'} size={17} /></Button>
    </form><div className="ad-login-security"><Icon name="lock" size={14} /> Authorized administrators only</div></div><footer>Rafay.com <span>Merchant Administration</span></footer></section>
  </main>;
}
