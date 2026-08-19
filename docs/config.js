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
