import React from 'react';
import { AppContainer } from 'react-hot-loader';
import {render} from 'react-dom';
import { Router, hashHistory } from 'react-router';
import { CookiesProvider } from 'react-cookie';

import routes from './routes.jsx';

const renderApp = (appRoutes) => {
  render(
    <AppContainer>
      <CookiesProvider>
      <Router history={hashHistory}>
        {appRoutes()}
      </Router>
      </CookiesProvider>
    </AppContainer>,
    document.getElementById('app')
  )
};


renderApp(routes);

// react HMR
if(module.hot) {
  module.hot.accept('./routes.jsx', () => {
    const routeChanges = require('./routes.jsx').default;
    renderApp(routeChanges);
  })
}
