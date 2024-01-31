import { NavLink } from 'react-router-dom';

const Logo = () => {
  return (
    <NavLink className='navbar-brand' to='.'>
      Furni<span>world</span>
    </NavLink>
  );
};

export default Logo;
