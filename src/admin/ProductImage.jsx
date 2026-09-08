import { useState } from 'react';

const fallback = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 90"><rect width="80" height="90" rx="5" fill="#eff1f8"/><g fill="none" stroke="#9b9bb8" stroke-width="2" stroke-linejoin="round"><path d="m24 34 16-9 16 9v22l-16 9-16-9Z"/><path d="m24 34 16 9 16-9M40 43v22"/></g></svg>');

export default function ProductImage({ src, alt = '', ...props }) {
  const [failedSource, setFailedSource] = useState(null);
  return <img {...props} src={failedSource === src ? fallback : src} alt={alt} onError={() => setFailedSource(src)} />;
}
