import fs from 'node:fs';
import path from 'node:path';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
const root = process.cwd();
const ajv = new Ajv({allErrors: true});
addFormats(ajv);
const validate = ajv.compile(JSON.parse(fs.readFileSync('schemas/entry.schema.json','utf8')));
const entries = [], ids = new Set(), routes = new Set(['/','/reusable/','/journal/','/faq/','/about_me/','/authors/admin/']);
for (const section of ['reusable','journal']) {
  const dir = path.join('entries',section);
  for (const item of fs.readdirSync(dir,{withFileTypes:true})) {
    if (!item.isDirectory()) continue;
    const folder=path.join(dir,item.name), file=path.join(folder,'entry.json');
    const entry=JSON.parse(fs.readFileSync(file,'utf8'));
    if(!validate(entry)) throw new Error(file+': '+ajv.errorsText(validate.errors));
    if(entry.type!==section || entry.id!==item.name) throw new Error(file+': type/id must match folder');
    if(ids.has(entry.id)) throw new Error('Duplicate id: '+entry.id);
    ids.add(entry.id);
    for(const url of ['/'+section+'/'+entry.id+'/',...(entry.aliases||[])]) {
      if(routes.has(url)) throw new Error('Duplicate route: '+url);
      routes.add(url);
    }
    const body=fs.readFileSync(path.join(folder,entry.content),'utf8');
    if(!body.trim()) throw new Error(file+': empty Markdown');
    for(const a of entry.attachments) {
      if(!fs.existsSync(path.join('static/media',a.path))) throw new Error('Missing media: '+a.path);
    }
    const known=new Set(entry.attachments.map(a=>a.path));
    for(const match of body.matchAll(/\]\(\/media\/([^\s)]+)[^)]*\)/g)) {
      if(!known.has(match[1])) throw new Error(file+': undeclared media '+match[1]);
    }
    entries.push({entry,body});
  }
}
if(!process.argv.includes('--check')) {
  // Only this script owns .generated; source Markdown and media are never removed.
  const destination=path.join(root,'.generated');
  fs.rmSync(destination,{recursive:true,force:true});
  for(const {entry,body} of entries) {
    const folder=path.join(destination,entry.type,entry.id);
    fs.mkdirSync(folder,{recursive:true});
    const {content,comments,...meta}=entry;
    // Future comment fields are validated but have no behavior in this version.
    fs.writeFileSync(path.join(folder,'index.md'),JSON.stringify(meta,null,2)+'\n\n'+body+'\n');
  }
}
console.log('Validated '+entries.length+' entries'+(process.argv.includes('--check')?'':'; generated Hugo content')+'.');

