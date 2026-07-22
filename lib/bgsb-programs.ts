export type BgsbProgram={slug:string;title:string;level:string;faculty:string;overview:string;url:string};
const source='https://bgsb.lk/programs';
function text(value:string){return value.replace(/<!--.*?-->/g,'').replace(/<[^>]*>/g,'').replace(/&amp;/g,'&').replace(/&#x27;|&#39;/g,"'").replace(/&quot;/g,'"').replace(/\s+/g,' ').trim()}
export async function getBgsbPrograms():Promise<BgsbProgram[]>{
 try{
  const response=await fetch(source,{next:{revalidate:3600},headers:{'user-agent':'BGSB-LMS-Catalogue/1.0'}});
  if(!response.ok)throw new Error(`BGSB returned ${response.status}`);
  const html=await response.text(),programs:BgsbProgram[]=[];
  const cards=Array.from(html.matchAll(/href="(\/programs\/([^"?#]+))"[^>]*>[\s\S]*?Level\s*(?:<!--\s*-->)?\s*([0-9]+)[\s\S]*?<div class="p-5">[\s\S]*?<p[^>]*>([\s\S]*?)<\/p>[\s\S]*?<h3[^>]*>([\s\S]*?)<\/h3>[\s\S]*?<p[^>]*>([\s\S]*?)<\/p>/g));
  for(const match of cards){const item={slug:match[2],level:`Level ${match[3]}`,faculty:text(match[4]),title:text(match[5]),overview:text(match[6]),url:`https://bgsb.lk${match[1]}`};if(item.title&&!programs.some(x=>x.slug===item.slug))programs.push(item)}
  return programs;
 }catch(error){console.error('Unable to synchronize BGSB programmes',error);return []}
}
