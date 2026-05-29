import React, { useState, useEffect } from 'react';
import '../styles/landing.css';

import Navbar from '../components/Navbar';
import HeroSection from '../components/HeroSection';
import FeaturesSection from '../components/FeaturesSection';
import HowItWorksSection from '../components/HowItWorksSection';
import TechStackSection from '../components/TechStackSection';
import ApiSection from '../components/ApiSection';
import CtaSection from '../components/CtaSection';
import Footer from '../components/Footer';

/**
 * Landing page orchestrator.
 * All sections are modular — this component only handles
 * top-level state (scroll, OAuth redirect) and composition.
 */
export default function LandingApp() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    // Check URL params for OAuth redirect or existing token
    const urlParams = new URLSearchParams(window.location.search);
    const oauthToken = urlParams.get('token');
    const oauthEmail = urlParams.get('email') || '';

    if (oauthToken) {
      localStorage.setItem('ur_token', oauthToken);
      localStorage.setItem('ur_email', oauthEmail);
      window.history.replaceState({}, '', 'index.html');
      setIsRedirecting(true);
      window.location.href = 'dashboard.html';
      return;
    } else if (localStorage.getItem('ur_token')) {
      setIsRedirecting(true);
      window.location.href = 'dashboard.html';
      return;
    }

    document.body.className = 'landing-body';

    // Lightweight scroll handler — only updates navbar state
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.body.className = '';
    };
  }, []);

  if (isRedirecting) return null;

  return (
    <>
      {/* Global noise overlay */}
      <div className="noise-overlay"></div>

      <Navbar
        isScrolled={isScrolled}
        isMobileMenuOpen={isMobileMenuOpen}
        onToggleMobileMenu={setIsMobileMenuOpen}
      />

      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <TechStackSection />
      <ApiSection />
      <CtaSection />
      <Footer />
    </>
  );
}
