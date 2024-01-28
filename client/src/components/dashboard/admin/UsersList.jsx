import { MDBDataTable } from 'mdbreact';
import Wrapper from './UsersList.styles';
import SectionHeader from './sectionHeader';
import { NavLink } from 'react-router-dom';
import { FaPencilAlt } from 'react-icons/fa';
import { FaTrashAlt } from 'react-icons/fa';

let meta = { section: 'users', subsection: '' };

const users = [];

const UsersList = () => {
  const deleteUserHandler = (id) => {
    console.log('delete', id);
  };

  const setUsers = () => {
    const data = {
      columns: [
        { label: '#', field: 'id', sort: 'asc' },
        { label: 'Name', field: 'name', sort: 'asc' },
        { label: 'Email', field: 'email', sort: 'asc' },
        { label: 'Role', field: 'role', sort: 'asc' },
        { label: 'Actions', field: 'actions', sort: 'asc' },
      ],
      rows: [],
    };

    users.forEach((user) => {
      data.rows.push({
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        actions: (
          <div className='d-flex'>
            <NavLink
              to={`/dashboard/user/${user._id}`}
              className='btn btn-primary py-1 px-2'>
              <FaPencilAlt />
            </NavLink>
            <button
              className='btn btn-danger py-1 px-2 ml-2'
              onClick={() => deleteUserHandler(user._id)}>
              <FaTrashAlt />
            </button>
          </div>
        ),
      });
    });
    return data;
  };

  return (
    <Wrapper>
      <SectionHeader meta={meta} />
      <MDBDataTable data={setUsers()} bordered striped hover />
    </Wrapper>
  );
};

export default UsersList;
