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
        <div className='justify-content-between  text-center'>
          <h1>Profile</h1>
        </div>
      </Hero>

      {/* Profile */}
      <div className='untree_co-section'>
        <div className='container'></div>
      </div>

      {/* Footer */}
      <Footer />
    </>
  );
};

export default Register;
