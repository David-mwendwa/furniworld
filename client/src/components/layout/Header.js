import React from 'react';
import { NavLink } from 'react-router-dom';

const Header = () => {
  return (
    <nav
      className='custom-navbar navbar navbar navbar-expand-md navbar-dark bg-dark'
      arial-label='Furni navigation bar'>
      <div className='container'>
        <NavLink className='navbar-brand' to='.'>
          Furni<span>world</span>
        </NavLink>

        <button
          className='navbar-toggler'
          type='button'
          data-bs-toggle='collapse'
          data-bs-target='#navbarsFurni'
          aria-controls='navbarsFurni'
          aria-expanded='false'
          aria-label='Toggle navigation'>
          <span className='navbar-toggler-icon'></span>
        </button>

        <div className='collapse navbar-collapse' id='navbarsFurni'>
          <ul className='custom-navbar-nav navbar-nav ms-auto mb-2 mb-md-0'>
            <li className='nav-item active'>
              <NavLink className='nav-link' to='/' key='home' end>
                Home
              </NavLink>
            </li>
            <li>
              <NavLink className='nav-link' to='/shop' key='shop' end>
                Shop
              </NavLink>
            </li>
            <li>
              <NavLink className='nav-link' to='/about' key='about' end>
                About us
              </NavLink>
            </li>
            <li>
              <NavLink className='nav-link' to='/services' key='services' end>
                Services
              </NavLink>
            </li>
            <li>
              <NavLink className='nav-link' to='/contact' key='contact' end>
                Contact us
              </NavLink>
            </li>
            <li>
              <NavLink className='nav-link' to='/login' key='login' end>
                Login
              </NavLink>
            </li>
          </ul>

          <ul className='custom-navbar-cta navbar-nav mb-2 mb-md-0 ms-5'>
            <li>
              <NavLink className='nav-link' to='/profile'>
                <img src='images/user.svg' alt='' />
              </NavLink>
            </li>
            <li>
              <NavLink className='nav-link' to='/cart'>
                <img src='images/cart.svg' alt='' />
              </NavLink>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Header;
