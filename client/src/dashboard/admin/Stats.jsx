import Wrapper from './Stats.styles';
import SectionHeader from './sectionHeader';

let meta = { section: 'dashboard', subsection: 'overview' };

const Stats = () => {
  return (
    <Wrapper>
      <SectionHeader meta={meta} />
    </Wrapper>
  );
};

export default Stats;
