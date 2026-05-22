import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import AboutSection from './components/AboutSection';
import BenefitsSection from './components/BenefitsSection';
import ProductsSection from './components/ProductsSection';
import PedidoOnlineSection from './components/PedidoOnlineSection';
import LifestyleSection from './components/LifestyleSection';
import VideoSection from './components/VideoSection';
import CtaBanner from './components/CtaBanner';
import ContactSection from './components/ContactSection';
import Footer from './components/Footer';
import FloatingWhatsApp from './components/FloatingWhatsApp';

export default function Home() {
  return (
    <main className="font-body bg-[#FEFDFB]">
      <Navbar />
      <HeroSection />
      <AboutSection />
      <BenefitsSection />
      <ProductsSection />
      <PedidoOnlineSection />
      <LifestyleSection />
      <VideoSection />
      <CtaBanner />
      <ContactSection />
      <Footer />
      <FloatingWhatsApp />
    </main>
  );
}
