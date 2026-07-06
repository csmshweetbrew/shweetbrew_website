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

export default function Home() {
  return (
    <div className="w-full">
      <CartPanel />
      
      {/* Landing Section */}
      <section id="landing">
        <HeroSection />
      </section>

      {/* Products Section */}
      <section id="products">
        <ProductsSection />
      </section>

      {/* Delivery Section */}
      <section id="delivery">
        <DeliverySection />
      </section>

      {/* Order Section */}
      <section id="order">
        <OrderSection />
      </section>

      {/* Reviews Section */}
      <section id="reviews">
        <ReviewsSection />
      </section>

      {/* About Section - PRIORITY */}
      <section id="about">
        <AboutSection />
      </section>

      {/* FAQ Section */}
      <section id="faq">
        <FAQSection />
      </section>

      {/* Contact Section */}
      <section id="contact">
        <ContactSection />
      </section>
    </div>
  );
}
