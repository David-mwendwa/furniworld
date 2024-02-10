import { Form, redirect, useNavigation } from 'react-router-dom';
import customFetch from '../../utils/customFetch';
import { toast } from 'react-toastify';

export const action = async ({ request }) => {
  const formData = await request.formData();
  const data = Object.fromEntries(formData);
  console.log({ data });
  try {
    await customFetch.post('/user/password-forgot', data);
    toast.success('Check your email for password reset link');
    return redirect('/');
  } catch (error) {
    toast.error(error?.response?.data?.message || error?.message);
    return error;
  }
};

const PasswordForgot = () => {
  const navigation = useNavigation();
  const isSubmitting = /submitting/.test(navigation.state);

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
                <Form method='post'>
                  <div className='form-group'>
                    <label className='text-black' htmlFor='email'>
                      Email address
                    </label>
                    <input
                      type='email'
                      className='form-control'
                      name='email'
                      id='email'
                      required
                    />
                  </div>

                  <button
                    type='submit'
                    className='btn btn-primary-hover-outline mt-4'
                    disabled={isSubmitting}>
                    {isSubmitting ? 'Submitting...' : 'Submit'}
                  </button>
                </Form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PasswordForgot;
