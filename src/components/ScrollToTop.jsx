import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import './ScrollToTop.css'

function ScrollToTop() {
  const [showButton, setShowButton] = useState(false)
  const location = useLocation()

  useEffect(() => {
    if (location.pathname === '/' && location.hash) {
      return;
    }

    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'auto',
    })
  }, [location.pathname, location.hash])

  useEffect(() => {
    const handleScroll = () => {
      setShowButton(window.scrollY > 400)
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  const handleScrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  return (
    <button
      type="button"
      className={`scroll-to-top ${showButton ? 'visible' : ''}`}
      onClick={handleScrollToTop}
      aria-label="Back to top"
      title="Back to top"
    >
      <span aria-hidden="true">↑</span>
    </button>
  )
}

export default ScrollToTop
