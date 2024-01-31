import { MDBDataTable } from 'mdbreact';
import Wrapper from './ProductsList.styles';
import SectionHeader from './sectionHeader';
import { NavLink } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { FaPencilAlt } from 'react-icons/fa';
import { FaTrashAlt } from 'react-icons/fa';

import PRODUCTS from './PRODUCTS';

let products = PRODUCTS.map((product) =>
  Object.assign(product, { _id: uuidv4() })
);

let meta = { section: 'products', subsection: '' };

const ProductsList = () => {
  const deleteProductHandler = (id) => {
    console.log('delete', id);
  };

  const setProducts = () => {
    const data = {
      columns: [
        { label: '#', field: 'id', sort: 'asc' },
        { label: 'Name', field: 'name', sort: 'asc' },
        { label: 'Price', field: 'price', sort: 'asc' },
        { label: 'Categories', field: 'categories', sort: 'asc' },
        { label: 'Actions', field: 'actions', sort: 'asc' },
      ],
      rows: [],
    };

    products.forEach((product) => {
      data.rows.push({
        id: product._id,
        name: product.name,
        price: `KSh.${product.price.toLocaleString()}`,
        categories: product.categories.join(', '),
        actions: (
          <div className='d-flex'>
            <NavLink
              to={`/dashboard/product/${product._id}`}
              className='btn btn-primary py-1 px-2'>
              <FaPencilAlt />
            </NavLink>
            <button
              className='btn btn-danger py-1 px-2 ml-2'
              onClick={() => deleteProductHandler(product._id)}>
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
      <MDBDataTable data={setProducts()} bordered striped hover />
    </Wrapper>
  );
};

export default ProductsList;
