import React from 'react';

const PasswordReset = () => {
  return (
    <>
      <div className='untree_co-section'>
        <div className='container'>
          <div className='block'>
            <div className='row justify-content-center'>
              <div className='col-md-8 col-lg-8 pb-4'>
                <div className='pb-4 rounded' role='alert'>
                  Reset Your Password
                </div>
                <form>
                  <div className='form-group'>
                    <label className='text-black' htmlFor='password'>
                      New Password
                    </label>
                    <input
                      type='password'
                      className='form-control'
                      id='password'
                      required
                    />
                  </div>
                  <div className='form-group'>
                    <label className='text-black' htmlFor='passwordConfirm'>
                      Confrim New Password
                    </label>
                    <input
                      type='password'
                      className='form-control'
                      id='passwordConfirm'
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

export default PasswordReset;
