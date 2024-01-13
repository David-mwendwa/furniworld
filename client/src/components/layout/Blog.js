import React from 'react';
import { Link } from 'react-router-dom';

const Blog = () => {
  return (
    <div
      className='blog-section'
      data-aos='zoom-in-down'
      data-aos-duration='1500'>
      <div className='container'>
        <div className='row mb-5'>
          <div className='col-md-6'>
            <h2 className='section-title'>Recent Blog</h2>
          </div>
          <div className='col-md-6 text-start text-md-end'>
            <Link to='/blog' className='more'>
              View All Posts
            </Link>
          </div>
        </div>

        <div className='row'>
          <div className='col-12 col-sm-6 col-md-4 mb-4 mb-md-0'>
            <div className='post-entry'>
              <Link to='/' className='post-thumbnail'>
                <img src='images/post-1.jpg' alt='' className='img-fluid' />
              </Link>
              <div className='post-content-entry'>
                <h3>
                  <Link to='/'>First Time Home Owner Ideas</Link>
                </h3>
                <div className='meta'>
                  <span>
                    by <Link to='/'>Janathan Kamau</Link>
                  </span>{' '}
                  <span>
                    on <Link to='/'>Dec 19, 2023</Link>
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className='col-12 col-sm-6 col-md-4 mb-4 mb-md-0'>
            <div className='post-entry'>
              <Link to='/' className='post-thumbnail'>
                <img src='images/post-2.jpg' alt='' className='img-fluid' />
              </Link>
              <div className='post-content-entry'>
                <h3>
                  <Link to='/'>How To Keep Your Furniture Clean</Link>
                </h3>
                <div className='meta'>
                  <span>
                    by <Link to='/'>Robert Fox</Link>
                  </span>{' '}
                  <span>
                    on <Link to='/'>Dec 15, 2023</Link>
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className='col-12 col-sm-6 col-md-4 mb-4 mb-md-0'>
            <div className='post-entry'>
              <Link to='/' className='post-thumbnail'>
                <img src='images/post-3.jpg' alt='' className='img-fluid' />
              </Link>
              <div className='post-content-entry'>
                <h3>
                  <Link to='/'>Small Space Furniture Apartment Ideas</Link>
                </h3>
                <div className='meta'>
                  <span>
                    by <Link to='/'>Kristin Watson</Link>
                  </span>{' '}
                  <span>
                    on <Link to='/'>Dec 12, 2023</Link>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Blog;
