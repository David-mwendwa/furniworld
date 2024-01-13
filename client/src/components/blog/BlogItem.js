import React from 'react';
import Moment from 'react-moment';
import { Link } from 'react-router-dom';

const BlogItem = (blog) => {
  return (
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
  );
};

export default BlogItem;
