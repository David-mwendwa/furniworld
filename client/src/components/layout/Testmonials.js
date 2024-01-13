import React from 'react';

// Should be a slider
const Testmonials = () => {
  return (
    <div
      className='testimonial-section'
      data-aos='zoom-in-down'
      data-aos-duration='1500'>
      <div className='container'>
        <div className='row'>
          <div className='col-lg-7 mx-auto text-center'>
            <h2 className='section-title'>Testimonials</h2>
          </div>
        </div>
        <div
          id='carouselExampleControls'
          class='carousel slide text-center carousel-dark'
          data-mdb-ride='carousel'>
          <div class='carousel-inner'>
            <div class='carousel-item active'>
              <img
                class='rounded-circle shadow-1-strong mb-4'
                src='https://mdbcdn.b-cdn.net/img/Photos/Avatars/img%20(10).webp'
                alt='avatar'
                style={{ width: '150px' }}
              />
              <div class='row d-flex justify-content-center'>
                <div class='col-lg-8'>
                  <h5 class='mb-3'>Maria Kate</h5>
                  <p class='text-muted'>
                    <i class='fas fa-quote-left pe-2'></i>
                    Lorem ipsum dolor sit amet consectetur adipisicing elit.
                    Minus et deleniti nesciunt sint eligendi reprehenderit
                    reiciendis, quibusdam illo, beatae quia fugit consequatur
                    laudantium velit magnam error. Consectetur distinctio fugit
                    doloremque.
                  </p>
                </div>
              </div>
              <ul class='list-unstyled d-flex justify-content-center text-warning mb-0'>
                <li>
                  <i class='fas fa-star fa-sm'></i>
                </li>
                <li>
                  <i class='fas fa-star fa-sm'></i>
                </li>
                <li>
                  <i class='fas fa-star fa-sm'></i>
                </li>
                <li>
                  <i class='fas fa-star fa-sm'></i>
                </li>
                <li>
                  <i class='far fa-star fa-sm'></i>
                </li>
              </ul>
            </div>
            <div class='carousel-item'>
              <img
                class='rounded-circle shadow-1-strong mb-4'
                src='https://mdbcdn.b-cdn.net/img/Photos/Avatars/img%20(32).webp'
                alt='avatar'
                style={{ width: '150px' }}
              />
              <div class='row d-flex justify-content-center'>
                <div class='col-lg-8'>
                  <h5 class='mb-3'>John Doe</h5>
                  <p>Web Developer</p>
                  <p class='text-muted'>
                    <i class='fas fa-quote-left pe-2'></i>
                    Lorem ipsum dolor sit amet consectetur adipisicing elit.
                    Minus et deleniti nesciunt sint eligendi reprehenderit
                    reiciendis.
                  </p>
                </div>
              </div>
              <ul class='list-unstyled d-flex justify-content-center text-warning mb-0'>
                <li>
                  <i class='fas fa-star fa-sm'></i>
                </li>
                <li>
                  <i class='fas fa-star fa-sm'></i>
                </li>
                <li>
                  <i class='fas fa-star fa-sm'></i>
                </li>
                <li>
                  <i class='fas fa-star fa-sm'></i>
                </li>
                <li>
                  <i class='far fa-star fa-sm'></i>
                </li>
              </ul>
            </div>
            <div class='carousel-item'>
              <img
                class='rounded-circle shadow-1-strong mb-4'
                src='https://mdbcdn.b-cdn.net/img/Photos/Avatars/img%20(1).webp'
                alt='avatar'
                style={{ width: '150px' }}
              />
              <div class='row d-flex justify-content-center'>
                <div class='col-lg-8'>
                  <h5 class='mb-3'>Anna Deynah</h5>
                  <p>UX Designer</p>
                  <p class='text-muted'>
                    <i class='fas fa-quote-left pe-2'></i>
                    Lorem ipsum dolor sit amet consectetur adipisicing elit.
                    Minus et deleniti nesciunt sint eligendi reprehenderit
                    reiciendis, quibusdam illo, beatae quia fugit consequatur
                    laudantium velit magnam error. Consectetur distinctio fugit
                    doloremque.
                  </p>
                </div>
              </div>
              <ul class='list-unstyled d-flex justify-content-center text-warning mb-0'>
                <li>
                  <i class='fas fa-star fa-sm'></i>
                </li>
                <li>
                  <i class='fas fa-star fa-sm'></i>
                </li>
                <li>
                  <i class='fas fa-star fa-sm'></i>
                </li>
                <li>
                  <i class='fas fa-star fa-sm'></i>
                </li>
                <li>
                  <i class='far fa-star fa-sm'></i>
                </li>
              </ul>
            </div>
          </div>
          <button
            class='carousel-control-prev'
            type='button'
            data-mdb-target='#carouselExampleControls'
            data-mdb-slide='prev'>
            <span class='carousel-control-prev-icon' aria-hidden='true'></span>
            <span class='visually-hidden'>Previous</span>
          </button>
          <button
            class='carousel-control-next'
            type='button'
            data-mdb-target='#carouselExampleControls'
            data-mdb-slide='next'>
            <span class='carousel-control-next-icon' aria-hidden='true'></span>
            <span class='visually-hidden'>Next</span>
          </button>
        </div>

        {/* <div className='row justify-content-center'>
          <div className='col-lg-12'>
            <div className='testimonial-slider-wrap text-center'>
              <div id='testimonial-nav'>
                <span className='prev' data-controls='prev'>
                  <span className='fa fa-chevron-left'></span>
                </span>
                <span className='next' data-controls='next'>
                  <span className='fa fa-chevron-right'></span>
                </span>
              </div>

              <div className='testimonial-slider'>
                <div className='item'>
                  <div className='row justify-content-center'>
                    <div className='col-lg-8 mx-auto'>
                      <div className='testimonial-block text-center'>
                        <blockquote className='mb-5'>
                          <p>
                            &ldquo;Donec facilisis quam ut purus rutrum
                            lobortis. Donec vitae odio quis nisl dapibus
                            malesuada. Nullam ac aliquet velit. Aliquam
                            vulputate velit imperdiet dolor tempor tristique.
                            Pellentesque habitant morbi tristique senectus et
                            netus et malesuada fames ac turpis egestas. Integer
                            convallis volutpat dui quis scelerisque.&rdquo;
                          </p>
                        </blockquote>

                        <div className='author-info'>
                          <div className='author-pic'>
                            <img
                              src='images/person-1.png'
                              alt='Maria Jones'
                              className='img-fluid'
                            />
                          </div>
                          <h3 className='font-weight-bold'>Maria Jones</h3>
                          <span className='position d-block mb-3'>
                            CEO, Co-Founder, XYZ Inc.
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className='item'>
                  <div className='row justify-content-center'>
                    <div className='col-lg-8 mx-auto'>
                      <div className='testimonial-block text-center'>
                        <blockquote className='mb-5'>
                          <p>
                            &ldquo;Donec facilisis quam ut purus rutrum
                            lobortis. Donec vitae odio quis nisl dapibus
                            malesuada. Nullam ac aliquet velit. Aliquam
                            vulputate velit imperdiet dolor tempor tristique.
                            Pellentesque habitant morbi tristique senectus et
                            netus et malesuada fames ac turpis egestas. Integer
                            convallis volutpat dui quis scelerisque.&rdquo;
                          </p>
                        </blockquote>

                        <div className='author-info'>
                          <div className='author-pic'>
                            <img
                              src='images/person-1.png'
                              alt='Maria Jones'
                              className='img-fluid'
                            />
                          </div>
                          <h3 className='font-weight-bold'>Maria Jones</h3>
                          <span className='position d-block mb-3'>
                            CEO, Co-Founder, XYZ Inc.
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className='item'>
                  <div className='row justify-content-center'>
                    <div className='col-lg-8 mx-auto'>
                      <div className='testimonial-block text-center'>
                        <blockquote className='mb-5'>
                          <p>
                            &ldquo;Donec facilisis quam ut purus rutrum
                            lobortis. Donec vitae odio quis nisl dapibus
                            malesuada. Nullam ac aliquet velit. Aliquam
                            vulputate velit imperdiet dolor tempor tristique.
                            Pellentesque habitant morbi tristique senectus et
                            netus et malesuada fames ac turpis egestas. Integer
                            convallis volutpat dui quis scelerisque.&rdquo;
                          </p>
                        </blockquote>

                        <div className='author-info'>
                          <div className='author-pic'>
                            <img
                              src='images/person-1.png'
                              alt='Maria Jones'
                              className='img-fluid'
                            />
                          </div>
                          <h3 className='font-weight-bold'>Maria Jones</h3>
                          <span className='position d-block mb-3'>
                            CEO, Co-Founder, XYZ Inc.
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div> */}
      </div>
    </div>
  );
};

export default Testmonials;
