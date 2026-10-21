'use strict';
(()=>{
  // Old installed shortcuts may still launch the former seasonal-event entry.
  // Never redirect embedded event tools or ordinary browser links.
  const installed=window.matchMedia('(display-mode: standalone)').matches||window.navigator.standalone===true;
  if(window.top===window.self&&installed){
    window.location.replace(new URL('../portal/index.html?source=pwa-legacy#home',window.location.href).href);
  }
})();
