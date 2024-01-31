import { MDBDataTable } from 'mdbreact';
import Wrapper from './UsersList.styles';
import SectionHeader from './sectionHeader';
import { NavLink } from 'react-router-dom';
import { FaEye } from 'react-icons/fa6';
import { FaTrashAlt } from 'react-icons/fa';

let meta = { section: 'orders', subsection: '' };

const orders = [
  {
    _id: '626e5e65ebf5886d32fd6f74',
    numOfItems: 3,
    amount: 342000,
    orderStatus: 'processing',
  },
  {
    _id: '627115f399226d947748ed5d',
    numOfItems: 2,
    amount: 87000,
    orderStatus: 'delivered',
  },
];

const OrdersList = () => {
  const deleteOrderHandler = (id) => {
    console.log('delete', id);
  };

  const setOrders = () => {
    const data = {
      columns: [
        { label: '#', field: 'id', sort: 'asc' },
        { label: 'Items', field: 'numOfItems', sort: 'asc' },
        { label: 'Amount', field: 'amount', sort: 'asc' },
        { label: 'Status', field: 'status', sort: 'asc' },
        { label: 'Actions', field: 'actions', sort: 'asc' },
      ],
      rows: [],
    };

    orders.forEach((order) => {
      data.rows.push({
        id: order._id,
        numOfItems: order.numOfItems,
        amount: order.amount,
        status:
          order.orderStatus && /delivered/i.test(String(order.orderStatus)) ? (
            <p style={{ color: 'green' }}>{order.orderStatus}</p>
          ) : (
            <p style={{ color: 'red' }}>{order.orderStatus}</p>
          ),
        actions: (
          <div className='d-flex'>
            <NavLink
              to={`/dashboard/order/${order._id}`}
              className='btn btn-primary py-1 px-2'>
              <FaEye />
            </NavLink>
            <button
              className='btn btn-danger py-1 px-2 ml-2'
              onClick={() => deleteOrderHandler(order._id)}>
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
      <MDBDataTable data={setOrders()} bordered striped hover />
    </Wrapper>
  );
};

export default OrdersList;
