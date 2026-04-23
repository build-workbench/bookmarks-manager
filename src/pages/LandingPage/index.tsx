import Hero from './Hero'
import Features from './Features'
import HowItWorks from './HowItWorks'
import FAQ from './FAQ'
import Footer from './Footer'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950">
      <Hero />
      <section id="features">
        <Features />
      </section>
      <section id="how-it-works">
        <HowItWorks />
      </section>
      <FAQ />
      <Footer />
    </div>
  )
}
