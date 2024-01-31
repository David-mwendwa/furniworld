import Header from '../layout/Header';
import Footer from '../layout/Footer';
import Hero from '../layout/Hero';
import { Form, Link, redirect, useNavigation } from 'react-router-dom';
import customFetch from '../../utils/customFetch';
import { toast } from 'react-toastify';

export const action = async ({ request }) => {
  const formData = await request.formData();
  const data = Object.fromEntries(formData);
  try {
    await customFetch.post('/user/login', data);
    toast.success('Login successfull');
    return redirect('/dashboard');
  } catch (error) {
    toast.error(error?.response?.data?.message || error?.message);
    console.log(error);
    return error;
  }
};

const Login = () => {
  const navigation = useNavigation();
  const isSubmitting = /submitting/.test(navigation.state);

  return (
    <>
      <Header />
      {/* Hero Section */}
      <Hero>
        <div className='justify-content-between  text-center'>
          <h1>Login</h1>
        </div>
      </Hero>

      {/* Register */}
      <div className='untree_co-section'>
        <div className='container'>
          <div className='block'>
            <div className='row justify-content-center'>
              <div className='col-md-8 col-lg-8 pb-4'>
                <div className='py-4 rounded' role='alert'>
                  New customer? <Link to='/register'>Click here</Link> to
                  register
                </div>
                <Form method='POST'>
                  <div className='form-group'>
                    <label className='text-black' htmlFor='email'>
                      Email address
                    </label>
                    <input
                      type='email'
                      className='form-control'
                      id='email'
                      name='email'
                      required
                    />
                  </div>
                  <div className='form-group'>
                    <label className='text-black' htmlFor='password'>
                      Password
                    </label>
                    <input
                      type='password'
                      className='form-control'
                      id='password'
                      name='password'
                      required
                    />
                  </div>
                  <div className='py-2 rounded'>
                    <Link to='/password-forgot'>Forgot your password?</Link>
                  </div>

                  <button
                    type='submit'
                    className='btn btn-primary-hover-outline mt-5'
                    disabled={isSubmitting}>
                    {isSubmitting ? 'Submitting...' : 'Login'}
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

export default Login;
