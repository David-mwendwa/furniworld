import { createContext, useCallback, useContext, useRef, useState } from 'react';
import { Modal } from '../components/ui/Overlay.jsx';
import Button from '../components/ui/Button.jsx';

const ConfirmContext = createContext(null);

export const ConfirmProvider = ({ children }) => {
  const [request, setRequest] = useState(null);
  const resolver = useRef(null);

  const confirm = useCallback((options) => {
    setRequest(options);
    return new Promise((resolve) => {
      resolver.current = resolve;
    });
  }, []);

  const settle = (result) => {
    resolver.current?.(result);
    resolver.current = null;
    setRequest(null);
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <Modal
        open={Boolean(request)}
        onClose={() => settle(false)}
        title={request?.title ?? 'Are you sure?'}
        description={request?.description}
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => settle(false)}>
              {request?.cancelLabel ?? 'Cancel'}
            </Button>
            <Button
              variant={request?.destructive ? 'danger' : 'primary'}
              size="sm"
              onClick={() => settle(true)}>
              {request?.confirmLabel ?? 'Confirm'}
            </Button>
          </>
        }
      />
    </ConfirmContext.Provider>
  );
};

export const useConfirm = () => {
  const context = useContext(ConfirmContext);
  if (!context) throw new Error('useConfirm must be used inside a ConfirmProvider');
  return context;
};
