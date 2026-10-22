'use strict';
(()=>{
const $=id=>document.getElementById(id),base=new URL('../../',location.href).href;
const note=document.createElement('div');note.style.cssText='margin:16px;padding:12px;border-radius:10px;background:#fff4db;color:#744b00;font:14px/1.6 sans-serif';note.textContent='プレビュー環境：画面の表示確認用です。保存や更新は行わないでください。';document.body.prepend(note);
const original=document.createElement('p');original.style.cssText='margin:16px;font:14px sans-serif';original.innerHTML='<a href="https://happachan1111.github.io/pear-shipping-widget/portal/">本番画面を別タブで開く</a>';document.body.append(original);
})();
