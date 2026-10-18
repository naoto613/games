const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];
const FALLBACK_ITEMS = [
  {id:"demo-ai-perf",title:"Coding AgentとはじめるMySQLパフォーマンスチューニング",url:"https://tech.layerx.co.jp/",sourceId:"layerx-engineering-blog",sourceType:"blog",publishedAt:"2026-10-05T09:00:00+09:00",description:"AIエージェントを活用した性能改善の実践を探るためのサンプルカードです。実際の最新記事データではありません。",tags:["AI・LLM・Agent","バックエンド","開発生産性"],learningTypes:["実践事例"],isDemo:true},
  {id:"demo-llm-wiki",title:"LLM Wikiの組織運用に向けて ── 陳腐化を防ぐ更新の仕組み",url:"https://tech.layerx.co.jp/",sourceId:"layerx-engineering-blog",sourceType:"blog",publishedAt:"2026-09-28T09:00:00+09:00",description:"ナレッジ管理やチーム運用の考え方を検討するためのUIサンプルです。リンク先はブログトップです。",tags:["AI・LLM・Agent","EM・組織設計"],learningTypes:["組織・プロセス"],isDemo:true},
  {id:"demo-platform",title:"開発基盤と開発生産性を考える",url:"https://tech.layerx.co.jp/",sourceId:"layerx-engineering-blog",sourceType:"blog",publishedAt:"2026-09-12T09:00:00+09:00",description:"Platform Engineering、CI/CD、開発体験の情報を整理するためのサンプルです。",tags:["Platform Engineering","開発生産性"],learningTypes:["実践事例"],isDemo:true},
  {id:"demo-slides",title:"技術選定のトレードオフを学ぶ — 登壇資料",url:"https://speakerdeck.com/layerx",sourceId:"layerx-speakerdeck",sourceType:"slides",publishedAt:"2026-09-08T09:00:00+09:00",description:"技術選定や設計判断に関するスライドを表示するためのサンプルです。",tags:["アーキテクチャ","事業・技術戦略"],learningTypes:["設計判断"],isDemo:true},
  {id:"demo-org",title:"プロダクト開発チームの成長と組織設計",url:"https://tech.layerx.co.jp/",sourceId:"layerx-engineering-blog",sourceType:"blog",publishedAt:"2026-08-30T09:00:00+09:00",description:"EM・チーム設計の知見を探す際のサンプルカードです。",tags:["EM・組織設計","プロダクト開発"],learningTypes:["組織・プロセス"],isDemo:true}
];
const DEFAULT_SOURCES = [
  {id:"layerx-engineering-blog",name:"LayerX エンジニアブログ",type:"blog",url:"https://tech.layerx.co.jp/",enabled:true,fetchMethod:"rss",lastFetchedAt:null},
  {id:"layerx-youtube",name:"LayerX YouTube",type:"youtube",url:"https://www.youtube.com/",enabled:true,fetchMethod:"youtube",lastFetchedAt:null},
  {id:"layerx-speakerdeck",name:"LayerX Speaker Deck",type:"slides",url:"https://speakerdeck.com/layerx",enabled:true,fetchMethod:"rss",lastFetchedAt:null}
];
const TAGS = ["AI・LLM・Agent","アーキテクチャ","バックエンド","フロントエンド","Platform Engineering","SRE・インフラ","セキュリティ","品質・テスト","開発生産性","プロダクト開発","EM・組織設計","事業・技術戦略"];
const ICONS = {blog:"✎",youtube:"▶",slides:"▧",official:"◎",external:"↗"};
const SRC = {blog:{label:"ブログ",icon:"✎",open:"記事を読む"},youtube:{label:"YouTube",icon:"▶",open:"動画を見る"},slides:{label:"スライド",icon:"▧",open:"スライドを見る"},official:{label:"ニュース",icon:"◎",open:"ニュースを読む"},external:{label:"外部発信",icon:"↗",open:"ページを開く"}};
const state = {items:[],manual:[],meta:null,sources:DEFAULT_SOURCES,read:new Set(),saved:new Set(),notes:{},view:"dashboard",sourceFilter:"",editingNoteId:null,realData:false};
const METHOD_LABELS={rss:"RSS/Atom",youtube:"YouTube公開フィード",auto:"フィード自動検出",manual:"手動"};
const STORAGE_KEY = "layerx-radar-state-v1";

function loadLocalState(){
  try{const s=JSON.parse(localStorage.getItem(STORAGE_KEY)||"{}");state.read=new Set(s.read||[]);state.saved=new Set(s.saved||[]);state.notes=s.notes||{};state.manual=Array.isArray(s.manual)?s.manual:[];}catch(e){}
}
function persistState(){try{localStorage.setItem(STORAGE_KEY,JSON.stringify({read:[...state.read],saved:[...state.saved],notes:state.notes,manual:state.manual,updatedAt:new Date().toISOString()}));}catch(e){}}
function esc(v=""){return String(v).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function formatDate(d){if(!d)return"日付不明";const date=new Date(d);if(Number.isNaN(date.getTime()))return"日付不明";return new Intl.DateTimeFormat("ja-JP",{year:"numeric",month:"short",day:"numeric"}).format(date);}
function daysAgo(d){return (Date.now()-new Date(d).getTime())/86400000;}
function sourceName(id){return state.sources.find(s=>s.id===id)?.name||id||"情報源不明";}
function typeName(t){return({blog:"ブログ",youtube:"YouTube",slides:"スライド",official:"公式ニュース・イベント",external:"社員・外部発信"})[t]||"その他";}
function allItems(){const off=new Set(state.sources.filter(s=>s.enabled===false).map(s=>s.id));return [...state.manual,...(state.items.length?state.items:FALLBACK_ITEMS).filter(i=>!off.has(i.sourceId))];}
function formatDateTime(d){if(!d)return"";const date=new Date(d);if(Number.isNaN(date.getTime()))return"";return new Intl.DateTimeFormat("ja-JP",{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"}).format(date);}
function showToast(msg){const t=$("#toast");t.textContent=msg;t.classList.add("show");clearTimeout(showToast.timer);showToast.timer=setTimeout(()=>t.classList.remove("show"),2600);}
async function loadData(){
  try{
    const [itemsRes,sourcesRes,metaRes]=await Promise.all(["items","sources","meta"].map(n=>fetch(`./data/${n}.json`,{cache:"no-store"}).catch(()=>null)));
    if(itemsRes?.ok){const data=await itemsRes.json();if(Array.isArray(data)&&data.length){state.items=data;state.realData=true;}}
    if(sourcesRes?.ok){const data=await sourcesRes.json();if(Array.isArray(data)&&data.length)state.sources=data;}
    if(metaRes?.ok)state.meta=await metaRes.json().catch(()=>null);
  }catch(e){/* file:// or unavailable fetch: show clearly marked demo data */}
  render();
  const updated=state.meta?.updatedAt||state.sources.map(s=>s.lastSuccessAt).filter(Boolean).sort().pop();
  $("#lastUpdated").textContent=state.realData?(updated?`収集 ${formatDateTime(updated)}（毎朝6時に更新）`:"JSONデータを読み込み済み"):"サンプル表示 / 収集前";
  $("#syncStatus").textContent=state.realData?"公開フィードから収集済み":"デモモード";
  $("#demoBanner").classList.toggle("hidden",state.realData);
}
function populateTagFilter(){
  const used=new Set(allItems().flatMap(i=>i.tags||[]));TAGS.forEach(t=>used.add(t));
  $("#tagFilter").innerHTML='<option value="">すべてのテーマ</option>'+[...used].sort((a,b)=>a.localeCompare(b,"ja")).map(t=>`<option value="${esc(t)}">${esc(t)}</option>`).join("");
}
function getFiltered(){
  let items=[...allItems()];const q=$("#searchInput").value.trim().toLowerCase(),type=$("#typeFilter").value,tag=$("#tagFilter").value,status=$("#statusFilter").value,sort=$("#sortFilter").value;
  if(state.view==="saved")items=items.filter(i=>state.saved.has(i.id));
  if(state.view==="notes")items=items.filter(i=>state.notes[i.id]);
  if(state.sourceFilter)items=items.filter(i=>i.sourceType===state.sourceFilter);
  if(type)items=items.filter(i=>i.sourceType===type);
  if(tag)items=items.filter(i=>(i.tags||[]).includes(tag));
  if(status==="unread")items=items.filter(i=>!state.read.has(i.id));
  if(status==="read")items=items.filter(i=>state.read.has(i.id));
  if(status==="saved")items=items.filter(i=>state.saved.has(i.id));
  if(q)items=items.filter(i=>[i.title,i.description,sourceName(i.sourceId),...(i.tags||[]),...(i.learningTypes||[])].join(" ").toLowerCase().includes(q));
  items.sort((a,b)=>sort==="oldest"?new Date(a.publishedAt)-new Date(b.publishedAt):sort==="title"?a.title.localeCompare(b.title,"ja"):new Date(b.publishedAt)-new Date(a.publishedAt));
  return items;
}
function itemActions(i){const read=state.read.has(i.id),saved=state.saved.has(i.id);return `${i.id.startsWith("manual-")?`<button class="icon-action" data-action="delete" data-id="${esc(i.id)}" title="手動登録を削除" aria-label="手動登録を削除">🗑</button>`:""}<button class="icon-action ${saved?"active":""}" data-action="save" data-id="${esc(i.id)}" title="${saved?"ブックマークを外す":"ブックマーク"}" aria-label="${saved?"ブックマークを外す":"ブックマーク"}">${saved?"★":"☆"}</button><button class="icon-action ${read?"active":""}" data-action="read" data-id="${esc(i.id)}" title="${read?"未読に戻す":"既読にする"}" aria-label="${read?"未読に戻す":"既読にする"}">${read?"✓":"○"}</button><button class="icon-action" data-action="note" data-id="${esc(i.id)}" title="学びのメモ" aria-label="学びのメモ">✎</button>`;}
function srcOf(i){return SRC[i.sourceType]||SRC.external;}
function dispTitle(i){return i.sourceType==="youtube"?(i.title||"").replace(/(\s*#[^\s#]+)+\s*$/,"")||i.title:i.title;}
function isShort(i){return i.sourceType==="youtube"&&/#shorts/i.test(i.title||"");}
function srcPill(i){const s=srcOf(i);return `<span class="src-pill">${s.icon} ${esc(isShort(i)?"YouTube ショート":s.label)}</span>`;}
function thumb(i,cls){const s=srcOf(i);const ph=`<span class="ph-icon">${s.icon}</span><span class="ph-label">${esc(s.label)}</span>`;
  return `<a class="${cls}" href="${esc(i.url)}" target="_blank" rel="noopener noreferrer" data-open="${esc(i.id)}" tabindex="-1" aria-hidden="true">${i.thumbnailUrl?`<img src="${esc(i.thumbnailUrl)}" alt="" loading="lazy" referrerpolicy="no-referrer" data-thumb>`:""}<span class="ph">${ph}</span>${i.sourceType==="youtube"?'<span class="play">▶</span>':""}</a>`;}
function cleanDesc(i){return (i.description||"概要は未登録です。元のページを開いて内容を確認してください。").replace(/\s*▼?目次[\s\S]*$/,"").trim()||i.description;}
function renderCard(i){
  const saved=state.saved.has(i.id),tags=(i.tags||[]).slice(0,3);
  return `<article class="highlight-card src-${esc(i.sourceType||"external")}">${thumb(i,"highlight-art")}<div class="highlight-body"><div class="meta-line">${srcPill(i)}<span>${esc(formatDate(i.publishedAt))}</span></div><h3><a href="${esc(i.url)}" target="_blank" rel="noopener noreferrer" data-open="${esc(i.id)}">${esc(dispTitle(i))}</a></h3><p class="clamp3">${esc(cleanDesc(i))}</p><div class="feed-tags">${tags.map(t=>`<span class="feed-tag">${esc(t)}</span>`).join("")}</div><div class="card-actions"><a href="${esc(i.url)}" target="_blank" rel="noopener noreferrer" data-open="${esc(i.id)}">${esc(srcOf(i).open)} ↗</a><span style="flex:1"></span><button class="mini-action ${saved?"saved":""}" data-action="save" data-id="${esc(i.id)}">${saved?"★ ブックマーク中":"☆ ブックマーク"}</button></div></div></article>`;
}
function renderFeedItem(i){
  const read=state.read.has(i.id),tags=(i.tags||[]).slice(0,4);
  return `<article class="feed-item src-${esc(i.sourceType||"external")} ${read?"is-read":""}">${thumb(i,"feed-thumb")}<div class="feed-main"><div class="feed-meta">${srcPill(i)}<span>${esc(formatDate(i.publishedAt))}</span>${read?'<span class="read-mark">既読</span>':'<span class="unread-mark">● 未読</span>'}${i.isDemo?'<span class="tag">サンプル</span>':""}</div><a class="feed-title" href="${esc(i.url)}" target="_blank" rel="noopener noreferrer" data-open="${esc(i.id)}">${esc(dispTitle(i))}</a><p class="feed-desc clamp2">${esc(cleanDesc(i))}</p><div class="feed-tags">${tags.map(t=>`<span class="feed-tag"${i.tagsEstimated?' title="タイトル・概要のキーワードから自動推定したテーマ"':""}>${esc(t)}</span>`).join("")}</div></div><div class="feed-actions">${itemActions(i)}</div></article>`;
}
function renderChips(){
  const items=allItems(),count=t=>items.filter(i=>i.sourceType===t).length,cur=state.sourceFilter||$("#typeFilter").value;
  const types=["blog","youtube","slides","external"].filter(t=>count(t)||t!=="external");
  $("#sourceChips").innerHTML=`<button class="chip ${cur?"":"active"}" data-chip="">すべて <b>${items.length}</b></button>`+types.map(t=>`<button class="chip chip-${t} ${cur===t?"active":""}" data-chip="${t}">${SRC[t].icon} ${esc(SRC[t].label)} <b>${count(t)}</b></button>`).join("");
}
function updateStats(){
  $("#unreadNavCount").textContent=allItems().filter(i=>!state.read.has(i.id)).length;
}
function render(){
  populateTagFilter();updateStats();
  const titles={dashboard:["おかえりなさい","LayerXの技術的な学びを、ひとつの場所へ。"],all:["すべての情報","媒体を横断して、新着・未読・テーマを検索。"],saved:["ブックマーク","また見返したい記事・動画・スライド。"],notes:["学びのメモ","自分の言葉で残した学びと応用アイデア。"]};
  const [title,subtitle]=titles[state.view]||["情報一覧",""];$("#pageTitle").textContent=title;$("#pageSubtitle").textContent=subtitle;
  $("#dashboardHighlights").classList.toggle("hidden",state.view!=="dashboard");
  $("#feedTitle").textContent=state.view==="saved"?"ブックマーク":state.view==="notes"?"メモがある情報":state.sourceFilter?typeName(state.sourceFilter):state.view==="dashboard"?"新着情報":"すべての情報";
  renderChips();const filtered=getFiltered();$("#resultSummary").textContent=`${filtered.length}件の情報`;
  $("#feedList").innerHTML=filtered.map(renderFeedItem).join("");$("#emptyState").classList.toggle("hidden",filtered.length!==0);
  if(state.view==="dashboard"){
    const highlights=[...allItems()].sort((a,b)=>new Date(b.publishedAt)-new Date(a.publishedAt)).slice(0,3);
    $("#highlightGrid").innerHTML=highlights.map(renderCard).join("")||'<p class="feed-desc">まだ情報がありません。</p>';
  }
  renderSources();
}
function sourceStatus(s){
  if(!s.enabled||s.fetchMethod==="manual")return '<span class="src-badge off">自動収集なし</span>';
  if(s.lastError)return `<span class="src-badge ng" title="${esc(s.lastError)}">取得エラー</span>`;
  if(s.lastSuccessAt)return `<span class="src-badge ok">OK ${esc(formatDateTime(s.lastSuccessAt))}${s.lastCount!=null?` · ${esc(s.lastCount)}件`:""}</span>`;
  return '<span class="src-badge off">未収集</span>';
}
function renderSources(){
  $("#sourceSettingsList").innerHTML=state.sources.map(s=>`<div class="source-setting"><div><strong>${esc(s.name)} ${sourceStatus(s)}</strong><small>${esc(s.url)} · 取得方式: ${esc(METHOD_LABELS[s.fetchMethod]||s.fetchMethod||"手動")}${s.via==="channel page"?"（動画ページから取得・日付はおおよそ）":""}${s.channelName?` · チャンネル: ${esc(s.channelName)}`:""}</small>${s.lastError?`<small class="src-error">${esc(s.lastError)}</small>`:""}</div><a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">開く ↗</a></div>`).join("");
}
function setView(view,source=""){state.view=view;state.sourceFilter=source;$$(".nav-item").forEach(b=>b.classList.toggle("active",b.dataset.view===view||!!source&&b.dataset.source===source));render();}
function openNote(id){
  const i=allItems().find(x=>x.id===id);if(!i)return;state.editingNoteId=id;$("#noteDialogTitle").textContent=state.notes[id]?"メモを編集":"学びのメモ";$("#noteItemTitle").textContent=i.title;$("#noteText").value=state.notes[id]||"";$("#noteDialog").showModal();
}
function downloadJson(filename,data){const blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"}),url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download=filename;a.click();URL.revokeObjectURL(url);}
document.addEventListener("click",e=>{
  const nav=e.target.closest("[data-view]");if(nav){setView(nav.dataset.view);return;}
  const source=e.target.closest("[data-source]");if(source){setView("all",source.dataset.source);return;}
  const go=e.target.closest("[data-go]");if(go){setView(go.dataset.go);return;}
  const action=e.target.closest("[data-action]");if(action){const id=action.dataset.id,act=action.dataset.action;
    if(act==="save"){state.saved.has(id)?state.saved.delete(id):state.saved.add(id);persistState();render();showToast(state.saved.has(id)?"ブックマークしました":"ブックマークを外しました");}
    if(act==="read"){state.read.has(id)?state.read.delete(id):state.read.add(id);persistState();render();showToast(state.read.has(id)?"既読にしました":"未読に戻しました");}
    if(act==="note")openNote(id);
    if(act==="delete"&&confirm("この手動登録を削除しますか？")){state.manual=state.manual.filter(x=>x.id!==id);state.saved.delete(id);state.read.delete(id);delete state.notes[id];persistState();render();showToast("削除しました");}
    return;
  }
  const chip=e.target.closest("[data-chip]");if(chip){$("#typeFilter").value="";const t=chip.dataset.chip;if(t)setView(state.view==="dashboard"?"all":state.view,t);else{state.sourceFilter="";setView(state.view);}return;}
  const opened=e.target.closest("[data-open]");if(opened){state.read.add(opened.dataset.open);persistState();setTimeout(render,100);}
});
["searchInput","typeFilter","tagFilter","statusFilter","sortFilter"].forEach(id=>$("#"+id).addEventListener(id==="searchInput"?"input":"change",()=>{if(state.view==="dashboard"&&id!=="searchInput"){}render();}));
$("#clearFiltersBtn").addEventListener("click",()=>{$("#searchInput").value="";$("#typeFilter").value="";$("#tagFilter").value="";$("#statusFilter").value="";$("#sortFilter").value="newest";state.sourceFilter="";render();});
$("#settingsBtn").addEventListener("click",()=>$("#settingsDialog").showModal());
$("#refreshBtn").addEventListener("click",()=>{loadData();showToast("データの再読み込みを開始しました");});
$("#saveNoteBtn").addEventListener("click",()=>{const id=state.editingNoteId,text=$("#noteText").value.trim();if(text)state.notes[id]=text;else delete state.notes[id];persistState();$("#noteDialog").close();render();showToast("メモを保存しました");});
$("#exportStateBtn").addEventListener("click",()=>downloadJson("layerx-radar-state.json",{read:[...state.read],saved:[...state.saved],notes:state.notes,manual:state.manual,exportedAt:new Date().toISOString()}));
$("#importStateInput").addEventListener("change",async e=>{const f=e.target.files[0];if(!f)return;try{const d=JSON.parse(await f.text());state.read=new Set(d.read||[]);state.saved=new Set(d.saved||[]);state.notes=d.notes||{};if(Array.isArray(d.manual))state.manual=d.manual;persistState();render();showToast("状態をインポートしました");}catch(err){showToast("JSONファイルを読み込めませんでした");}e.target.value="";});
$("#resetStateBtn").addEventListener("click",()=>{if(confirm("既読・ブックマーク・メモをすべて削除します。よろしいですか？")){state.read.clear();state.saved.clear();state.notes={};state.manual=[];persistState();render();showToast("状態をリセットしました");}});
$("#manualAddForm").addEventListener("submit",e=>{e.preventDefault();const title=$("#manualTitle").value.trim(),url=$("#manualUrl").value.trim(),type=$("#manualType").value;if(!title||!url)return;let parsed;try{parsed=new URL(url);if(!["http:","https:"].includes(parsed.protocol))throw 0;}catch(err){showToast("有効なHTTP/HTTPS URLを入力してください");return;}const id="manual-"+(crypto.randomUUID?crypto.randomUUID():Date.now().toString(36));state.manual.unshift({id,title,url,sourceId:"manual-entry",sourceType:type,publishedAt:new Date().toISOString(),discoveredAt:new Date().toISOString(),description:"手動で登録した情報です。",tags:[],learningTypes:[]});$("#manualTitle").value="";$("#manualUrl").value="";persistState();render();showToast("情報を追加しました");});
$$("[data-go]").forEach(b=>b.addEventListener("click",()=>setView(b.dataset.go)));
loadLocalState();loadData();

document.addEventListener("error",e=>{const img=e.target;if(img.tagName==="IMG"&&img.hasAttribute("data-thumb"))img.remove();},true);
