import React from 'react';
import Header from '../layout/Header';
import Footer from '../layout/Footer';
import ProductDetails from './ProductDetails';
import Hero from '../layout/Hero';
import products from './products';

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
                <ProductDetails key={product.id} product={product} />
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