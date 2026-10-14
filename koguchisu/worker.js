// Public read/write endpoint: explicitly approved by the owner. No user login.
// Secret: NOTION_TOKEN. Plain variable: NOTION_DATA_SOURCE_ID.
const ASSETS='https://raw.githubusercontent.com/happachan1111/pear-shipping-widget/main/koguchisu/';
const VERSION='2026-03-11';
const cleanId=x=>String(x||'').replace(/-/g,'');
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const labels={name:'商品名',vendor:'取引先',newVendor:'新規取引先名',category:'区分',max:'1個口最大数',rule:'個口ルール',note:'注意事項',mark:'マーク'};
const categories=['ネコポス','生鮮','通常'];
class ApiError extends Error { constructor(status,message){super(message);this.status=status;} }
const rt=s=>s?[{type:'text',text:{content:s}}]:[];
const plain=p=>(p?.title||p?.rich_text||[]).map(t=>t.plain_text??t.text?.content??'').join('');
export function normalize(page){const p=page.properties;return {id:page.id,updatedAt:page.last_edited_time,name:plain(p['商品名']),vendor:p['取引先']?.select?.name||'',newVendor:plain(p['新規取引先名']),category:p['区分']?.select?.name||'',max:p['1個口最大数']?.number??null,rule:plain(p['個口ルール']),note:plain(p['注意事項']),mark:p['マーク']?.select?.name||''};}
export function validate(data){if(!data||typeof data!=='object'||Array.isArray(data))throw new ApiError(400,'入力形式が正しくありません。');const d={};for(const k of ['name','vendor','newVendor','category','rule','note','mark']){if(typeof data[k]!=='string')throw new ApiError(400,'入力内容を確認してください。');d[k]=data[k].trim();if(d[k].length>(k==='name'?500:1000))throw new ApiError(400,'入力が長すぎます。');}if(!d.name||!d.vendor||!categories.includes(d.category))throw new ApiError(400,'商品名・取引先・区分は必須です。');if(d.vendor==='新しい取引先を入力'&&!d.newVendor)throw new ApiError(400,'新規取引先名を入力してください。');if(typeof data.max!=='number'&&data.max!==null&&data.max!=='')throw new ApiError(400,'最大数の入力形式が正しくありません。');d.max=data.max===null||data.max===''?null:Number(data.max);if(d.max!==null&&(!Number.isSafeInteger(d.max)||d.max<1))throw new ApiError(400,'1個口最大数は1以上の整数にしてください。');if(d.max===null&&!d.rule)throw new ApiError(400,'1個口最大数または個口ルールを入力してください。');if(!['','★','◆'].includes(d.mark))throw new ApiError(400,'マークが正しくありません。');return d;}
function properties(d,before){const out={};for(const [key,name]of Object.entries(labels)){if(before&&d[key]===before[key])continue;if(key==='name')out[name]={title:rt(d[key])};else if(key==='max')out[name]={number:d.max};else if(['vendor','category','mark'].includes(key))out[name]={select:d[key]?{name:d[key]}:null};else out[name]={rich_text:rt(d[key])};}return out;}
export default {async fetch(request,env,ctx){
 const url=new URL(request.url),origin=url.origin;
 const callerOrigin=request.headers.get('Origin');const originAllowed=callerOrigin!==null;
 const cors={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Methods':'GET,POST,PUT,DELETE,OPTIONS','Access-Control-Allow-Headers':'Content-Type'};
 const security={...cors,'Vary':'Origin','Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer','Content-Security-Policy':"default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self' https://koguchisu.sasaki-8ef.workers.dev; base-uri 'none'; form-action 'none'; frame-ancestors https://*.notion.so https://*.notion.com https://notion.so https://notion.com https://*.iframe.ly https://iframe.ly https://happachan1111.github.io"};
 const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{...security,'Content-Type':'application/json; charset=utf-8'}});
 let stage='接続';
 try{
  // Owner approved public read/write. CORS supports GitHub and sandboxed Notion HTML; it is NOT authentication.
  if(url.pathname.startsWith('/api/')&&request.method==='OPTIONS')return originAllowed?new Response(null,{status:204,headers:security}):json({error:'この画面から操作してください。'},403);
  if(!url.pathname.startsWith('/api/')){
   if(request.method!=='GET')return json({error:'Method not allowed'},405);
   const filename=url.pathname==='/'?'index.html':url.pathname.slice(1);
   const mime={'index.html':'text/html; charset=utf-8','style.css':'text/css; charset=utf-8','app.js':'application/javascript; charset=utf-8'}[filename];
   if(!mime)return json({error:'Not found'},404);
   const response=await fetch(ASSETS+filename,{cf:{cacheTtl:30}});if(!response.ok)return json({error:'画面を準備中です。少し待って再読み込みしてください。'},503);
   return new Response(await response.text(),{headers:{...security,'Content-Type':mime}});
  }
  if(!env.NOTION_TOKEN||!uuid.test(env.NOTION_DATA_SOURCE_ID||''))return json({error:'Notionとの接続設定が未完了です。'},503);
  async function notion(path,opt={}){const token=String(env.NOTION_TOKEN).trim();if(!/^[!-~]+$/.test(token))throw new ApiError(502,'接続キーに空白・改行などが含まれています。APIトークンだけを入力し直してください。');let res;try{let target=new URL('https://api.notion.com/v1'+path);for(let hop=0;hop<3;hop++){res=await fetch(target.toString(),{...opt,headers:{'Authorization':'Bearer '+token,'Notion-Version':VERSION,'Content-Type':'application/json'},redirect:'manual'});if(res.status<300||res.status>=400)break;const location=res.headers.get('Location');if(!location)throw new ApiError(502,'Notion APIの応答を確認できません。（転送先なし / '+res.status+'）');const next=new URL(location,target);if(next.origin!=='https://api.notion.com'||next.username||next.password)throw new ApiError(502,'Notion API以外への転送を検出したため、安全のため接続を停止しました。（HTTP '+res.status+'）');if((opt.method||'GET')!=='GET'&&![307,308].includes(res.status))throw new ApiError(502,'保存先が転送されたため処理を停止しました。');target=next;}if(res.status>=300&&res.status<400)throw new ApiError(502,'Notion APIの転送が完了しませんでした。');}catch(err){if(err instanceof ApiError)throw err;const reason=/header|character|ByteString/i.test(String(err?.message))?'入力形式':/redirect/i.test(String(err?.message))?'リダイレクト':/network|fetch|connection|dns/i.test(String(err?.message))?'ネットワーク':'通信処理';throw new ApiError(502,'Notion APIへの通信に失敗しました。（'+reason+'）')}if(!res.ok){if(res.status===429)throw new ApiError(429,'アクセスが集中しています。少し待って再試行してください。');if([401,403,404].includes(res.status))throw new ApiError(502,'Notion接続キーと、マスターへの接続権限を確認してください。');throw new ApiError(502,'Notionに保存できませんでした。再読み込みして確認してください。');}return res.json();}
  if(url.pathname==='/api/products'&&request.method==='GET'){
   stage='接続確認';const schema=await notion('/data_sources/'+env.NOTION_DATA_SOURCE_ID);let results=[],cursor,more=false;
   for(let i=0;i<50;i++){stage='一覧取得';const page=await notion('/data_sources/'+env.NOTION_DATA_SOURCE_ID+'/query',{method:'POST',body:JSON.stringify({page_size:100,...(cursor?{start_cursor:cursor}:{})})});stage='一覧整形';results.push(...page.results.filter(p=>p.object==='page'&&!p.in_trash&&!p.is_archived).map(normalize));more=page.has_more;if(!more)break;cursor=page.next_cursor;if(!cursor)throw new ApiError(502,'一覧の続きが取得できませんでした。');}
   stage='選択肢整形';return json({rows:results,complete:!more,vendors:(schema.properties['取引先']?.select?.options||[]).map(x=>x.name),loadedAt:new Date().toISOString()});
  }
  if(!['POST','PUT','DELETE'].includes(request.method))return json({error:'Not found'},404);
  if(!originAllowed||!request.headers.get('Content-Type')?.startsWith('application/json'))return json({error:'この画面から操作してください。'},403);
  if(Number(request.headers.get('Content-Length')||0)>16000)return json({error:'入力が大きすぎます。'},413);
  const raw=await request.text();if(raw.length>16000)return json({error:'入力が大きすぎます。'},413);let body;try{body=JSON.parse(raw)}catch{throw new ApiError(400,'入力形式が正しくありません。')}
  if(url.pathname==='/api/products'&&request.method==='POST'){const d=validate(body);if(d.vendor==='新しい取引先を入力')d.vendor=d.newVendor;const props=properties(d);props['有効']={checkbox:true};const created=await notion('/pages',{method:'POST',body:JSON.stringify({parent:{type:'data_source_id',data_source_id:env.NOTION_DATA_SOURCE_ID},properties:props})});return json({row:normalize(created)},201);}
  const match=url.pathname.match(/^\/api\/products\/([0-9a-f-]+)$/i);if(!match||!uuid.test(match[1]))return json({error:'Not found'},404);
  const page=await notion('/pages/'+match[1]);if(page.parent?.type!=='data_source_id'||cleanId(page.parent.data_source_id)!==cleanId(env.NOTION_DATA_SOURCE_ID))return json({error:'対象外の商品です。'},403);
  if(page.in_trash||page.is_archived)return json({error:'この商品は既に削除またはアーカイブされています。'},409);
  if(!body.updatedAt||body.updatedAt!==page.last_edited_time)return json({error:'別の場所で更新されています。一覧を再読み込みして編集し直してください。'},409);
  if(request.method==='PUT'){const d=validate(body);if(d.vendor==='新しい取引先を入力')d.vendor=d.newVendor;const props=properties(d,normalize(page));if(!Object.keys(props).length)return json({row:normalize(page)});const updated=await notion('/pages/'+match[1],{method:'PATCH',body:JSON.stringify({properties:props})});return json({row:normalize(updated)});}
  if(request.method==='DELETE'){await notion('/pages/'+match[1],{method:'PATCH',body:JSON.stringify({in_trash:true})});return json({ok:true});}
  return json({error:'Not found'},404);
 }catch(e){return json({error:e instanceof ApiError?e.message:'通信に失敗しました。再読み込みして確認してください。（'+stage+' / '+(e?.name==='TypeError'?'TypeError':'Error')+'）'},e instanceof ApiError?e.status:500);}
}};
