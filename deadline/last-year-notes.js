(() => {
  const style = document.createElement('style');
  style.textContent = '.item.lastyear{background:#e5f2fc;border-left-color:#2783de;cursor:default}.item.lastyear:hover{filter:none}';
  document.head.appendChild(style);

  const baseRender = render;

  function addLastYearNotes() {
    const dayCells = calendar.querySelectorAll('.day');
    const start = new Date(view);
    start.setDate(1 - start.getDay());

    dayCells.forEach((cell, index) => {
      if (cell.classList.contains('other') || cell.querySelector('.lastyear')) return;

      const day = new Date(start);
      day.setDate(start.getDate() + index);
      const currentDate = fmt(day);
      const previousDate = `${day.getFullYear() - 1}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`;
      const currentSources = new Set(items.filter(item => item.date === currentDate).map(item => item.source));
      const previousOnly = items.filter(item => item.date === previousDate && !currentSources.has(item.source));

      if (!previousOnly.length) return;

      const note = document.createElement('div');
      note.className = 'item lastyear';

      const title = document.createElement('b');
      title.textContent = '去年はこの日';
      note.appendChild(title);

      const details = document.createElement('span');
      details.className = 'src';
      previousOnly.forEach((item, itemIndex) => {
        if (itemIndex) details.appendChild(document.createElement('br'));
        details.appendChild(document.createTextNode(`${nameOf(item)}／${item.source}`));
      });
      note.appendChild(details);
      cell.appendChild(note);
    });
  }

  render = function () {
    baseRender();
    addLastYearNotes();
  };

  setTimeout(addLastYearNotes, 800);
})();
