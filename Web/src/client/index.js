import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import { Auth0Provider } from "./utils/react-auth0-spa";
import config from "./auth_config.json";
import history from "./utils/history";

const onRedirectCallback = appState => {
  history.push(
    appState && appState.targetUrl
      ? appState.targetUrl
      : window.location.pathname
  );
};

ReactDOM.render(
  <Auth0Provider
    domain={config.domain}
    client_id={config.clientId}
    audience={config.audience}
    cacheLocation={config.cacheLocation}
    redirect_uri={window.location.origin}
    onRedirectCallback={onRedirectCallback}
  >
    <App />
  </Auth0Provider>,
  document.getElementById("root")
);