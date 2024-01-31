import Wrapper from './EditUser.styles';
import SectionHeader from './sectionHeader';

let meta = { section: 'user', subsection: 'edit' };

const EditUser = () => {
  return (
    <Wrapper>
      <SectionHeader meta={meta} />
    </Wrapper>
  );
};

export default EditUser;
