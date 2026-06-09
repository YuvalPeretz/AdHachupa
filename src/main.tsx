import './i18n';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { Provider } from 'react-redux';
import { App, ConfigProvider } from 'antd';
import { RouterProvider } from 'react-router';
import { queryClient } from './lib/queryClient';
import { store } from './store';
import { appTheme } from './theme';
import { router } from './router';
import { AuthListener } from './features/auth/AuthListener';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
        <AuthListener />
        <ConfigProvider direction="rtl" theme={appTheme}>
          <App>
            <RouterProvider router={router} />
          </App>
        </ConfigProvider>
      </Provider>
    </QueryClientProvider>
  </StrictMode>,
);
