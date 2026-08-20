// ---- CONFIGURE THESE if you rename or move the repo ----
const OWNER = "cell-ai";
const REPO = "hpvscape";
const BRANCH = "main";
// ----------------------------------------------------------

const RAW = `https://raw.githubusercontent.com/${OWNER}/${REPO}/${BRANCH}/`;
const API = `https://api.github.com/repos/${OWNER}/${REPO}/contents/`;

function esc(s){
  return s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
}

// strip leading emoji + markdown bold/italic markers for cleaner display text
function cleanLine(s){
  return s
    .replace(/^[\s#>*-]+/,'')
    .replace(/\*\*(.*?)\*\*/g,'$1')
    .replace(/\*(.*?)\*/g,'$1')
    .trim();
}

function fileIcon(name, type){
  if(type === 'dir') return '📁';
  const ext = name.split('.').pop().toLowerCase();
  if(ext === 'md') return '📝';
  if(['csv','tsv','json','xlsx'].includes(ext)) return '📊';
  if(['png','jpg','jpeg','svg','pdf'].includes(ext)) return '🖼️';
  if(['py','r','ipynb','sh'].includes(ext)) return '🧪';
  return '📄';
}

async function fetchFolder(path){
  const res = await fetch(API + path + '?ref=' + BRANCH, {cache:"no-store"});
  if(!res.ok) throw new Error('HTTP ' + res.status);
  const data = await res.json();
  if(!Array.isArray(data)) throw new Error('not a folder');
  return data.filter(f => f.name !== '.gitkeep' && f.name !== 'README.md');
}

async function fetchText(path){
  const res = await fetch(RAW + path, {cache:"no-store"});
  if(!res.ok) throw new Error(path + " not found (" + res.status + ")");
  return res.text();
}

// converts **bold**, *italic*, and [text](url) markdown links inside a single cell/line to safe HTML
function mdInline(s){
  let out = esc(s);
  out = out.replace(/\[(.+?)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
  out = out.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  out = out.replace(/\*(.+?)\*/g, '<em>$1</em>');
  return out;
}

// parses all pipe-style markdown tables in a markdown string into {headers, rows}
function parseMarkdownTables(md){
  const lines = md.split('\n');
  const tables = [];
  let i = 0;
  while(i < lines.length){
    if(lines[i].trim().startsWith('|') && lines[i+1] && /^\|?[\s:|-]+\|?$/.test(lines[i+1].trim())){
      const splitRow = (line) => line.trim().replace(/^\|/,'').replace(/\|$/,'').split('|').map(c => c.trim());
      const headers = splitRow(lines[i]);
      let j = i + 2;
      const rows = [];
      while(j < lines.length && lines[j].trim().startsWith('|')){
        rows.push(splitRow(lines[j]));
        j++;
      }
      tables.push({headers, rows});
      i = j;
    } else {
      i++;
    }
  }
  return tables;
}
