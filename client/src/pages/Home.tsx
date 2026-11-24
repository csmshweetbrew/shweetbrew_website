/*
 * SHWEETBREW HOME PAGE - SINGLE PAGE FORMAT
 * All sections consolidated into one page with smooth scroll navigation
 * Flow: Landing → Products → Delivery → Order → Reviews → About → Contact
 */

import HeroSection from "@/components/HeroSection";
import ProductsSection from "@/components/ProductsSection";
import DeliverySection from "@/components/DeliverySection";
import OrderSection from "@/components/OrderSection";
import ReviewsSection from "@/components/ReviewsSection";
import AboutSection from "@/components/AboutSection";
import FAQSection from "@/components/FAQSection";
import ContactSection from "@/components/ContactSection";
import CartPanel from "@/components/CartPanel";
import ProductTicker from "@/components/ProductTicker";
import FireBackground from "@/components/FireBackground";
import Braai from "@/components/Braai";

export default function Home() {
  return (
    <div className="w-full">
      <FireBackground />
      <CartPanel />
      
      {/* Landing Section */}
      <section id="landing">
        <HeroSection />
      </section>

      <ProductTicker />

      {/* Products Section */}
      <section id="products">
        <ProductsSection />
      </section>

      {/* Delivery Section */}
      <section>
        <DeliverySection />
      </section>

      {/* Order Section */}
      <section>
        <OrderSection />
      </section>

      {/* Reviews Section */}
      <section>
        <ReviewsSection />
      </section>

      {/* About Section - PRIORITY */}
      <section>
        <AboutSection />
      </section>

      {/* FAQ Section */}
      <section>
        <FAQSection />
      </section>

      {/* Contact Section */}
      <section id="contact">
        <ContactSection />
      </section>

      {/* The bushveld fire; its ground fades into the footer */}
      <Braai />
    </div>
  );
}
