import React from 'react';
import Header from '../layout/Header';
import Footer from '../layout/Footer';
import Hero from '../layout/Hero';
import { Link } from 'react-router-dom';

const Register = () => {
  return (
    <>
      <Header />
      {/* Hero Section */}
      <Hero>
        <div className='row justify-content-between'>
          <div className='col-lg-5'>
            <div className='intro-excerpt'>
              <h1>Register</h1>
            </div>
          </div>
          <div className='col-lg-7'></div>
        </div>
      </Hero>

      {/* Register */}
      <div className='untree_co-section'>
        <div className='container'>
          <div className='block'>
            <div className='row justify-content-center'>
              <div className='col-md-8 col-lg-8 pb-4'>
                <div className='py-4 rounded' role='alert'>
                  Returning customer? <Link to='/login'>Click here</Link> to
                  login
                </div>
                <form>
                  <div className='row'>
                    <div className='col-6'>
                      <div className='form-group'>
                        <label className='text-black' htmlFor='fname'>
                          First name
                        </label>
                        <input
                          type='text'
                          className='form-control'
                          id='fname'
                        />
                      </div>
                    </div>
                    <div className='col-6'>
                      <div className='form-group'>
                        <label className='text-black' htmlFor='lname'>
                          Last name
                        </label>
                        <input
                          type='text'
                          className='form-control'
                          id='lname'
                        />
                      </div>
                    </div>
                  </div>
                  <div className='form-group'>
                    <label className='text-black' htmlFor='email'>
                      Email address
                    </label>
                    <input type='email' className='form-control' id='email' />
                  </div>
                  <div className='form-group'>
                    <label className='text-black' htmlFor='password'>
                      Password
                    </label>
                    <input
                      type='password'
                      className='form-control'
                      id='password'
                    />
                  </div>

                  <button
                    type='submit'
                    className='btn btn-primary-hover-outline mt-5'>
                    Register
                  </button>
                </form>
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

export default Register;
