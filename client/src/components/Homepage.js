import React from 'react';
import Footer from './layout/Footer';
import Testmonials from './layout/Testmonials';
import Blog from './layout/Blog';
import Featured from './layout/Featured';
import Hero from './layout/Hero';
import Header from './layout/Header';
import Product from './layout/Product';
import WhyUs from './layout/WhyUs';
import WeHelp from './layout/WeHelp';
import Metadata from './layout/Metadata';

export const Homepage = () => {
  return (
    <>
      <Metadata title={`Get Best Furnitures Online`} />
      {/* Header/Navigation -- */}
      <Header />

      {/* Hero Section */}
      <Hero />

      {/* Product Section */}
      <Product />

      {/* Why Choose Us Section */}
      <WhyUs />

      {/* We Help Section */}
      <WeHelp />

      {/* Popular/Featured Products */}
      <Featured />

      {/* Testimonial Slider */}
      <Testmonials />

      {/* Blog Section */}
      <Blog />

      {/* Footer Section */}
      <Footer />
    </>
  );
};
