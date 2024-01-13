import React from 'react';
import Header from '../layout/Header';
import Hero from '../layout/Hero';
import Footer from '../layout/Footer';
import { Link } from 'react-router-dom';

const Checkout = () => {
  return (
    <>
      <Header />
      {/* Hero Section */}
      <Hero>
        <div className='row justify-content-between'>
          <div className='col-lg-5'>
            <div className='intro-excerpt'>
              <h1>Checkout</h1>
            </div>
          </div>
          <div className='col-lg-7'></div>
        </div>
      </Hero>

      {/* Cart Section */}
      <div className='untree_co-section'>
        <div className='container'>
          <div className='row mb-5'>
            <div className='col-md-12'>
              <div className='border p-4 rounded' role='alert'>
                Returning customer? <Link to='/login'>Click here</Link> to login
              </div>
            </div>
          </div>
          <div className='row'>
            <div className='col-md-6 mb-5 mb-md-0'>
              <h2 className='h3 mb-3 text-black'>Billing Details</h2>
              <div className='p-3 p-lg-5 border bg-white'>
                <div className='form-group'>
                  <label for='c_country' className='text-black'>
                    Country <span className='text-danger'>*</span>
                  </label>
                  <select id='c_country' className='form-control'>
                    <option value='1'>Select Link country</option>
                    <option value='2'>bangladesh</option>
                    <option value='3'>Algeria</option>
                    <option value='4'>Afghanistan</option>
                    <option value='5'>Ghana</option>
                    <option value='6'>Albania</option>
                    <option value='7'>Bahrain</option>
                    <option value='8'>Colombia</option>
                    <option value='9'>Dominican Republic</option>
                  </select>
                </div>
                <div className='form-group row'>
                  <div className='col-md-6'>
                    <label for='c_fname' className='text-black'>
                      First Name <span className='text-danger'>*</span>
                    </label>
                    <input
                      type='text'
                      className='form-control'
                      id='c_fname'
                      name='c_fname'
                    />
                  </div>
                  <div className='col-md-6'>
                    <label for='c_lname' className='text-black'>
                      Last Name <span className='text-danger'>*</span>
                    </label>
                    <input
                      type='text'
                      className='form-control'
                      id='c_lname'
                      name='c_lname'
                    />
                  </div>
                </div>

                <div className='form-group row'>
                  <div className='col-md-12'>
                    <label for='c_companyname' className='text-black'>
                      Company Name
                    </label>
                    <input
                      type='text'
                      className='form-control'
                      id='c_companyname'
                      name='c_companyname'
                    />
                  </div>
                </div>

                <div className='form-group row'>
                  <div className='col-md-12'>
                    <label for='c_address' className='text-black'>
                      Address <span className='text-danger'>*</span>
                    </label>
                    <input
                      type='text'
                      className='form-control'
                      id='c_address'
                      name='c_address'
                      placeholder='Street address'
                    />
                  </div>
                </div>

                <div className='form-group mt-3'>
                  <input
                    type='text'
                    className='form-control'
                    placeholder='Apartment, suite, unit etc. (optional)'
                  />
                </div>

                <div className='form-group row'>
                  <div className='col-md-6'>
                    <label for='c_state_country' className='text-black'>
                      State / Country <span className='text-danger'>*</span>
                    </label>
                    <input
                      type='text'
                      className='form-control'
                      id='c_state_country'
                      name='c_state_country'
                    />
                  </div>
                  <div className='col-md-6'>
                    <label for='c_postal_zip' className='text-black'>
                      Posta / Zip <span className='text-danger'>*</span>
                    </label>
                    <input
                      type='text'
                      className='form-control'
                      id='c_postal_zip'
                      name='c_postal_zip'
                    />
                  </div>
                </div>

                <div className='form-group row mb-5'>
                  <div className='col-md-6'>
                    <label for='c_email_address' className='text-black'>
                      Email Address <span className='text-danger'>*</span>
                    </label>
                    <input
                      type='text'
                      className='form-control'
                      id='c_email_address'
                      name='c_email_address'
                    />
                  </div>
                  <div className='col-md-6'>
                    <label for='c_phone' className='text-black'>
                      Phone <span className='text-danger'>*</span>
                    </label>
                    <input
                      type='text'
                      className='form-control'
                      id='c_phone'
                      name='c_phone'
                      placeholder='Phone Number'
                    />
                  </div>
                </div>

                <div className='form-group'>
                  <label
                    for='c_create_account'
                    className='text-black'
                    data-bs-toggle='collapse'
                    to='#create_an_account'
                    role='button'
                    aria-expanded='false'
                    aria-controls='create_an_account'>
                    <input type='checkbox' value='1' id='c_create_account' />
                    Create an account?
                  </label>
                  <div className='collapse' id='create_an_account'>
                    <div className='py-2 mb-4'>
                      <p className='mb-3'>
                        Create an account by entering the information below. If
                        you are Link returning customer please login at the top
                        of the page.
                      </p>
                      <div className='form-group'>
                        <label for='c_account_password' className='text-black'>
                          Account Password
                        </label>
                        <input
                          type='email'
                          className='form-control'
                          id='c_account_password'
                          name='c_account_password'
                          placeholder=''
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className='form-group'>
                  <label
                    for='c_ship_different_address'
                    className='text-black'
                    data-bs-toggle='collapse'
                    to='#ship_different_address'
                    role='button'
                    aria-expanded='false'
                    aria-controls='ship_different_address'>
                    <input
                      type='checkbox'
                      value='1'
                      id='c_ship_different_address'
                    />
                    Ship To Link Different Address?
                  </label>
                  <div className='collapse' id='ship_different_address'>
                    <div className='py-2'>
                      <div className='form-group'>
                        <label for='c_diff_country' className='text-black'>
                          Country <span className='text-danger'>*</span>
                        </label>
                        <select id='c_diff_country' className='form-control'>
                          <option value='1'>Select Link country</option>
                          <option value='2'>bangladesh</option>
                          <option value='3'>Algeria</option>
                          <option value='4'>Afghanistan</option>
                          <option value='5'>Ghana</option>
                          <option value='6'>Albania</option>
                          <option value='7'>Bahrain</option>
                          <option value='8'>Colombia</option>
                          <option value='9'>Dominican Republic</option>
                        </select>
                      </div>

                      <div className='form-group row'>
                        <div className='col-md-6'>
                          <label for='c_diff_fname' className='text-black'>
                            First Name <span className='text-danger'>*</span>
                          </label>
                          <input
                            type='text'
                            className='form-control'
                            id='c_diff_fname'
                            name='c_diff_fname'
                          />
                        </div>
                        <div className='col-md-6'>
                          <label for='c_diff_lname' className='text-black'>
                            Last Name <span className='text-danger'>*</span>
                          </label>
                          <input
                            type='text'
                            className='form-control'
                            id='c_diff_lname'
                            name='c_diff_lname'
                          />
                        </div>
                      </div>

                      <div className='form-group row'>
                        <div className='col-md-12'>
                          <label
                            for='c_diff_companyname'
                            className='text-black'>
                            Company Name
                          </label>
                          <input
                            type='text'
                            className='form-control'
                            id='c_diff_companyname'
                            name='c_diff_companyname'
                          />
                        </div>
                      </div>

                      <div className='form-group row mb-3'>
                        <div className='col-md-12'>
                          <label for='c_diff_address' className='text-black'>
                            Address <span className='text-danger'>*</span>
                          </label>
                          <input
                            type='text'
                            className='form-control'
                            id='c_diff_address'
                            name='c_diff_address'
                            placeholder='Street address'
                          />
                        </div>
                      </div>

                      <div className='form-group'>
                        <input
                          type='text'
                          className='form-control'
                          placeholder='Apartment, suite, unit etc. (optional)'
                        />
                      </div>

                      <div className='form-group row'>
                        <div className='col-md-6'>
                          <label
                            for='c_diff_state_country'
                            className='text-black'>
                            State / Country
                            <span className='text-danger'>*</span>
                          </label>
                          <input
                            type='text'
                            className='form-control'
                            id='c_diff_state_country'
                            name='c_diff_state_country'
                          />
                        </div>
                        <div className='col-md-6'>
                          <label for='c_diff_postal_zip' className='text-black'>
                            Posta / Zip <span className='text-danger'>*</span>
                          </label>
                          <input
                            type='text'
                            className='form-control'
                            id='c_diff_postal_zip'
                            name='c_diff_postal_zip'
                          />
                        </div>
                      </div>

                      <div className='form-group row mb-5'>
                        <div className='col-md-6'>
                          <label
                            for='c_diff_email_address'
                            className='text-black'>
                            Email Address
                            <span className='text-danger'>*</span>
                          </label>
                          <input
                            type='text'
                            className='form-control'
                            id='c_diff_email_address'
                            name='c_diff_email_address'
                          />
                        </div>
                        <div className='col-md-6'>
                          <label for='c_diff_phone' className='text-black'>
                            Phone <span className='text-danger'>*</span>
                          </label>
                          <input
                            type='text'
                            className='form-control'
                            id='c_diff_phone'
                            name='c_diff_phone'
                            placeholder='Phone Number'
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className='form-group'>
                  <label for='c_order_notes' className='text-black'>
                    Order Notes
                  </label>
                  <textarea
                    name='c_order_notes'
                    id='c_order_notes'
                    cols='30'
                    rows='5'
                    className='form-control'
                    placeholder='Write your notes here...'></textarea>
                </div>
              </div>
            </div>
            <div className='col-md-6'>
              <div className='row mb-5'>
                <div className='col-md-12'>
                  <h2 className='h3 mb-3 text-black'>Your Order</h2>
                  <div className='p-3 p-lg-5 border bg-white'>
                    <table className='table site-block-order-table mb-5'>
                      <thead>
                        <th>Product</th>
                        <th>Total</th>
                      </thead>
                      <tbody>
                        <tr>
                          <td>
                            Top Up T-Shirt <strong className='mx-2'>x</strong> 1
                          </td>
                          <td>Ksh. 14000</td>
                        </tr>
                        <tr>
                          <td>
                            Polo Shirt <strong className='mx-2'>x</strong> 1
                          </td>
                          <td>Ksh. 12000</td>
                        </tr>
                        <tr>
                          <td className='text-black font-weight-bold'>
                            <strong>Cart Subtotal</strong>
                          </td>
                          <td className='text-black'>Ksh. 26000</td>
                        </tr>
                        <tr>
                          <td className='text-black font-weight-bold'>
                            <strong>Order Total</strong>
                          </td>
                          <td className='text-black font-weight-bold'>
                            <strong>Ksh. 26000</strong>
                          </td>
                        </tr>
                      </tbody>
                    </table>

                    <div className='border p-3 mb-3'>
                      <h3 className='h6 mb-0'>
                        <Link
                          className='d-block'
                          data-bs-toggle='collapse'
                          to='#collapsempesa'
                          role='button'
                          aria-expanded='false'
                          aria-controls='collapsempesa'>
                          Lipa Na Mpesa
                        </Link>
                      </h3>

                      <div className='collapse' id='collapsempesa'>
                        <div className='py-2'>
                          <p className='mb-0'>
                            Make your payment directly into our till number
                            through Safaricom Lipa Na Mpesa. Your order won’t be
                            shipped until we have received you funds
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className='border p-3 mb-5'>
                      <h3 className='h6 mb-0'>
                        <Link
                          className='d-block'
                          data-bs-toggle='collapse'
                          to='#collapsepaypal'
                          role='button'
                          aria-expanded='false'
                          aria-controls='collapsepaypal'>
                          Paypal
                        </Link>
                      </h3>

                      <div className='collapse' id='collapsepaypal'>
                        <div className='py-2'>
                          <p className='mb-0'>
                            Make your payment directly into our bank account.
                            Please use your Order ID as the payment reference.
                            Your order won’t be shipped until the funds have
                            cleared in our account.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className='form-group'>
                      <button
                        className='btn btn-black btn-lg py-3 btn-block'
                        onclick="window.location='thankyou.html'">
                        Place Order
                      </button>
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

export default Checkout;
