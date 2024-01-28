import Wrapper from './Profile.styles';
import SectionHeader from './sectionHeader';

let meta = { section: 'profile', subsection: '' };

const Profile = () => {
  return (
    <Wrapper>
      <SectionHeader meta={meta} />
    </Wrapper>
  );
};

export default Profile;
