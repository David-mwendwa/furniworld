import Header from './layout/Header';
import Footer from './layout/Footer';
import ProductDetails from './ProductDetails';
import Hero from './layout/Hero';
import products from '../PRODUCTS';

const Product = () => {
  return (
    <>
      <Header />
      {/* Hero Section */}
      <Hero>
        <div className='justify-content-between  text-center'>
          <h1>Shop</h1>
        </div>
      </Hero>

      {/* Products */}
      <div className='untree_co-section product-section before-footer-section'>
        <div className='container'>
          <div className='row'>
            {products.map((product) => (
              <div key={product.name} className='col-12 col-md-4 col-lg-3 mb-5'>
                <ProductDetails key={product.name} product={product} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </>
  );
};

export default Product;
