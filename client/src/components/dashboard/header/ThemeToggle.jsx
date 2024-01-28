import { BsFillSunFill, BsFillMoonFill } from 'react-icons/bs';
import Wrapper from './ThemeToggle.styles';
import { useDashboardContext } from '../layout/DashboardLayout';

const ThemeToggle = () => {
  const { isDarkTheme, toggleDarkTheme } = useDashboardContext();
  return (
    <Wrapper onClick={toggleDarkTheme}>
      {isDarkTheme ? (
        <BsFillSunFill className='toggle-icon' />
      ) : (
        <BsFillMoonFill />
      )}
    </Wrapper>
  );
};

export default ThemeToggle;
