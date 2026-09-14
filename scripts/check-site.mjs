import fs from 'node:fs';
import path from 'node:path';
const index=JSON.parse(fs.readFileSync('public/index.json','utf8'));
if(!index.some(e=>e.id==='typical-sampling')) throw new Error('Missing preserved article');
if(index.some(e=>e.section!=='reusable')) throw new Error('Unexpected search section');
for(const url of ['index.html','reusable/index.html','decision-log/index.html','faq/index.html','post/typical-sampling/index.html']) {
  if(!fs.existsSync(path.join('public',url))) throw new Error('Missing route '+url);
}
if(fs.existsSync('public/journal')) throw new Error('Removed Journal route is still published');
const generated=new Set(['.git','node_modules','public','.generated','resources']);
function walk(dir) {
  if(!fs.existsSync(path.join(dir,'README.md'))) throw new Error('Missing README: '+dir);
  for(const e of fs.readdirSync(dir,{withFileTypes:true})) if(e.isDirectory() && !(dir==='.' && generated.has(e.name))) walk(path.join(dir,e.name));
}
walk('.');
function outputs(dir) {
 for(const e of fs.readdirSync(dir,{withFileTypes:true})) {
  const p=path.join(dir,e.name);
  if(e.isDirectory()) outputs(p);
  else if(/readme/i.test(e.name)||/\/readme\//i.test(p)) throw new Error('README leaked into output: '+p);
 }
}
outputs('public');
for(const e of index) {
 const suffix=e.url.replace(/^\/personal-website\//,'').replace(/^\//,'');
 if(!fs.existsSync(path.join('public',suffix,'index.html'))) throw new Error('Broken search URL '+e.url);
}
console.log('Verified routes, search index, README coverage and publication exclusions.');
