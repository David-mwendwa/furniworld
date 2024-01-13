import React from 'react';
import { Link } from 'react-router-dom';
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
      <Hero>
        <div className='row justify-content-between'>
          <div className='col-lg-5'>
            <div className='intro-excerpt'>
              <h1 data-aos='fade-down' data-aos-duration='3000'>
                Modern Interior <span clsas='d-block'>Design Studio</span>
              </h1>
              <p
                className='mb-4'
                data-aos='zoom-in-down'
                data-aos-duration='1500'>
                Donec vitae odio quis nisl dapibus malesuada. Nullam ac aliquet
                velit. Aliquam vulputate velit imperdiet dolor tempor tristique.
              </p>
              <p data-aos='fade-up' data-aos-duration='3000'>
                <Link to='/shop' className='btn btn-secondary me-2'>
                  Shop Now
                </Link>
                <Link to='/shop' className='btn btn-white-outline'>
                  Explore
                </Link>
              </p>
            </div>
          </div>
          <div className='col-lg-7'>
            <div
              className='hero-img-wrap'
              data-aos='fade-down'
              data-aos-easing='linear'
              data-aos-duration='3000'>
              <img src='images/couch.png' alt='' className='img-fluid' />
            </div>
          </div>
        </div>
      </Hero>

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
      {/* <Blog /> */}

      {/* Footer Section */}
      <Footer />
    </>
  );
};
