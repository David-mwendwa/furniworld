import { Helmet } from 'react-helmet';

const MetaData = ({ title }) => {
  return (
    <Helmet>
      <title>{`${title} | Furniworld`}</title>
    </Helmet>
  );
};

export default MetaData;
