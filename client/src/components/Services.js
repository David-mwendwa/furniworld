import React from 'react';
import Header from './layout/Header';
import Hero from './layout/Hero';
import Footer from './layout/Footer';
import { Link } from 'react-router-dom';

const Services = () => {
  return (
    <>
      <Header />
      {/* Hero Section */}
      <Hero>
        <div className='row justify-content-between'>
          <div className='col-lg-5'>
            <div className='intro-excerpt'>
              <h1>Services</h1>
              <p className='mb-4'>
                Donec vitae odio quis nisl dapibus malesuada. Nullam ac aliquet
                velit. Aliquam vulputate velit imperdiet dolor tempor tristique.
              </p>
              <p>
                <Link to='/shop' className='btn btn-secondary me-2'>
                  Shop Now
                </Link>
                <Link href='/shop' className='btn btn-white-outline'>
                  Explore
                </Link>
              </p>
            </div>
          </div>
          <div className='col-lg-7'>
            <div className='hero-img-wrap'>
              <img src='images/couch.png' alt='' className='img-fluid' />
            </div>
          </div>
        </div>
      </Hero>

      {/* Why Choose Us Section */}
      <div className='why-choose-section'>
        <div className='container'>
          <div className='row my-5'>
            <div className='col-6 col-md-6 col-lg-3 mb-4'>
              <div className='feature'>
                <div className='icon'>
                  <img src='images/truck.svg' alt='' className='imf-fluid' />
                </div>
                <h3>Fast &amp; Free Shipping</h3>
                <p>
                  Donec vitae odio quis nisl dapibus malesuada. Nullam ac
                  aliquet velit. Aliquam vulputate.
                </p>
              </div>
            </div>

            <div className='col-6 col-md-6 col-lg-3 mb-4'>
              <div className='feature'>
                <div className='icon'>
                  <img src='images/bag.svg' alt='' className='imf-fluid' />
                </div>
                <h3>Easy to Shop</h3>
                <p>
                  Donec vitae odio quis nisl dapibus malesuada. Nullam ac
                  aliquet velit. Aliquam vulputate.
                </p>
              </div>
            </div>

            <div className='col-6 col-md-6 col-lg-3 mb-4'>
              <div className='feature'>
                <div className='icon'>
                  <img src='images/support.svg' alt='' className='imf-fluid' />
                </div>
                <h3>24/7 Support</h3>
                <p>
                  Donec vitae odio quis nisl dapibus malesuada. Nullam ac
                  aliquet velit. Aliquam vulputate.
                </p>
              </div>
            </div>

            <div className='col-6 col-md-6 col-lg-3 mb-4'>
              <div className='feature'>
                <div className='icon'>
                  <img src='images/return.svg' alt='' className='imf-fluid' />
                </div>
                <h3>Hassle Free Returns</h3>
                <p>
                  Donec vitae odio quis nisl dapibus malesuada. Nullam ac
                  aliquet velit. Aliquam vulputate.
                </p>
              </div>
            </div>

            <div className='col-6 col-md-6 col-lg-3 mb-4'>
              <div className='feature'>
                <div className='icon'>
                  <img src='images/truck.svg' alt='' className='imf-fluid' />
                </div>
                <h3>Fast &amp; Free Shipping</h3>
                <p>
                  Donec vitae odio quis nisl dapibus malesuada. Nullam ac
                  aliquet velit. Aliquam vulputate.
                </p>
              </div>
            </div>

            <div className='col-6 col-md-6 col-lg-3 mb-4'>
              <div className='feature'>
                <div className='icon'>
                  <img src='images/bag.svg' alt='' className='imf-fluid' />
                </div>
                <h3>Easy to Shop</h3>
                <p>
                  Donec vitae odio quis nisl dapibus malesuada. Nullam ac
                  aliquet velit. Aliquam vulputate.
                </p>
              </div>
            </div>

            <div className='col-6 col-md-6 col-lg-3 mb-4'>
              <div className='feature'>
                <div className='icon'>
                  <img src='images/support.svg' alt='' className='imf-fluid' />
                </div>
                <h3>24/7 Support</h3>
                <p>
                  Donec vitae odio quis nisl dapibus malesuada. Nullam ac
                  aliquet velit. Aliquam vulputate.
                </p>
              </div>
            </div>

            <div className='col-6 col-md-6 col-lg-3 mb-4'>
              <div className='feature'>
                <div className='icon'>
                  <img src='images/return.svg' alt='' className='imf-fluid' />
                </div>
                <h3>Hassle Free Returns</h3>
                <p>
                  Donec vitae odio quis nisl dapibus malesuada. Nullam ac
                  aliquet velit. Aliquam vulputate.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </>
  );
};

export default Services;
