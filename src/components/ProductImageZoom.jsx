import { useEffect, useRef, useState } from 'react';

const ZOOM_SCALE = 2.5;
const PREVIEW_SIZE = 420;

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

export default function ProductImageZoom({ src, alt, onError }) {
  const wrapperRef = useRef(null);
  const [showZoom, setShowZoom] = useState(false);
  const [zoomX, setZoomX] = useState(50);
  const [zoomY, setZoomY] = useState(50);
  const [previewLeft, setPreviewLeft] = useState(false);
  const [isDesktop, setIsDesktop] = useState(() => {
    if (typeof window === 'undefined') return true;
    return window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const mediaQuery = window.matchMedia('(hover: hover) and (pointer: fine)');
    const handleChange = (event) => setIsDesktop(event.matches);

    handleChange(mediaQuery);

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }

    mediaQuery.addListener(handleChange);
    return () => mediaQuery.removeListener(handleChange);
  }, []);

  const updateZoomFromPointer = (clientX, clientY) => {
    const rect = wrapperRef.current?.getBoundingClientRect();

    if (!rect) return;

    const nextX = clamp(((clientX - rect.left) / rect.width) * 100, 0, 100);
    const nextY = clamp(((clientY - rect.top) / rect.height) * 100, 0, 100);

    setZoomX(nextX);
    setZoomY(nextY);

    const overflowRight = rect.right + PREVIEW_SIZE + 32 > window.innerWidth;
    setPreviewLeft(overflowRight);
  };

  return (
    <div
      ref={wrapperRef}
      className="product-zoom-shell"
      onMouseEnter={() => setShowZoom(true)}
      onMouseMove={(event) => {
        if (!isDesktop) return;
        updateZoomFromPointer(event.clientX, event.clientY);
      }}
      onMouseLeave={() => setShowZoom(false)}
    >
      <div className="image-zoom-frame">
        <img
          src={src}
          alt={alt}
          className="zoom-main-image"
          onError={onError}
        />
      </div>

      {showZoom && isDesktop && (
        <div
          className={`zoom-preview ${previewLeft ? 'left' : 'right'}`}
          aria-label="Zoomed product preview"
          style={{
            backgroundImage: `url("${src}")`,
            backgroundSize: `${ZOOM_SCALE * 100}% ${ZOOM_SCALE * 100}%`,
            backgroundPosition: `${zoomX}% ${zoomY}%`,
            backgroundRepeat: 'no-repeat',
          }}
        />
      )}
    </div>
  );
}
