import Wrapper from './SectionHeader.styles';

const SectionHeader = ({ meta }) => {
  return (
    <Wrapper>
      <div className='section-header'>
        <h3 className='section-title'>{meta.section}</h3>
        <nav aria-label='breadcrumb'>
          <ol className='breadcrumb'>
            <li className='breadcrumb-item'>
              <a href='#'>{meta.section}</a>
            </li>
            <li className='breadcrumb-item active' aria-current='page'>
              {meta.subsection}
            </li>
          </ol>
        </nav>
      </div>
    </Wrapper>
  );
};

export default SectionHeader;
