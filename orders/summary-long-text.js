(()=>{
  const style=document.createElement('style');
  style.id='summaryLongTextStyle';
  style.textContent='.editor #memo{line-height:1.65;overflow-wrap:anywhere}.editor.summaryLongText #memo{min-height:280px;resize:vertical}.summaryLongTextHint{margin-top:-2px;font-size:11px;color:#777}.list .pill{overflow-wrap:anywhere;word-break:break-word}.modal.summaryMode textarea{line-height:1.65;overflow-wrap:anywhere}';
  document.head.appendChild(style);

  memo.removeAttribute('maxlength');
  const hint=document.createElement('div');
  hint.className='summaryLongTextHint hidden';
  memo.insertAdjacentElement('afterend',hint);

  function autoGrow(){
    if(recordType.value!=='summary')return;
    memo.style.height='auto';
    memo.style.height=Math.min(Math.max(memo.scrollHeight,280),640)+'px';
  }

  function updateLongTextMode(){
    const isSummary=recordType.value==='summary';
    document.querySelector('.editor').classList.toggle('summaryLongText',isSummary);
    hint.classList.toggle('hidden',!isSummary);
    hint.textContent=isSummary?`${memo.value.length.toLocaleString()}文字・長文入力可（改行も保存されます）`:'';
    memo.rows=isSummary?12:3;
    if(isSummary)requestAnimationFrame(autoGrow);
    else memo.style.height='';
  }

  memo.addEventListener('input',()=>{updateLongTextMode()});
  const previousToggle=toggleTypeFields;
  toggleTypeFields=function(){previousToggle();updateLongTextMode()};
  recordType.onchange=toggleTypeFields;

  const previousEdit=edit;
  edit=function(r){previousEdit(r);updateLongTextMode()};

  updateLongTextMode();
})();
