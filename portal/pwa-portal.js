'use strict';
(()=>{if(window.top!==window)return;window.addEventListener('load',()=>{if('serviceWorker'in navigator)navigator.serviceWorker.register('../sw.js',{scope:'../',updateViaCache:'none'}).then(reg=>reg.update()).catch(()=>{});});})();
