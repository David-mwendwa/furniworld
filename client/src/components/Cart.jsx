import React from 'react';
import Header from './layout/Header';
import Hero from './layout/Hero';
import Footer from './layout/Footer';
import { Link } from 'react-router-dom';

const Cart = () => {
  return (
    <>
      <Header />
      {/* Hero Section */}
      <Hero>
        <div className='justify-content-between  text-center'>
          <h1>Cart</h1>
        </div>
      </Hero>

      {/* Cart Section */}
      <div className='untree_co-section before-footer-section'>
        <div className='container'>
          <div className='row mb-5'>
            <form className='col-md-12' method='post'>
              <div className='site-blocks-table'>
                <table className='table'>
                  <thead>
                    <tr>
                      <th className='product-thumbnail'></th>
                      <th className='product-name'>Product</th>
                      <th className='product-price'>Price</th>
                      <th className='product-quantity'>Quantity</th>
                      <th className='product-total'>Total</th>
                      <th className='product-remove'>Remove</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className='product-thumbnail'>
                        <img
                          src='images/product-1.png'
                          alt=''
                          className='img-fluid'
                        />
                      </td>
                      <td className='product-name'>
                        <h2 className='h5 text-black'>Product 1</h2>
                      </td>
                      <td>Ksh. 5900</td>
                      <td>
                        <div
                          className='input-group mb-3 d-flex align-items-center quantity-container'
                          style={{ 'max-width': '120px' }}>
                          <div className='input-group-prepend'>
                            <button
                              className='btn btn-outline-black decrease'
                              type='button'>
                              &minus;
                            </button>
                          </div>
                          <input
                            type='text'
                            className='form-control text-center quantity-amount'
                            value='1'
                            placeholder=''
                            aria-label='Example text with button addon'
                            aria-describedby='button-addon1'
                          />
                          <div className='input-group-append'>
                            <button
                              className='btn btn-outline-black increase'
                              type='button'>
                              &#x2B;
                            </button>
                          </div>
                        </div>
                      </td>
                      <td>Ksh. 5900</td>
                      <td>
                        <Link to='#' className='btn btn-black btn-sm'>
                          X
                        </Link>
                      </td>
                    </tr>

                    <tr>
                      <td className='product-thumbnail'>
                        <img
                          src='images/product-2.png'
                          alt=''
                          className='img-fluid'
                        />
                      </td>
                      <td className='product-name'>
                        <h2 className='h5 text-black'>Product 2</h2>
                      </td>
                      <td>Ksh. 7800</td>
                      <td>
                        <div
                          className='input-group mb-3 d-flex align-items-center quantity-container'
                          style={{ 'max-width': '120px' }}>
                          <div className='input-group-prepend'>
                            <button
                              className='btn btn-outline-black decrease'
                              type='button'>
                              &minus;
                            </button>
                          </div>
                          <input
                            type='text'
                            className='form-control text-center quantity-amount'
                            value='1'
                            placeholder=''
                            aria-label='Example text with button addon'
                            aria-describedby='button-addon1'
                          />
                          <div className='input-group-append'>
                            <button
                              className='btn btn-outline-black increase'
                              type='button'>
                              &#x2B;
                            </button>
                          </div>
                        </div>
                      </td>
                      <td>Ksh. 7800</td>
                      <td>
                        <Link to='#' className='btn btn-black btn-sm'>
                          X
                        </Link>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </form>
          </div>

          <div className='row'>
            <div className='col-md-6'></div>
            <div className='col-md-6 pl-5'>
              <div className='row justify-content-end'>
                <div className='col-md-7'>
                  <div className='row'>
                    <div className='col-md-12 text-right border-bottom mb-5'>
                      <h3 className='text-black h4 text-uppercase'>
                        Cart Totals
                      </h3>
                    </div>
                  </div>
                  <div className='row mb-3'>
                    <div className='col-md-6'>
                      <span className='text-black'>Subtotal</span>
                    </div>
                    <div className='col-md-6 text-right'>
                      <strong className='text-black'>Ksh. 13700</strong>
                    </div>
                  </div>
                  <div className='row mb-5'>
                    <div className='col-md-6'>
                      <span className='text-black'>Total</span>
                    </div>
                    <div className='col-md-6 text-right'>
                      <strong className='text-black'>Ksh. 13700</strong>
                    </div>
                  </div>

                  <div className='row'>
                    <div className='col-md-12'>
                      <Link to='/checkout'>
                        <button
                          className='btn btn-black btn-lg py-3 btn-block'
                          onclick="window.location='checkout.html'">
                          Proceed To Checkout
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
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

export default Cart;
