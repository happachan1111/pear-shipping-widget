(()=>{
 if(window.__crabTabsVisible87)return;
 window.__crabTabsVisible87=true;
 const style=document.createElement('style');
 style.textContent=`
 .widget:has(.event-tab[data-tool="crab"].active) #toolSubtabs52{display:grid!important;grid-template-columns:repeat(5,minmax(0,1fr))!important;gap:8px!important;overflow:visible!important}
 .widget:has(.event-tab[data-tool="crab"].active) #toolSubtabs52 .tool-subtab52{min-width:0!important;width:100%!important;min-height:44px!important;padding:7px 5px!important;white-space:normal!important;line-height:1.25!important;overflow-wrap:anywhere}
 @media(max-width:720px){.widget:has(.event-tab[data-tool="crab"].active) #toolSubtabs52{grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:6px!important;padding:8px 10px!important}}
 `;
 document.head.appendChild(style);
})();
