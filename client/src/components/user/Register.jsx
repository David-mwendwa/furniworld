import Header from '../layout/Header';
import Footer from '../layout/Footer';
import Hero from '../layout/Hero';
import { Form, Link, redirect, useNavigation } from 'react-router-dom';
import customFetch from '../../utils/customFetch';

export const action = async ({ request }) => {
  const formData = await request.formData();
  const data = Object.fromEntries(formData);
  try {
    await customFetch.post('/user/register', data);
    return redirect('/dashboard');
  } catch (error) {
    console.log(error);
    return error;
  }
};

const Register = () => {
  const navigate = useNavigation();
  const isSubmitting = /submitting/.test(navigate.state);

  return (
    <>
      <Header />
      {/* Hero Section */}
      <Hero>
        <div className='justify-content-between  text-center'>
          <h1>Register</h1>
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
                <Form method='post'>
                  <div className='row'>
                    <div className='form-group'>
                      <label className='text-black' htmlFor='name'>
                        Full name
                      </label>
                      <input
                        type='text'
                        className='form-control'
                        name='name'
                        id='name'
                      />
                    </div>
                  </div>
                  <div className='form-group'>
                    <label className='text-black' htmlFor='email'>
                      Email address
                    </label>
                    <input
                      type='email'
                      className='form-control'
                      name='email'
                      id='email'
                    />
                  </div>
                  <div className='form-group'>
                    <label className='text-black' htmlFor='password'>
                      Password
                    </label>
                    <input
                      type='password'
                      className='form-control'
                      name='password'
                      id='password'
                    />
                  </div>
                  <div className='form-group'>
                    <label className='text-black' htmlFor='passwordConfirm'>
                      Confirm Password
                    </label>
                    <input
                      type='password'
                      className='form-control'
                      name='passwordConfirm'
                      id='passwordConfirm'
                    />
                  </div>

                  <button
                    type='submit'
                    className='btn btn-primary-hover-outline mt-5'
                    disabled={isSubmitting}>
                    {isSubmitting ? 'submitting' : 'Register'}
                  </button>
                </Form>
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
