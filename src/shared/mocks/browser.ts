import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

export const worker = setupWorker(...handlers);

worker.start({
  onUnhandledRequest(request, print) {
    if (request.url.includes('/api/auth') || request.url.includes('slidtodo.store') || request.url.includes('/api/proxy')) {
      return;
    }
    print.warning();
  },
});
