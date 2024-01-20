import React from 'react';
import { Link } from 'react-router-dom';

const ProductDetails = ({ product }) => {
  return (
    <Link className='product-item' to='/'>
      <img
        src={`images/${product.filename}`}
        alt={product.name}
        className='img-fluid product-thumbnail'
      />
      <h3 className='product-title'>{product.name}</h3>
      <strong className='product-price'>Ksh. {product.price}</strong>

      <span className='icon-cross'>
        <img src='images/cross.svg' alt='cross' className='img-fluid' />
      </span>
    </Link>
  );
};

export default ProductDetails;
