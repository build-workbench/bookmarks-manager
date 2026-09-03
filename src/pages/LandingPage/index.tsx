import LandingHeader from './Header'
import Hero from './Hero'
import Features from './Features'
import HowItWorks from './HowItWorks'
import FAQ from './FAQ'
import Footer from './Footer'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <LandingHeader />
      <Hero />
      <section id="features">
        <Features />
      </section>
      <section id="how-it-works">
        <HowItWorks />
      </section>
      <section id="faq">
        <FAQ />
      </section>
      <Footer />
    </div>
  )
}
