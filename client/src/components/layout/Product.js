import React from 'react';
import { Link } from 'react-router-dom';
import products from '../../PRODUCTS.js';

const Product = () => {
  return (
    <div
      className='product-section'
      data-aos='zoom-in-down'
      data-aos-duration='1500'>
      <div className='container'>
        <div className='row'>
          {/* Column 1 */}
          <div className='col-md-12 col-lg-3 mb-5 mb-lg-0'>
            <h2 className='mb-4 section-title'>
              Crafted with excellent material.
            </h2>
            <p className='mb-4'>
              Donec vitae odio quis nisl dapibus malesuada. Nullam ac aliquet
              velit. Aliquam vulputate velit imperdiet dolor tempor tristique.{' '}
            </p>
            <p>
              <Link to='/shop' className='btn'>
                Explore
              </Link>
            </p>
          </div>

          {/* Column 2 */}
          {products.map(
            (product) =>
              product.featured && (
                <div className='col-12 col-md-4 col-lg-3 mb-5 mb-md-0'>
                  <Link className='product-item' to='/'>
                    <img
                      src={`images/${product.filename}`}
                      alt={product.name}
                      className='img-fluid product-thumbnail'
                    />
                    <h3 className='product-title'>{product.name}</h3>
                    <strong className='product-price'>
                      Ksh. {product.price.toLocaleString()}
                    </strong>

                    <span className='icon-cross'>
                      <img
                        src='images/cross.svg'
                        alt=''
                        className='img-fluid'
                      />
                    </span>
                  </Link>
                </div>
              )
          )}
        </div>
      </div>
    </div>
  );
};

export default Product;
