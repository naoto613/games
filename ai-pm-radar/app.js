const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];
const FALLBACK_ITEMS = [
  {id:"demo-ai-pm",title:"生成AI時代のPdMの役割 ── 仕様を書く人から「何を作らないか」を決める人へ",url:"https://zenn.dev/topics/pdm",sourceId:"zenn-pdm",sourceType:"community",lang:"ja",publishedAt:"2026-10-15T09:00:00+09:00",description:"AIエージェントと協働するプロダクトマネジメントの実践を探すためのサンプルカードです。実際の記事データではありません。",tags:["AI活用","プロダクトマネジメント"],learningTypes:["考え方・フレームワーク"],isDemo:true},
  {id:"demo-ai-em",title:"Engineering managers in the age of coding agents",url:"https://newsletter.pragmaticengineer.com/",sourceId:"pragmatic-engineer",sourceType:"newsletter",lang:"en",publishedAt:"2026-10-12T09:00:00+09:00",description:"AIツールがEMの仕事・チーム構成・評価に与える影響を整理するためのサンプルです。リンク先はニュースレターのトップです。",tags:["AI活用","エンジニアリングマネジメント","組織づくり"],learningTypes:["トレンド・調査"],isDemo:true},
  {id:"demo-ai-discovery",title:"AIでユーザーインタビューの分析を回す ── 継続的ディスカバリーの実践",url:"https://www.producttalk.org/",sourceId:"product-talk",sourceType:"newsletter",lang:"en",publishedAt:"2026-10-08T09:00:00+09:00",description:"ディスカバリーとAI活用が重なる情報を表示するためのサンプルです。",tags:["AI活用","ディスカバリー・UX","プロダクト開発"],learningTypes:["実践事例"],isDemo:true},
  {id:"demo-org",title:"小さなチームを保ったまま組織を大きくする ── チームトポロジーの実践",url:"https://b.hatena.ne.jp/",sourceId:"hatena-org",sourceType:"bookmark",lang:"ja",publishedAt:"2026-10-02T09:00:00+09:00",description:"組織づくりの知見を探す際のサンプルカードです。",tags:["組織づくり","エンジニアリングマネジメント"],learningTypes:["組織・プロセス"],bookmarks:240,isDemo:true},
  {id:"demo-podcast",title:"How AI is changing the PM role | Lenny's Podcast",url:"https://www.youtube.com/@LennysPodcast",sourceId:"lenny-youtube",sourceType:"youtube",lang:"en",publishedAt:"2026-09-28T09:00:00+09:00",description:"動画・Podcastを表示するためのサンプルです。",tags:["AI活用","プロダクトマネジメント","採用・育成・キャリア"],learningTypes:["インタビュー・対談"],isDemo:true},
  {id:"demo-1on1",title:"1on1を仕組みにする ── EMが最初の90日でやったこと",url:"https://qiita.com/tags/%E3%82%A8%E3%83%B3%E3%82%B8%E3%83%8B%E3%82%A2%E3%83%AA%E3%83%B3%E3%82%B0%E3%83%9E%E3%83%8D%E3%83%BC%E3%82%B8%E3%83%A3%E3%83%BC",sourceId:"qiita-em",sourceType:"community",lang:"ja",publishedAt:"2026-09-20T09:00:00+09:00",description:"EM・リーダーシップの情報を整理するためのサンプルです。",tags:["エンジニアリングマネジメント","採用・育成・キャリア"],learningTypes:["実践事例"],isDemo:true}
];
const DEFAULT_SOURCES = [
  {id:"zenn-pdm",name:"Zenn トピック「PdM」",type:"community",url:"https://zenn.dev/topics/pdm",enabled:true,fetchMethod:"rss",lang:"ja"},
  {id:"hatena-pdm",name:"はてブ「プロダクトマネージャー」",type:"bookmark",url:"https://b.hatena.ne.jp/",enabled:true,fetchMethod:"rss",lang:"ja"},
  {id:"lenny",name:"Lenny's Newsletter",type:"newsletter",url:"https://www.lennysnewsletter.com/",enabled:true,fetchMethod:"rss",lang:"en"},
  {id:"lenny-youtube",name:"Lenny's Podcast（YouTube）",type:"youtube",url:"https://www.youtube.com/@LennysPodcast",enabled:true,fetchMethod:"youtube",lang:"en"}
];
const TAGS = ["AI活用","プロダクトマネジメント","エンジニアリングマネジメント","プロダクト開発","ディスカバリー・UX","組織づくり","採用・育成・キャリア","戦略・経営","開発生産性","データ・指標"];
// LayerX タブ（旧 LayerX Radar）は技術寄りのテーマで分類する
const TECH_TAGS = ["AI活用","アーキテクチャ","バックエンド","フロントエンド","Platform Engineering","SRE・インフラ","セキュリティ","品質・テスト","開発生産性","プロダクト開発","EM・組織設計","事業・技術戦略"];
function themesFor(){return state.lang==="layerx"?TECH_TAGS:TAGS;}
const AI_TAG = "AI活用";
const THEME_ICONS = {"AI活用":"✦","プロダクトマネジメント":"◇","エンジニアリングマネジメント":"◈","プロダクト開発":"▷","ディスカバリー・UX":"◐","組織づくり":"⬡","採用・育成・キャリア":"↗","戦略・経営":"♜","開発生産性":"⚡","データ・指標":"▤","アーキテクチャ":"⌗","バックエンド":"⚙","フロントエンド":"▣","Platform Engineering":"⬢","SRE・インフラ":"☁","セキュリティ":"⛨","品質・テスト":"✓","EM・組織設計":"⬡","事業・技術戦略":"♜"};
const SRC = {community:{label:"国内コミュニティ",icon:"✎",open:"記事を読む"},bookmark:{label:"はてブ",icon:"B!",open:"記事を読む"},newsletter:{label:"ニュースレター",icon:"✉",open:"記事を読む"},youtube:{label:"YouTube",icon:"▶",open:"動画を見る"},blog:{label:"ブログ",icon:"✎",open:"記事を読む"},slides:{label:"スライド",icon:"▧",open:"スライドを見る"},external:{label:"手動追加",icon:"↗",open:"ページを開く"}};
const PAGE = 60;
const state = {items:[],manual:[],meta:null,sources:DEFAULT_SOURCES,read:new Set(),saved:new Set(),notes:{},view:"dashboard",sourceFilter:"",focus:"",lang:"ja",limit:PAGE,editingNoteId:null,realData:false};
const METHOD_LABELS={rss:"RSS/Atom",youtube:"YouTube公開フィード",auto:"フィード自動検出",manual:"手動"};
const STORAGE_KEY = "ai-pm-radar-state-v1";
const LANG_KEY = "ai-pm-radar-lang";
const LANGS = {ja:"日本語",en:"English",layerx:"LayerX"};
const TAB_MARKS = {ja:"あ",en:"A",layerx:"L"};
const OLD_LAYERX_KEY = "layerx-radar-state-v1";

function loadLocalState(){
  try{const l=localStorage.getItem(LANG_KEY);if(LANGS[l])state.lang=l;}catch(e){}
  try{const s=JSON.parse(localStorage.getItem(STORAGE_KEY)||"{}");state.read=new Set(s.read||[]);state.saved=new Set(s.saved||[]);state.notes=s.notes||{};state.manual=Array.isArray(s.manual)?s.manual:[];}catch(e){}
  migrateLayerxState();
}
// 旧 LayerX Radar（同じオリジン）の既読・ブックマーク・メモ・手動追加を一度だけ引き継ぐ
function migrateLayerxState(){
  try{
    const raw=localStorage.getItem(OLD_LAYERX_KEY);if(!raw)return;const o=JSON.parse(raw);
    (o.read||[]).forEach(id=>state.read.add(id));(o.saved||[]).forEach(id=>state.saved.add(id));
    Object.entries(o.notes||{}).forEach(([id,t])=>{if(!state.notes[id])state.notes[id]=t;});
    const have=new Set(state.manual.map(m=>m.id));(o.manual||[]).forEach(m=>{if(!have.has(m.id))state.manual.push({...m,lang:"ja",tab:"layerx"});});
    persistState();localStorage.removeItem(OLD_LAYERX_KEY);
  }catch(e){}
}
function persistState(){try{localStorage.setItem(STORAGE_KEY,JSON.stringify({read:[...state.read],saved:[...state.saved],notes:state.notes,manual:state.manual,updatedAt:new Date().toISOString()}));}catch(e){}}
function esc(v=""){return String(v).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function formatDate(d){if(!d)return"日付不明";const date=new Date(d);if(Number.isNaN(date.getTime()))return"日付不明";return new Intl.DateTimeFormat("ja-JP",{year:"numeric",month:"short",day:"numeric"}).format(date);}
function daysAgo(d){return (Date.now()-new Date(d).getTime())/86400000;}
function typeLabel(t){return({blog:"LayerX ブログ",slides:"Speaker Deck"})[t]||typeName(t);}
function sourceName(id){return state.sources.find(s=>s.id===id)?.name||(id==="manual-entry"?"手動で追加":id)||"情報源不明";}
function typeName(t){return({community:"国内コミュニティ",bookmark:"はてブで話題",newsletter:"海外ニュースレター",youtube:"動画・Podcast",blog:"ブログ",slides:"スライド",external:"手動で追加"})[t]||"その他";}
function allItems(){const off=new Set(state.sources.filter(s=>s.enabled===false).map(s=>s.id));return [...state.manual,...(state.items.length?state.items:FALLBACK_ITEMS).filter(i=>!off.has(i.sourceId))];}
function langOf(i){return i.tab||i.lang||"ja";}
// 日本語・英語・LayerX は混ぜずにタブで分けて扱う
function langItems(){return allItems().filter(i=>langOf(i)===state.lang);}
function hasAI(i){return (i.tags||[]).includes(AI_TAG);}
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
  $("#syncStatus").textContent=state.realData?`${state.sources.filter(s=>s.lastSuccessAt&&!s.lastError).length}件の情報源から収集`:"デモモード";
  $("#demoBanner").classList.toggle("hidden",state.realData);
}
function populateTagFilters(){
  const used=new Set(themesFor());langItems().forEach(i=>(i.tags||[]).forEach(t=>used.add(t)));
  const opts=[...used].map(t=>`<option value="${esc(t)}">${esc(t)}</option>`).join("");
  const cur=$("#tagFilter").value;$("#tagFilter").innerHTML='<option value="">すべてのテーマ</option>'+opts;$("#tagFilter").value=cur;
  const mt=$("#manualTag").value;$("#manualTag").innerHTML='<option value="">テーマなし</option>'+opts;$("#manualTag").value=mt;
}
function getFiltered(){
  let items=langItems();const q=$("#searchInput").value.trim().toLowerCase(),type=$("#typeFilter").value,tag=$("#tagFilter").value,status=$("#statusFilter").value,sort=$("#sortFilter").value;
  if(state.view==="saved")items=items.filter(i=>state.saved.has(i.id));
  if(state.view==="notes")items=items.filter(i=>state.notes[i.id]);
  if(state.sourceFilter)items=items.filter(i=>i.sourceType===state.sourceFilter);
  if(state.focus)items=items.filter(i=>(i.tags||[]).includes(state.focus));
  if($("#aiOnly").checked)items=items.filter(hasAI);
  if(type)items=items.filter(i=>i.sourceType===type);
  if(tag)items=items.filter(i=>(i.tags||[]).includes(tag));
  if(status==="unread")items=items.filter(i=>!state.read.has(i.id));
  if(status==="read")items=items.filter(i=>state.read.has(i.id));
  if(status==="saved")items=items.filter(i=>state.saved.has(i.id));
  if(q)items=items.filter(i=>[i.title,i.description,i.author,sourceName(i.sourceId),...(i.tags||[]),...(i.learningTypes||[])].join(" ").toLowerCase().includes(q));
  const byDate=(a,b)=>new Date(b.publishedAt)-new Date(a.publishedAt);
  items.sort((a,b)=>sort==="oldest"?-byDate(a,b):sort==="title"?a.title.localeCompare(b.title,"ja"):sort==="popular"?((b.bookmarks||0)-(a.bookmarks||0))||byDate(a,b):byDate(a,b));
  return items;
}
function itemActions(i){const read=state.read.has(i.id),saved=state.saved.has(i.id);return `${i.id.startsWith("manual-")?`<button class="icon-action" data-action="delete" data-id="${esc(i.id)}" title="手動登録を削除" aria-label="手動登録を削除">🗑</button>`:""}<button class="icon-action ${saved?"active":""}" data-action="save" data-id="${esc(i.id)}" title="${saved?"ブックマークを外す":"ブックマーク"}" aria-label="${saved?"ブックマークを外す":"ブックマーク"}">${saved?"★":"☆"}</button><button class="icon-action ${read?"active":""}" data-action="read" data-id="${esc(i.id)}" title="${read?"未読に戻す":"既読にする"}" aria-label="${read?"未読に戻す":"既読にする"}">${read?"✓":"○"}</button><button class="icon-action ${state.notes[i.id]?"active":""}" data-action="note" data-id="${esc(i.id)}" title="学びのメモ" aria-label="学びのメモ">✎</button>`;}
function srcOf(i){return SRC[i.sourceType]||SRC.external;}
function dispTitle(i){return i.sourceType==="youtube"?(i.title||"").replace(/(\s*#[^\s#]+)+\s*$/,"")||i.title:i.title;}
function srcPill(i){const s=srcOf(i);return `<span class="src-pill">${s.icon} ${esc(s.label)}</span>`;}
function extraMeta(i){return `${i.bookmarks?`<span class="bm-mark" title="はてなブックマーク数">${esc(i.bookmarks)} users</span>`:""}<span class="src-name">${esc(sourceName(i.sourceId))}</span>`;}
function thumb(i,cls){const s=srcOf(i);const ph=`<span class="ph-icon">${s.icon}</span><span class="ph-label">${esc(s.label)}</span>`;
  return `<a class="${cls}" href="${esc(i.url)}" target="_blank" rel="noopener noreferrer" data-open="${esc(i.id)}" tabindex="-1" aria-hidden="true">${i.thumbnailUrl?`<img src="${esc(i.thumbnailUrl)}" alt="" loading="lazy" referrerpolicy="no-referrer" data-thumb>`:""}<span class="ph">${ph}</span>${i.sourceType==="youtube"?'<span class="play">▶</span>':""}</a>`;}
function cleanDesc(i){return (i.description||"概要は未登録です。元のページを開いて内容を確認してください。").replace(/\s*▼?目次[\s\S]*$/,"").trim()||i.description;}
function tagHtml(t,i){return `<span class="feed-tag ${t===AI_TAG?"ai":""}"${i.tagsEstimated?' title="タイトル・概要のキーワードから自動推定したテーマ"':""}>${t===AI_TAG?"✦ ":""}${esc(t)}</span>`;}
function renderCard(i){
  const saved=state.saved.has(i.id),tags=(i.tags||[]).slice(0,3);
  return `<article class="highlight-card src-${esc(i.sourceType||"external")}">${thumb(i,"highlight-art")}<div class="highlight-body"><div class="meta-line">${srcPill(i)}<span>${esc(formatDate(i.publishedAt))}</span></div><h3><a href="${esc(i.url)}" target="_blank" rel="noopener noreferrer" data-open="${esc(i.id)}">${esc(dispTitle(i))}</a></h3><p class="clamp3">${esc(cleanDesc(i))}</p><div class="feed-tags">${tags.map(t=>tagHtml(t,i)).join("")}</div><div class="card-actions"><a href="${esc(i.url)}" target="_blank" rel="noopener noreferrer" data-open="${esc(i.id)}">${esc(srcOf(i).open)} ↗</a><span style="flex:1"></span><button class="mini-action ${saved?"saved":""}" data-action="save" data-id="${esc(i.id)}">${saved?"★ ブックマーク中":"☆ ブックマーク"}</button></div></div></article>`;
}
function renderFeedItem(i){
  const read=state.read.has(i.id),tags=(i.tags||[]).slice(0,4);
  return `<article class="feed-item src-${esc(i.sourceType||"external")} ${read?"is-read":""}">${thumb(i,"feed-thumb")}<div class="feed-main"><div class="feed-meta">${srcPill(i)}<span>${esc(formatDate(i.publishedAt))}</span>${extraMeta(i)}${read?'<span class="read-mark">既読</span>':'<span class="unread-mark">● 未読</span>'}${i.isDemo?'<span class="tag">サンプル</span>':""}</div><a class="feed-title" href="${esc(i.url)}" target="_blank" rel="noopener noreferrer" data-open="${esc(i.id)}">${esc(dispTitle(i))}</a><p class="feed-desc clamp2">${esc(cleanDesc(i))}</p>${state.notes[i.id]?`<p class="note-preview clamp2">✎ ${esc(state.notes[i.id])}</p>`:""}<div class="feed-tags">${tags.map(t=>tagHtml(t,i)).join("")}</div></div><div class="feed-actions">${itemActions(i)}</div></article>`;
}
function renderChips(){
  const items=langItems(),count=t=>items.filter(i=>i.sourceType===t).length,cur=state.sourceFilter||$("#typeFilter").value;
  const types=["community","bookmark","newsletter","blog","slides","youtube","external"].filter(t=>count(t)||t!=="external");
  $("#sourceChips").innerHTML=`<button class="chip ${cur?"":"active"}" data-chip="">すべて <b>${items.length}</b></button>`+types.map(t=>`<button class="chip chip-${t} ${cur===t?"active":""}" data-chip="${t}">${SRC[t].icon} ${esc(typeLabel(t))} <b>${count(t)}</b></button>`).join("");
}
function renderThemes(){
  const recent=langItems().filter(i=>daysAgo(i.publishedAt)<=30);
  $("#themeGrid").innerHTML=themesFor().map(t=>{const hit=recent.filter(i=>(i.tags||[]).includes(t)),ai=t===AI_TAG?null:hit.filter(hasAI).length;
    return `<button class="theme-card ${t===AI_TAG?"is-ai":""}" data-theme="${esc(t)}"><span class="theme-icon">${THEME_ICONS[t]||"●"}</span><span class="theme-name">${esc(t)}</span><span class="theme-count"><b>${hit.length}</b>件${ai?`<em>✦ ${ai}</em>`:""}</span></button>`;}).join("");
}
function renderTabs(){
  $(".lang-tabs").innerHTML=Object.entries(LANGS).map(([l,name])=>`<button class="lang-tab" role="tab" data-lang="${l}" aria-selected="false"><span class="lang-flag">${TAB_MARKS[l]}</span> ${esc(name)} <b>0</b></button>`).join("")+'<span class="lang-tabs-note">未読数 · タブごとに別々に表示</span>';
}
function updateStats(){
  const items=langItems();
  $("#unreadNavCount").textContent=items.filter(i=>!state.read.has(i.id)).length;
  $$("[data-lang]").forEach(b=>{const l=b.dataset.lang,n=allItems().filter(i=>langOf(i)===l&&!state.read.has(i.id)).length;b.classList.toggle("active",l===state.lang);b.setAttribute("aria-selected",l===state.lang);b.querySelector("b").textContent=n;});
  $$(".nav-item[data-focus]").forEach(b=>b.classList.toggle("hidden",!items.some(i=>(i.tags||[]).includes(b.dataset.focus))));
  $$(".nav-item[data-source]").forEach(b=>b.classList.toggle("hidden",!items.some(i=>i.sourceType===b.dataset.source)));
  const fresh=items.filter(i=>daysAgo(i.publishedAt)<=7).length;$("#todayLabel").textContent=`この7日で ${fresh}件`;
}
function render(){
  populateTagFilters();updateStats();
  const titles={dashboard:["おかえりなさい","AI時代のプロダクトマネジメント・EM・組織づくりの学びを、ひとつの場所へ。"],all:["すべての情報","媒体・言語を横断して、新着・未読・テーマを検索。"],saved:["ブックマーク","また見返したい記事・動画。"],notes:["学びのメモ","自分の言葉で残した学びと応用アイデア。"]};
  let [title,subtitle]=titles[state.view]||["情報一覧",""];
  if(state.lang==="layerx"&&state.view==="dashboard")subtitle="LayerXの公開技術情報（エンジニアブログ・YouTube・Speaker Deck）を、ひとつの場所へ。";
  if(state.focus){title=state.focus;subtitle=state.focus===AI_TAG?"AI・LLM・エージェントを仕事や組織にどう活かすか。":`${state.focus}に関する情報。✦ AI活用だけ にすると AI との掛け合わせに絞れます。`;}
  $("#pageTitle").textContent=title;$("#pageSubtitle").textContent=subtitle;
  $("#dashboardHighlights").classList.toggle("hidden",state.view!=="dashboard");
  $("#feedTitle").textContent=state.view==="saved"?"ブックマーク":state.view==="notes"?"メモがある情報":state.focus?`${state.focus}の情報`:state.sourceFilter?typeLabel(state.sourceFilter):state.view==="dashboard"?"新着情報":"すべての情報";
  renderChips();const filtered=getFiltered();$("#resultSummary").textContent=`${filtered.length}件の情報`;
  $("#feedList").innerHTML=filtered.slice(0,state.limit).map(renderFeedItem).join("");$("#emptyState").classList.toggle("hidden",filtered.length!==0);
  $("#moreBtn").classList.toggle("hidden",filtered.length<=state.limit);$("#moreBtn").textContent=`もっと見る（残り ${Math.max(0,filtered.length-state.limit)}件）`;
  if(state.view==="dashboard"){
    renderThemes();
    const sorted=langItems().sort((a,b)=>new Date(b.publishedAt)-new Date(a.publishedAt));
    const focus=themesFor().filter(t=>t!==AI_TAG),cross=sorted.filter(i=>hasAI(i)&&(i.tags||[]).some(t=>focus.includes(t)));
    const highlights=[...cross,...sorted.filter(i=>!cross.includes(i))].slice(0,6);
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
  $("#sourceSettingsList").innerHTML=state.sources.map(s=>`<div class="source-setting"><div><strong><i class="dot dot-${esc(s.type)}"></i> ${esc(s.name)} ${sourceStatus(s)}</strong><small>${esc(typeName(s.type))} · ${s.lang==="en"?"英語":"日本語"} · 取得方式: ${esc(METHOD_LABELS[s.fetchMethod]||s.fetchMethod||"手動")}${s.via==="channel page"?"（動画ページから取得・日付はおおよそ）":""}${s.notes?` · ${esc(s.notes)}`:""}</small>${s.lastError?`<small class="src-error">${esc(s.lastError)}</small>`:""}</div><a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">開く ↗</a></div>`).join("");
}
function setView(view,{source="",focus=""}={}){
  state.view=view;state.sourceFilter=source;state.focus=focus;state.limit=PAGE;
  $$(".nav-item").forEach(b=>b.classList.toggle("active",focus?b.dataset.focus===focus:source?b.dataset.source===source:b.dataset.view===view));
  render();window.scrollTo({top:0});
}
function setLang(lang){
  if(!LANGS[lang]||lang===state.lang)return;state.lang=lang;try{localStorage.setItem(LANG_KEY,lang);}catch(e){}
  $("#typeFilter").value="";$("#tagFilter").value="";setView(state.view,{focus:state.focus});showToast(`${LANGS[lang]}のタブに切り替えました`);
}
function openNote(id){
  const i=allItems().find(x=>x.id===id);if(!i)return;state.editingNoteId=id;$("#noteDialogTitle").textContent=state.notes[id]?"メモを編集":"学びのメモ";$("#noteItemTitle").textContent=i.title;$("#noteText").value=state.notes[id]||"";$("#noteDialog").showModal();
}
function downloadJson(filename,data){const blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"}),url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download=filename;a.click();URL.revokeObjectURL(url);}
document.addEventListener("click",e=>{
  const langTab=e.target.closest("[data-lang]");if(langTab){setLang(langTab.dataset.lang);return;}
  const nav=e.target.closest("[data-view]");if(nav){setView(nav.dataset.view);return;}
  const focus=e.target.closest("[data-focus]");if(focus){setView("all",{focus:focus.dataset.focus});return;}
  const theme=e.target.closest("[data-theme]");if(theme){setView("all",{focus:theme.dataset.theme});return;}
  const source=e.target.closest("[data-source]");if(source){setView("all",{source:source.dataset.source});return;}
  if(e.target.closest("[data-ai-all]")){$("#aiOnly").checked=true;setView("all");return;}
  const action=e.target.closest("[data-action]");if(action){const id=action.dataset.id,act=action.dataset.action;
    if(act==="save"){state.saved.has(id)?state.saved.delete(id):state.saved.add(id);persistState();render();showToast(state.saved.has(id)?"ブックマークしました":"ブックマークを外しました");}
    if(act==="read"){state.read.has(id)?state.read.delete(id):state.read.add(id);persistState();render();showToast(state.read.has(id)?"既読にしました":"未読に戻しました");}
    if(act==="note")openNote(id);
    if(act==="delete"&&confirm("この手動登録を削除しますか？")){state.manual=state.manual.filter(x=>x.id!==id);state.saved.delete(id);state.read.delete(id);delete state.notes[id];persistState();render();showToast("削除しました");}
    return;
  }
  const chip=e.target.closest("[data-chip]");if(chip){$("#typeFilter").value="";const t=chip.dataset.chip;setView(state.view==="dashboard"&&t?"all":state.view,{source:t,focus:state.focus});return;}
  const opened=e.target.closest("[data-open]");if(opened){state.read.add(opened.dataset.open);persistState();setTimeout(render,100);}
});
["searchInput","typeFilter","tagFilter","statusFilter","sortFilter","aiOnly"].forEach(id=>$("#"+id).addEventListener(id==="searchInput"?"input":"change",()=>{state.limit=PAGE;render();}));
$("#moreBtn").addEventListener("click",()=>{state.limit+=PAGE;render();});
$("#clearFiltersBtn").addEventListener("click",()=>{$("#searchInput").value="";$("#typeFilter").value="";$("#tagFilter").value="";$("#statusFilter").value="";$("#sortFilter").value="newest";$("#aiOnly").checked=false;setView(state.view==="dashboard"?"dashboard":"all");});
$("#settingsBtn").addEventListener("click",()=>$("#settingsDialog").showModal());
$("#refreshBtn").addEventListener("click",()=>{loadData();showToast("データの再読み込みを開始しました");});
$("#saveNoteBtn").addEventListener("click",()=>{const id=state.editingNoteId,text=$("#noteText").value.trim();if(text)state.notes[id]=text;else delete state.notes[id];persistState();$("#noteDialog").close();render();showToast("メモを保存しました");});
$("#exportStateBtn").addEventListener("click",()=>downloadJson("ai-pm-radar-state.json",{read:[...state.read],saved:[...state.saved],notes:state.notes,manual:state.manual,exportedAt:new Date().toISOString()}));
$("#importStateInput").addEventListener("change",async e=>{const f=e.target.files[0];if(!f)return;try{const d=JSON.parse(await f.text());state.read=new Set(d.read||[]);state.saved=new Set(d.saved||[]);state.notes=d.notes||{};if(Array.isArray(d.manual))state.manual=d.manual;persistState();render();showToast("状態をインポートしました");}catch(err){showToast("JSONファイルを読み込めませんでした");}e.target.value="";});
$("#resetStateBtn").addEventListener("click",()=>{if(confirm("既読・ブックマーク・メモをすべて削除します。よろしいですか？")){state.read.clear();state.saved.clear();state.notes={};state.manual=[];persistState();render();showToast("状態をリセットしました");}});
$("#manualAddForm").addEventListener("submit",e=>{e.preventDefault();const title=$("#manualTitle").value.trim(),url=$("#manualUrl").value.trim(),tag=$("#manualTag").value;if(!title||!url)return;let parsed;try{parsed=new URL(url);if(!["http:","https:"].includes(parsed.protocol))throw 0;}catch(err){showToast("有効なHTTP/HTTPS URLを入力してください");return;}const id="manual-"+(crypto.randomUUID?crypto.randomUUID():Date.now().toString(36));state.manual.unshift({id,title,url,sourceId:"manual-entry",sourceType:"external",lang:state.lang==="en"?"en":"ja",tab:state.lang,publishedAt:new Date().toISOString(),discoveredAt:new Date().toISOString(),description:"手動で登録した情報です。",tags:tag?[tag]:[],learningTypes:[]});$("#manualTitle").value="";$("#manualUrl").value="";persistState();render();showToast("情報を追加しました");});
renderTabs();loadLocalState();loadData();

document.addEventListener("error",e=>{const img=e.target;if(img.tagName==="IMG"&&img.hasAttribute("data-thumb"))img.remove();},true);
