import Pricing from './components/Home/Pricing.tsx'
import HowItWorks from './components/Home/HowItWork.tsx'
import Footer from './components/Home/Footer.tsx'
import Hero from './components/Home/Hero.tsx'
import Navbar from './components/Navbar.tsx'
import Features from './components/Home/Features.tsx'

function App() {
  

  return (
    <>
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <Pricing />
      
      <Footer />
    </>
  )
}

export default App
