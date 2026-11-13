// Native Genesys deployment snippet, restricted to the deployment's controlled hostname.
if (location.hostname === 'banking.simonridd.com') {
  (function (g, e, n, es, ys) {    g['_genesysJs'] = e;    g[e] = g[e] || function () {      (g[e].q = g[e].q || []).push(arguments)    };    g[e].t = 1 * new Date();    g[e].c = es;    ys = document.createElement('script'); ys.async = 1; ys.src = n; ys.charset = 'utf-8'; document.head.appendChild(ys);  })(window, 'Genesys', 'https://apps.mypurecloud.ie/genesys-bootstrap/genesys.min.js', {    environment: 'prod-euw1',    deploymentId: 'd26611d2-361e-4899-a2a5-4b75a9fb6ba0'  });
}
