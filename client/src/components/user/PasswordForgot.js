import React from 'react';

const PasswordForgot = () => {
  return (
    <>
      <div className='untree_co-section'>
        <div className='container'>
          <div className='block'>
            <div className='row justify-content-center'>
              <div className='col-md-8 col-lg-8 pb-4'>
                <h4 className='py-3 rounded' role='alert'>
                  Reset your password
                </h4>
                <div className='pb-4 rounded' role='alert'>
                  We will send you an email to reset your password
                </div>
                <form>
                  <div className='form-group'>
                    <label className='text-black' htmlFor='email'>
                      Email address
                    </label>
                    <input
                      type='email'
                      className='form-control'
                      id='email'
                      required
                    />
                  </div>

                  <button
                    type='submit'
                    className='btn btn-primary-hover-outline mt-4'>
                    Submit
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PasswordForgot;
