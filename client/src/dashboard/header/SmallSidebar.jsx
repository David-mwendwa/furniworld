import { FaTimes } from 'react-icons/fa';
import Wrapper from './SmallSidebar.styles';
import Logo from '../../components/layout/Logo';
import NavLinks from './NavLinks';

import { useDashboardContext } from '../layout/Layout';

const SmallSidebar = () => {
  const { showSidebar, toggleSidebar } = useDashboardContext();
  console.log();
  return (
    <Wrapper>
      <div
        className={
          showSidebar ? 'sidebar-container show-sidebar' : 'sidebar-container'
        }>
        <div className='content'>
          <button type='button' className='close-btn' onClick={toggleSidebar}>
            <FaTimes />
          </button>
          <header>
            <Logo />
          </header>
          <NavLinks />
        </div>
      </div>
    </Wrapper>
  );
};

export default SmallSidebar;
