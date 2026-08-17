import { Container } from '../components/ui/Feedback.jsx';
import Button from '../components/ui/Button.jsx';

const NotFound = () => (
  <Container className="flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
    <p className="eyebrow">404</p>
    <h1 className="mt-4 text-display-md">We could not find that page</h1>
    <p className="mt-4 max-w-md text-sm leading-relaxed text-dark-600">
      The link may be out of date, or the piece you were looking for has been
      archived.
    </p>
    <div className="mt-8 flex gap-4">
      <Button to="/">Back home</Button>
      <Button to="/shop" variant="outline">
        Browse furniture
      </Button>
    </div>
  </Container>
);

export default NotFound;
