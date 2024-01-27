import { FaAlignLeft } from 'react-icons/fa';
import Wrapper from './Navbar.styles';
import Logo from '../../components/layout/Logo';
import { useDashboardContext } from '../DashboardLayout';
import { IoLogOutOutline } from 'react-icons/io5';

import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';

const Navbar = () => {
  const { toggleSidebar } = useDashboardContext();
  return (
    <Wrapper>
      <div className='nav-center'>
        <button type='button' className='toggle-btn' onClick={toggleSidebar}>
          <FaAlignLeft />
        </button>
        <div>
          <Logo />
          <h4 className='logo-text'>dashboard</h4>
        </div>
        <div className='btn-container'>
          <DropdownButton id='dropdown-item-button' title={`David Mwendwa`}>
            <Dropdown.Item as='button'>
              <IoLogOutOutline />
              <span className='ml-2'>Logout</span>
            </Dropdown.Item>
          </DropdownButton>
        </div>
      </div>
    </Wrapper>
  );
};

export default Navbar;
