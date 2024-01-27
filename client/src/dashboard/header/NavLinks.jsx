import { NavLink } from 'react-router-dom';
import { useDashboardContext } from '../layout/Layout';

// import react icons
import { FaClipboardList } from 'react-icons/fa';
import { IoBarChartSharp } from 'react-icons/io5';
import { ImProfile } from 'react-icons/im';
import { MdOutlineAdd } from 'react-icons/md';
import { FaUsers } from 'react-icons/fa';
import { FaCartArrowDown } from 'react-icons/fa';

const links = [
  { text: 'stats', path: '.', icon: <IoBarChartSharp /> },
  { text: 'profile', path: 'profile', icon: <ImProfile /> },
  {
    text: 'products',
    path: 'products',
    icon: <FaClipboardList />,
    children: [
      { text: 'all', path: 'products', icon: <FaClipboardList /> },
      { text: 'create', path: 'new-product', icon: <MdOutlineAdd /> },
    ],
  },
  {
    text: 'users',
    path: 'users',
    icon: <FaUsers />,
  },
  {
    text: 'orders',
    path: 'orders',
    icon: <FaCartArrowDown />,
  },
];

const NavLinks = ({ isBigSidebar }) => {
  const { toggleSidebar } = useDashboardContext();
  return (
    <div className='nav-links'>
      {links.map((link) => {
        const { text, path, icon, children } = link;
        return children && children.length ? (
          <div key={text}>
            <a
              href={`#${text}Submenu`}
              data-toggle='collapse'
              aria-expanded='false'
              className='dropdown-toggle nav-link'>
              <span className='icon'>{icon}</span>
              {text}
            </a>
            <ul className='collapse list-unstyled' id={`${text}Submenu`}>
              {children.map((child) => (
                <li key={child.text}>
                  <NavLink
                    to={child.path}
                    key={text}
                    onClick={isBigSidebar ? null : toggleSidebar}
                    className='nav-link ml-4'
                    end>
                    <span className='icon'>{child.icon}</span>
                    {child.text}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <NavLink
            className='nav-link'
            to={path}
            key={text}
            onClick={isBigSidebar ? null : toggleSidebar}
            end>
            <span className='icon'>{icon}</span>
            {text}
          </NavLink>
        );
      })}
    </div>
  );
};

export default NavLinks;
