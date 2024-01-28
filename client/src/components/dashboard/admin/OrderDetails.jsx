import Wrapper from './OrderDetails.styles';
import SectionHeader from './sectionHeader';

let meta = { section: 'order', subsection: 'details' };

const OrderDetails = () => {
  return (
    <Wrapper>
      <SectionHeader meta={meta} />
    </Wrapper>
  );
};

export default OrderDetails;
