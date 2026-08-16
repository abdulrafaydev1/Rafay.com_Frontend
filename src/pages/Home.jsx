import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import Hero from '../components/hero/Hero'
import Brands from '../components/brands/brands'
import Newarrial from '../components/Newarrial/Newarrial'
import Dressstylebrowser from '../components/Dressstylebrowser/Dressstylebrowser'
import TopSelling from '../components/topselling/topselling'
import HappyCustomers from '../components/HappyCustomers/HappyCustomers'
import Newsletter from '../components/Newsletter/Newsletter'
import Footer from '../components/Footer/Footer'

function Home() {
  const location = useLocation()

  useEffect(() => {
    if (!location.hash) return

    const sectionId = location.hash.replace('#', '')
    if (!sectionId) return

    const section = document.getElementById(sectionId)
    if (!section) return

    requestAnimationFrame(() => {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }, [location.hash, location.pathname])

  return (
    <>
      <Hero />
      <Brands />
      <Newarrial />
      <TopSelling />
      <Dressstylebrowser />
      <HappyCustomers />
      <Newsletter />
      <Footer />
    </>
  )
}

export default Home
