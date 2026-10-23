'use strict';
(()=>{
 if(window.top!==window)return;
 // Preview deployments must never reuse the production PWA shell/cache.
 if(location.hostname.endsWith('.pages.dev')){
   const clearPreviewCaches=async()=>{
     try{
       if('serviceWorker'in navigator){
         const regs=await navigator.serviceWorker.getRegistrations();
         await Promise.all(regs.map(reg=>reg.unregister()));
       }
       if('caches'in window){
         const keys=await caches.keys();
         await Promise.all(keys.filter(key=>/tearlum-portal-pwa-|seasonal-events-pwa-/.test(key)).map(key=>caches.delete(key)));
       }
     }catch{}
   };
   if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',clearPreviewCaches,{once:true});
   else clearPreviewCaches();
   return;
 }
 window.addEventListener('load',()=>{
   if('serviceWorker'in navigator)navigator.serviceWorker.register('../sw.js',{scope:'../',updateViaCache:'none'}).then(reg=>reg.update()).catch(()=>{});
 });
})();
