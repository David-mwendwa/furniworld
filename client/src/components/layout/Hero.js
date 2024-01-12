import React from 'react';

const Hero = ({ children }) => {
  return (
    <div className='hero'>
      <div className='container'>{children}</div>
    </div>
  );
};

export default Hero;
