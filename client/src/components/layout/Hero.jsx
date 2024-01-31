const Hero = ({ children, title, description, isShop = false }) => {
  return (
    <div className='hero'>
      <div className='container'>{children}</div>
    </div>
  );
};

export default Hero;
