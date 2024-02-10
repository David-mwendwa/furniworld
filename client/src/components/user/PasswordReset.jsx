import { Form, redirect, useNavigation } from 'react-router-dom';
import customFetch from '../../utils/customFetch';
import { toast } from 'react-toastify';

export const action = async ({ request, params }) => {
  const formData = await request.formData();
  const data = Object.fromEntries(formData);
  console.log({ data, params });
  try {
    await customFetch.patch(`/user/password-reset/${params.token}`, data);
    toast.success('Password reset successfully');
    return redirect('/login');
  } catch (error) {
    toast.error(error?.response?.data?.message || error?.message);
    return error;
  }
};

const PasswordReset = () => {
  const navigation = useNavigation();
  const isSubmitting = /submitting/.test(navigation.state);

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
                <Form method='post'>
                  <div className='form-group'>
                    <label className='text-black' htmlFor='password'>
                      New Password
                    </label>
                    <input
                      type='password'
                      className='form-control'
                      id='password'
                      name='password'
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
                      name='passwordConfirm'
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

export default PasswordReset;
