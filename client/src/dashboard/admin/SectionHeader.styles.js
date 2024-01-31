import styled from 'styled-components';

const Wrapper = styled.section`
  /* @extend .d-flex;
    @extend .justify-content-between;
    @extend .align-items-center; */
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 0 0 1.5rem 0;
  }
  .section-title {
    text-transform: uppercase;
    font-size: 1.125rem;
    margin-bottom: 0;
  }
  .breadcrumb {
    border: 1px solid #ebedf2;
    border: 0;
    margin-bottom: 0;
    background-color: inherit;
  }
  .breadcrumb-item {
    text-transform: capitalize;
    font-size: 14px;
  }
`;
export default Wrapper;
