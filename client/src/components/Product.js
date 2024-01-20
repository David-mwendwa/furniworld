import React from 'react';
import Header from './layout/Header.js';
import Footer from './layout/Footer.js';
import ProductDetails from './ProductDetails.js';
import Hero from './layout/Hero.js';
import products from '../PRODUCTS.js';

const Product = () => {
  return (
    <>
      <Header />
      {/* Hero Section */}
      <Hero>
        <div className='row justify-content-between'>
          <div className='col-lg-5'>
            <div className='intro-excerpt'>
              <h1>Shop</h1>
            </div>
          </div>
          <div className='col-lg-7'></div>
        </div>
      </Hero>

      {/* Products */}
      <div className='untree_co-section product-section before-footer-section'>
        <div className='container'>
          <div className='row'>
            {products.map((product) => (
              <div className='col-12 col-md-4 col-lg-3 mb-5'>
                <ProductDetails key={product.name} product={product} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </>
  );
};

export default Product;
