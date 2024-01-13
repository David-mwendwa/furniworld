import React from 'react';
import Moment from 'react-moment';
import { Link } from 'react-router-dom';
import Header from '../layout/Header';
import Hero from '../layout/Hero';
import Footer from '../layout/Footer';
// import BlogItem from './BlogItem';
import blogs from './blogs';

const Blog = () => {
  return (
    <>
      <Header />
      {/* Hero Section */}
      <Hero>
        <div className='row justify-content-between'>
          <div className='col-lg-5'>
            <div className='intro-excerpt'>
              <h1>Blog</h1>
              <p className='mb-4'>
                Donec vitae odio quis nisl dapibus malesuada. Nullam ac aliquet
                velit. Aliquam vulputate velit imperdiet dolor tempor tristique.
              </p>
              <p>
                <Link to='' className='btn btn-secondary me-2'>
                  Shop Now
                </Link>
                <Link to='/' className='btn btn-white-outline'>
                  Explore
                </Link>
              </p>
            </div>
          </div>
          <div className='col-lg-7'>
            <div className='hero-img-wrap'>
              <img src='images/couch.png' alt='' className='img-fluid' />
            </div>
          </div>
        </div>
      </Hero>

      {/* Blog Section */}
      <div className='blog-section'>
        <div className='container'>
          <div className='row'>
            {blogs.map((blog) => (
              <div key={blog.id} className='col-12 col-sm-6 col-md-4 mb-5'>
                <div className='post-entry'>
                  <Link to='/' className='post-thumbnail'>
                    <img src={blog.src} alt='' className='img-fluid' />
                  </Link>
                  <div className='post-content-entry'>
                    <h3>
                      <Link to='/'>{blog.title}</Link>
                    </h3>
                    <div className='meta'>
                      <span>
                        by <Link to='/'>{blog.author}</Link>
                      </span>{' '}
                      <span>
                        on{' '}
                        <Link to='/'>
                          <Moment format='MMM DD, YYYY'>{blog.date}</Moment>
                        </Link>
                      </span>
                    </div>
                  </div>
                </div>
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

export default Blog;
