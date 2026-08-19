async function renderFolderPage(){
  const script = document.currentScript;
  const path = script.dataset.path;
  const label = script.dataset.label;

  document.getElementById('folder-title').textContent = label;
  const tableWrap = document.getElementById('table-wrap');

  try{
    const files = await fetchFolder(path);
    if(!files.length){
      tableWrap.innerHTML = `<div class="card"><table class="folder-table"><tr class="empty-row"><td colspan="3">empty — nothing here yet</td></tr></table></div>`;
      return;
    }
    const rows = files.map(file => {
      const sizeKb = file.type === 'file' ? (file.size / 1024).toFixed(1) + ' KB' : '—';
      return `<tr>
        <td class="name">${fileIcon(file.name, file.type)}
          <a class="fname" href="${file.html_url}" target="_blank" rel="noopener">${esc(file.name)}</a>
        </td>
        <td class="ftype">${file.type === 'dir' ? 'folder' : 'file'}</td>
        <td class="ftype">${sizeKb}</td>
      </tr>`;
    }).join('');
    tableWrap.innerHTML = `<div class="card">
      <table class="folder-table">
        <tr><th>Name</th><th>Type</th><th>Size</th></tr>
        ${rows}
      </table>
    </div>`;
    document.getElementById('file-count').textContent = files.length + (files.length === 1 ? ' item' : ' items');
  } catch(e){
    tableWrap.innerHTML = `<p class="error">Couldn't load this folder — ${esc(e.message)}.</p>`;
  }
}
renderFolderPage();
