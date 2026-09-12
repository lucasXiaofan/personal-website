(() => {
const dialog = document.querySelector('#search-dialog');
const input = document.querySelector('#search-input');
const list = document.querySelector('#search-results');
const status = document.querySelector('#search-status');
let entries, pending;
async function search() {
  const query = input.value.trim().toLocaleLowerCase();
  list.replaceChildren();
  if (!query) { status.textContent = 'Type to search Reusable.'; return; }
  status.textContent = 'Loading…';
  try {
    if (!entries) {
      pending ||= fetch(dialog.dataset.index).then(r => { if (!r.ok) throw new Error('Index unavailable'); return r.json(); });
      entries = await pending;
    }
    if (query !== input.value.trim().toLocaleLowerCase()) return;
    const terms = query.split(/\s+/u);
    const results = entries.filter(e => terms.every(t => [e.title,e.summary,e.content,...e.tags].join(' ').toLocaleLowerCase().includes(t)))
      .sort((a,b) => Number(b.title.toLocaleLowerCase().includes(query))-Number(a.title.toLocaleLowerCase().includes(query)));
    status.textContent = results.length ? results.length + ' result' + (results.length === 1 ? '' : 's') : 'No results. Try another word.';
    for (const e of results) {
      const li=document.createElement('li'),a=document.createElement('a'),title=document.createElement('strong'),meta=document.createElement('small'),p=document.createElement('p');
      a.href=e.url; title.textContent=e.title;meta.textContent='Reusable';p.textContent=e.summary;
      a.append(title,meta,p);li.append(a);list.append(li);
    }
  } catch { pending=null; status.textContent='Search is unavailable right now. Please try again.'; }
}
function open(){ if(!dialog.open) dialog.showModal(); input.focus();search(); }
document.querySelector('#search-open').addEventListener('click',open);
document.querySelector('#search-close').addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
input.addEventListener('input',search);
dialog.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();dialog.close();}});
document.addEventListener('keydown',e=>{if(e.key==='/'&&!e.ctrlKey&&!e.metaKey&&!e.altKey&&!['INPUT','TEXTAREA','SELECT'].includes(e.target.tagName)&&!e.target.isContentEditable){e.preventDefault();open();}});
})();
