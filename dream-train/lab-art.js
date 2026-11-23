/* Original toy illustrations. This game has no dependency on the treasure game's art. */
(function(root){
'use strict';
const colors={peach:['#ffe3c8','#f3bca4'],blue:['#c8eaff','#87c8ed'],lilac:['#ecdbff','#bfa1e6'],mint:['#d6f5d6','#9fd4b3'],yellow:['#fff1ba','#e9cc79']};
let serial=0;
const shadow='<ellipse cx="80" cy="143" rx="55" ry="10" fill="#241d4730"/>';
function svg(body,view='0 0 160 160'){return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="'+view+'" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+body+'</svg>';}
function star(x=80,y=80,r=35,fill='#ffdc80'){let d='';for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,rr=i%2?r*.48:r;d+=(i?'L':'M')+(x+Math.cos(a)*rr)+','+(y+Math.sin(a)*rr);}return '<path d="'+d+'Z" fill="'+fill+'" stroke="#b08a5a" stroke-width="3"/>';}
function heart(x=80,y=80,r=32,color='#f29aae'){return '<path d="M'+x+' '+(y+r)+'C'+(x-r*2.1)+' '+(y-r*.25)+' '+(x-r*.7)+' '+(y-r*1.8)+' '+x+' '+(y-r*.55)+'C'+(x+r*.7)+' '+(y-r*1.8)+' '+(x+r*2.1)+' '+(y-r*.25)+' '+x+' '+(y+r)+'" fill="'+color+'"/>';}
function moco(look={},mood='happy'){
 const c=colors[look.color]||colors.peach,id='mc'+(++serial),ears=look.ears||'flop';
 const ear=ears==='round'?'<circle cx="37" cy="49" r="21"/><circle cx="122" cy="49" r="21"/>':ears==='point'?'<path d="M28 65 29 15q25 5 33 36m39 0q14-38 29-36l3 50"/>':'<path d="M38 51Q3 30 18 74q7 20 25 4m74-27q36-20 24 23-8 20-25 4"/>';
 let b='<defs><radialGradient id="'+id+'" cx="35%" cy="22%" r="85%"><stop stop-color="#fff8e5"/><stop offset=".55" stop-color="'+c[0]+'"/><stop offset="1" stop-color="'+c[1]+'"/></radialGradient></defs>'+shadow;
 b+='<g fill="url(#'+id+')" stroke="#9e7770" stroke-width="3.5">'+ear+'<path d="M28 91Q15 68 38 52q6-25 30-19 18-21 39 1 26-3 27 26 22 24 2 46 2 28-25 29-12 18-34 6-22 11-35-5-25 1-25-21Z"/></g>';
 b+='<ellipse cx="53" cy="98" rx="12" ry="7" fill="#f1a0a1" opacity=".65"/><ellipse cx="110" cy="98" rx="12" ry="7" fill="#f1a0a1" opacity=".65"/>';
 b+=mood==='sleep'?'<path d="M51 82q9 9 18 0m25 0q9 9 18 0" stroke="#5b4651" stroke-width="4"/>':'<ellipse cx="60" cy="82" rx="7" ry="10" fill="#483e52"/><ellipse cx="102" cy="82" rx="7" ry="10" fill="#483e52"/><circle cx="58" cy="79" r="2.5" fill="white"/><circle cx="100" cy="79" r="2.5" fill="white"/>';
 b+=mood==='wow'?'<ellipse cx="82" cy="105" rx="7" ry="9" fill="#8f6368"/>':'<path d="M75 103q7 8 14 0" stroke="#9b6a72" stroke-width="3"/>';
 b+='<path d="M49 121q33 18 65-1l-5 13q-26 12-54 0Z" fill="#61b9bd"/><path d="m100 130 13 22 8-17" fill="#479fa8"/>';
 const hat=look.hat||'star';if(hat==='star')b+=star(112,42,17);if(hat==='heart')b+=heart(112,39,16);if(hat==='leaf')b+='<path d="M98 44q-6-32 34-23 1 31-34 23Z" fill="#99c890" stroke="#649e79" stroke-width="3"/>';
 if(hat==='crown')b+='<path d="m53 40-3-27 20 12 12-20 13 20 20-12-5 28Z" fill="#ffdc82" stroke="#bc955c" stroke-width="3"/>';
 if(hat==='bow')b+='<path d="M111 35q-36-36-33 1 7 20 33 1 28 24 34 0 2-35-34-2" fill="#e995b9" stroke="#bc7198" stroke-width="3"/>';
 return svg(b);
}
function icon(name,opts={}){
 let b='';const st=' stroke="#846b7b" stroke-width="4"';
 switch(name){
 case 'moco':return moco(opts);
 case 'star':b=star();break;
 case 'heart':b=heart();break;
 case 'hand':b='<path d="M43 88V60q0-14 13-10l3 24V34q0-15 13-11l4 43V25q1-15 14-10l3 51 4-31q4-13 15-5l-2 45 12-16q11-10 17 2l-16 47q-10 35-41 34-30 0-37-28L30 90q-4-15 8-14Z" fill="#ffdcad" stroke="#b78a78" stroke-width="4"/>';break;
 case 'water':b='<path d="M80 14Q10 91 45 128q36 36 70-3 30-37-35-111Z" fill="#95dce6" stroke="#5aaaba" stroke-width="4"/><path d="M53 87q-13 26 12 34" stroke="#e7fbf5" stroke-width="9"/>';break;
 case 'care':b='<rect x="25" y="42" width="110" height="91" rx="26" fill="#f6acbb" stroke="#bc7894" stroke-width="4"/><path d="M59 43V25h42v18" stroke="#d18ba5" stroke-width="11"/><path d="M80 66v44m-22-22h44" stroke="#fff3dd" stroke-width="15"/>';break;
 case 'steth':b='<path d="M36 26v37q0 39 45 28 21-4 19-32V26" stroke="#80c8c5" stroke-width="12"/><path d="M68 94v22q-1 28 40 17" stroke="#b6a3d9" stroke-width="9"/><circle cx="116" cy="117" r="20" fill="#e8d9f5" stroke="#8e83b5" stroke-width="5"/><path d="M35 22v19m65-19v19" stroke="#716d8f" stroke-width="11"/>';break;
 case 'spray':b='<rect x="48" y="61" width="65" height="81" rx="16" fill="#b5e5cf" stroke="#75a99a" stroke-width="4"/><path d="M68 60V37h27v23M63 33V20h53" stroke="#c7b8ed" stroke-width="12"/><path d="M66 101h29m-15-15v30" stroke="#fff8e0" stroke-width="11"/><path d="m132 22 12-9m-12 22 16 1" stroke="#91d8da" stroke-width="5"/>';break;
 case 'bandage':b='<g transform="rotate(-30 80 80)"><rect x="16" y="53" width="129" height="55" rx="24" fill="#efc58e" stroke="#bf996f" stroke-width="4"/><rect x="59" y="57" width="42" height="47" rx="9" fill="#fff0cd"/><path d="M36 68v1m0 21v1m88-23v1m0 21v1" stroke="#b69269" stroke-width="6"/></g>';break;
 case 'camera':b='<path d="m44 45 14-20h44l14 20" fill="#e8b587" stroke="#b88771" stroke-width="4"/><rect x="15" y="45" width="130" height="94" rx="23" fill="#f5c59d" stroke="#b88771" stroke-width="4"/><circle cx="80" cy="91" r="33" fill="#9dd9d9" stroke="#7ba8b2" stroke-width="7"/><circle cx="80" cy="91" r="21" fill="#cdecef"/><path d="m68 85 17-8" stroke="white" stroke-width="7"/><circle cx="122" cy="62" r="6" fill="#fff0d0"/>';break;
 case 'build':b='<path d="m34 115 62-63 17 16-62 63q-14 7-17-16Z" fill="#f2c78f" stroke="#bd946b" stroke-width="4"/><path d="m77 47 19-23q15-15 44 11l-15 18-16-10-10 22Z" fill="#b6c7e7" stroke="#7e8da8" stroke-width="4"/>';break;
 case 'scope':b='<circle cx="69" cy="67" r="45" fill="#c2ebe0" fill-opacity=".8" stroke="#85b7ab" stroke-width="10"/><path d="m103 102 37 38" stroke="#eab291" stroke-width="20"/><path d="M46 61q9-20 27-18" stroke="#fff9db" stroke-width="7"/><circle cx="58" cy="71" r="6" fill="#79acaa"/><circle cx="83" cy="71" r="6" fill="#79acaa"/>';break;
 case 'magic':b='<path d="m28 141 65-76" stroke="#c49bdf" stroke-width="13"/>'+star(104,49,43)+'<path d="M21 44v16m-8-8h16m101 47v18m-9-9h18" stroke="#ffdc92" stroke-width="5"/>';break;
 case 'shield':b='<path d="M28 35 80 15l52 20-4 55q-10 40-48 57-39-18-48-57Z" fill="#ace0dc" stroke="#78b2bb" stroke-width="5"/>'+star(80,73,25,'#fff0ba');break;
 case 'leaf':b='<path d="M35 130Q-5 28 132 19q16 117-97 111Z" fill="#a1d3a0" stroke="#6eab89" stroke-width="5"/><path d="m33 139 67-79m-42 48-4-34m27 7 29-2" stroke="#6eab89" stroke-width="5"/>';break;
 case 'shell':b='<path d="M29 115Q-4 65 30 41q24-22 49 2 27-26 53-2 33 32-1 75L81 143Z" fill="#edbfd8" stroke="#ba8fb4" stroke-width="4"/><path d="m80 132-43-70m43 70V58m0 74 40-70" stroke="#f8dced" stroke-width="9"/>';break;
 case 'moon':b='<path d="M103 17Q12 6 17 89q12 80 113 49Q56 123 103 17Z" fill="#ffe2a0" stroke="#d0b078" stroke-width="4"/>';break;
 case 'sun':b='<circle cx="80" cy="81" r="39" fill="#ffda82" stroke="#d4aa61" stroke-width="4"/><path d="M80 8v18m0 111v16M8 80h18m111 0h17M28 28l14 14m76 76 14 14M28 132l14-14m76-76 14-14" stroke="#edc276" stroke-width="9"/>';break;
 case 'flower':return flower(true);
 case 'fox':return fox(true);
 case 'owl':return owl();
 case 'mill':return mill(true);
 case 'boat':return boat(true);
 case 'coral':return coral(true);
 case 'cloud':return cloud();
 case 'bottle':return bottle();
 case 'gate':return gate(false);
 case 'lantern':b='<path d="M58 29q22-31 44 0" stroke="#b69572" stroke-width="7"/><rect x="43" y="37" width="75" height="99" rx="25" fill="#ffe0a0" stroke="#c7a06e" stroke-width="5"/><path d="M43 49h75m-75 74h75" stroke="#e4b77b" stroke-width="8"/><path d="M80 59v49" stroke="#fff6ca" stroke-width="12"/>';break;
 case 'gear':b='<path d="m64 17 30 0 4 20 17 7 18-10 16 25-16 14v18l16 14-16 25-19-10-16 7-4 20H64l-4-20-17-7-18 10-15-25 16-14V73L10 59l15-25 18 10 17-7Z" fill="#e5bb76" stroke="#ac8a66" stroke-width="4"/><circle cx="79" cy="82" r="28" fill="#ffe9b0" stroke="#ba996b" stroke-width="4"/>';break;
 case 'book':b='<path d="M80 44Q40 20 12 36v96q35-13 68 10 30-23 68-10V36q-29-16-68 8Z" fill="#fff0c9" stroke="#b39ab1" stroke-width="5"/><path d="M80 46v90M29 55l32 8m-32 9 32 8m-32 9 32 8m38-26 25-8m-25 26 25-8" stroke="#d5bdc4" stroke-width="5"/>';break;
 case 'home':return house(3);
 case 'travel':b='<path d="m22 92 113-61-42 113-25-43Z" fill="#b5dce4" stroke="#8296b1" stroke-width="4"/><path d="m68 101 67-70-47 85" stroke="#f5f1dd" stroke-width="6"/><path d="m24 116-10 15m32-6-10 21" stroke="#d6c4eb" stroke-width="7"/>';break;
 case 'alien':b='<ellipse cx="79" cy="92" rx="51" ry="48" fill="#a5e1b7" stroke="#70ab91" stroke-width="4"/><path d="M49 58 38 24m68 34 11-34" stroke="#8bc5a4" stroke-width="8"/><circle cx="36" cy="22" r="12" fill="#c9ecb8"/><circle cx="119" cy="22" r="12" fill="#c9ecb8"/><ellipse cx="58" cy="84" rx="10" ry="16" fill="#427d76" transform="rotate(-20 58 84)"/><ellipse cx="103" cy="84" rx="10" ry="16" fill="#427d76" transform="rotate(20 103 84)"/><path d="M68 111q12 12 24 0" stroke="#427d76" stroke-width="4"/>';break;
 case 'note':b='<path d="M66 115V34l62-15v83" stroke="#a98bc6" stroke-width="12"/><ellipse cx="46" cy="123" rx="25" ry="17" transform="rotate(-20 46 123)" fill="#d7b6e9" stroke="#a98bc6" stroke-width="4"/><ellipse cx="109" cy="110" rx="25" ry="17" transform="rotate(-20 109 110)" fill="#d7b6e9" stroke="#a98bc6" stroke-width="4"/>';break;
 case 'fish':b='<path d="M36 75 11 45v72l25-25q55 63 112-9-56-66-112-8Z" fill="#a6dce2" stroke="#74abb9" stroke-width="4"/><circle cx="113" cy="75" r="7" fill="#52687e"/><path d="m70 52 14-18 12 21" fill="#d0edef" stroke="#74abb9" stroke-width="3"/>';break;
 case 'butterfly':b='<path d="M75 81Q1-6 18 73q5 34 55 17-48 23-25 47 29 7 31-43m9-14q74-87 58-8-6 34-55 17 47 23 24 47-28 7-31-43" fill="#ebbadb" stroke="#b892bc" stroke-width="4"/><path d="M80 60v64m-1-61L64 45m17 17 16-17" stroke="#a692b4" stroke-width="5"/>';break;
 case 'bird':b='<path d="M37 106Q4 79 35 57q17-58 64-24 35 13 22 57-10 50-68 42Z" fill="#d2c0eb" stroke="#a58eba" stroke-width="4"/><path d="m120 59 29 16-30 9" fill="#f3ca85"/><circle cx="99" cy="56" r="6" fill="#5b4e69"/><path d="M40 86q19-36 39-10 6 22-33 25" fill="#ecddf6" stroke="#bca3d4" stroke-width="3"/>';break;
 case 'carrot':b='<path d="m54 39 65 33Q65 134 22 145Z" fill="#efb47b" stroke="#c88d67" stroke-width="4"/><path d="m92 48-4-31m10 33 25-32m-15 40 36-13" stroke="#98c398" stroke-width="12"/>';break;
 case 'rabbit':b='<path d="M42 74Q13-5 45 13q19 17 18 52m33 0q-5-71 24-55 18 21-2 65" fill="#fbe6d9" stroke="#c7a397" stroke-width="4"/><ellipse cx="80" cy="101" rx="57" ry="43" fill="#fff0df" stroke="#c7a397" stroke-width="4"/><circle cx="60" cy="92" r="6" fill="#675461"/><circle cx="100" cy="92" r="6" fill="#675461"/><path d="m73 111 7 7 7-7" stroke="#cb8e9a" stroke-width="5"/>';break;
 case 'umbrella':b='<path d="M15 83Q26-19 80 22q59-39 66 61-22-18-43 0-21-18-43 0-23-18-45 0Z" fill="#c6b5e8" stroke="#a393c5" stroke-width="4"/><path d="M80 27v102q0 24-23 8" stroke="#ad9ac8" stroke-width="7"/>';break;
 case 'hat':b='<path d="M32 103 48 40q33-17 66 1l18 64" fill="#b5cde7" stroke="#7c9bb7" stroke-width="4"/><ellipse cx="81" cy="112" rx="71" ry="24" fill="#cfe3f1" stroke="#7c9bb7" stroke-width="4"/>';break;
 case 'egg':b='<path d="M27 96Q20 36 80 13q61 24 53 83-2 51-53 52-49-1-53-52Z" fill="#fff0d4" stroke="#d2b898" stroke-width="4"/>';break;
 case 'rock':b='<path d="m18 104 21-55 46-22 43 23 20 58-34 24H48Z" fill="#c2b6ca" stroke="#9b8ca8" stroke-width="4"/><path d="m39 50 41 37 48-35m-48 35-31 42" stroke="#dcd0e2" stroke-width="5"/>';break;
 case 'paw':b='<ellipse cx="81" cy="106" rx="35" ry="28" fill="#d6b0c7"/><ellipse cx="33" cy="69" rx="15" ry="21" fill="#d6b0c7" transform="rotate(-30 33 69)"/><ellipse cx="65" cy="40" rx="15" ry="21" fill="#d6b0c7"/><ellipse cx="100" cy="40" rx="15" ry="21" fill="#d6b0c7"/><ellipse cx="130" cy="69" rx="15" ry="21" fill="#d6b0c7" transform="rotate(30 130 69)"/>';break;
 case 'wave':b='<path d="M8 83q20-44 45-5 22-44 46-2 27-42 53 5v58H8Z" fill="#8fcbd7"/><path d="M15 108q20-23 37 0t38 0 38 0 24 0" stroke="#c8f2e9" stroke-width="7"/>';break;
 case 'tree':b='<path d="M78 99v47" stroke="#ad8f83" stroke-width="17"/><path d="M24 87Q2 45 50 44q9-49 50-22 49-8 43 38 24 54-36 58-40 24-83-9Z" fill="#9ac79d" stroke="#719a88" stroke-width="4"/><path d="m46 64 12-9m45-10 12 7m-42 37 14 5" stroke="#c0dfb5" stroke-width="7"/>';break;
 case 'mushroom':b='<path d="m62 81-7 62h51l-7-62" fill="#fff1ce" stroke="#c5ad90" stroke-width="4"/><path d="M12 85Q29-12 80 24q50-35 69 61-72 27-137 0Z" fill="#eca4b1" stroke="#ba7f98" stroke-width="4"/><circle cx="57" cy="57" r="12" fill="#ffe7d1"/><circle cx="109" cy="68" r="9" fill="#ffe7d1"/>';break;
 case 'flag':b='<path d="M43 145V18" stroke="#c0a489" stroke-width="8"/><path d="m48 22 91 12-28 28 26 28-89-12Z" fill="#eca2ba" stroke="#c382a0" stroke-width="4"/>'+star(84,54,15,'#fff0bf');break;
 case 'lamp':return icon('lantern');
 case 'wheel':return icon('gear');
 case 'sail':b='<path d="M80 10v136M80 21 17 119h63m8-78 53 79H89" fill="#edb7cf" stroke="#af91b4" stroke-width="5"/>';break;
 case 'slide':b='<path d="M31 146V35h51v63q-1 32 67 29v21q-91 4-94-48V55H31" fill="#a8d7d6" stroke="#7aa8b1" stroke-width="5"/><path d="M11 146V35h28M11 65h21m-21 25h21m-21 25h21" stroke="#d9bc94" stroke-width="8"/>';break;
 case 'balloon':b='<path d="M80 105q-23 31 3 48" stroke="#b3a3c4" stroke-width="3"/><path d="m68 111 13-18 13 18" fill="#e9a2bb"/><ellipse cx="81" cy="58" rx="43" ry="52" fill="#efaec4" stroke="#c784a6" stroke-width="4"/><path d="M53 50q-2-17 13-24" stroke="#ffe1e2" stroke-width="8"/>';break;
 case 'rocket':b='<path d="M49 102Q31 38 80 9q49 29 32 93L81 125Z" fill="#c6d6ef" stroke="#8796bd" stroke-width="4"/><path d="m50 88-29 41 35-7m56-35 26 42-34-7" fill="#e8a0b9" stroke="#b77e9c" stroke-width="4"/><circle cx="80" cy="63" r="19" fill="#ffe2a4" stroke="#afacba" stroke-width="5"/><path d="m65 123 15 32 17-32" fill="#f9cd7f"/>';break;
 case 'rainbow':b='<path d="M14 131V83a66 66 0 0 1 132 0v48" stroke="#e7a8c0" stroke-width="18"/><path d="M32 131V83a48 48 0 0 1 96 0v48" stroke="#f2d79a" stroke-width="18"/><path d="M50 131V83a30 30 0 0 1 60 0v48" stroke="#9bd4b9" stroke-width="18"/>';break;
 default:b=star(80,80,43);
 }
 return svg(b);
}
function flower(bloom=false,rainbow=false){return svg(shadow+'<path d="M80 141V79m-3 38q-45 6-39-26 34 0 39 26m6-13q40-25 44 1-9 25-44 19" fill="#94c4a0" stroke="#689c87" stroke-width="5"/>'+(bloom?'<g>'+[0,60,120,180,240,300].map((a,i)=>'<ellipse cx="80" cy="34" rx="22" ry="31" transform="rotate('+a+' 80 70)" fill="'+(rainbow?['#f4abbd','#f4d58c','#bce0ad','#a6dfdb','#b9b7eb','#edbbda'][i]:'#f1a5bd')+'" stroke="#bd7f9c" stroke-width="3"/>').join('')+'<circle cx="80" cy="70" r="25" fill="#ffe09b" stroke="#c7a16f" stroke-width="3"/><circle cx="72" cy="67" r="3" fill="#8f7065"/><circle cx="88" cy="67" r="3" fill="#8f7065"/><path d="M75 78q5 5 10 0" stroke="#b58476" stroke-width="3"/></g>':'<path d="M80 91Q24 55 62 26q13 27 18 23 9-16 19-25 36 32-19 67" fill="#d4b6cb" stroke="#a98fae" stroke-width="4"/>'));}
function fox(healthy=false,clean=false){return svg(shadow+'<path d="M37 124q-43-8-25-50 2 31 33 17" fill="#ebac7e" stroke="#b4806e" stroke-width="4"/><ellipse cx="84" cy="119" rx="40" ry="26" fill="#eeb184" stroke="#b4806e" stroke-width="4"/><path d="m37 64 5-49 36 31 12-2 31-32 9 55q11 63-43 66-64-3-50-69Z" fill="#f2ba8c" stroke="#b4806e" stroke-width="4"/><path d="M42 83q28-5 44 16 21-21 43-15-3 41-43 39-38-1-44-40" fill="#fff0d6"/>'+(healthy?'<path d="M56 75q9-9 18 0m25 0q9-9 18 0" stroke="#7c5b59" stroke-width="4"/>':'<ellipse cx="64" cy="77" rx="5" ry="7" fill="#705453"/><ellipse cx="106" cy="77" rx="5" ry="7" fill="#705453"/>')+'<path d="m78 96 8 7 8-7" stroke="#aa7a70" stroke-width="4"/>'+(healthy?'<g transform="translate(80 105) rotate(-17)"><rect width="46" height="19" rx="8" fill="#ffe7bc" stroke="#ba9877" stroke-width="2"/></g>':clean?'<circle cx="110" cy="117" r="10" fill="#ffe6c3"/>':'<path d="m99 109 19 15m-20 0 19-15" stroke="#bc7e90" stroke-width="5"/>'));}
function owl(){return svg(shadow+'<path d="M31 56 23 20l35 16q28-13 53-1l28-17-8 37q30 94-50 93-80-2-50-92Z" fill="#b7afd8" stroke="#8b7ea8" stroke-width="4"/><ellipse cx="80" cy="106" rx="35" ry="33" fill="#eee1ed"/><circle cx="55" cy="69" r="28" fill="#fff0d8" stroke="#9f8eac" stroke-width="4"/><circle cx="107" cy="69" r="28" fill="#fff0d8" stroke="#9f8eac" stroke-width="4"/><circle cx="59" cy="68" r="9" fill="#63536f"/><circle cx="103" cy="68" r="9" fill="#63536f"/><circle cx="56" cy="65" r="3" fill="white"/><circle cx="100" cy="65" r="3" fill="white"/><path d="m72 89 9 11 10-11" fill="#dfb67d"/><path d="M48 119q29-12 60 0v25q-30-9-60 0Z" fill="#f0cca2" stroke="#ac8c81" stroke-width="3"/>');}
function mill(done=false){return svg(shadow+'<path d="m53 67-10 76h78l-12-76" fill="#f0dbc0" stroke="#b49b8c" stroke-width="4"/><path d="m31 68 50-49 51 49Z" fill="#d88b9e" stroke="#aa718a" stroke-width="4"/><path d="M66 144v-25q16-15 32 0v25" fill="#8dc3c2" stroke="#759d9f" stroke-width="3"/><g class="'+(done?'wind-rotor':'')+'">'+[0,90,180,270].map(a=>'<path d="m85 76-9-52 22-9 4 57Z" transform="rotate('+a+' 83 76)" fill="'+(done?'#b8ddd5':'#c6bdc6')+'" stroke="#7da5a6" stroke-width="3"/>').join('')+'<circle cx="83" cy="76" r="13" fill="#f9d384" stroke="#b59369" stroke-width="3"/></g>');}
function coral(grown=false){return svg(shadow+'<ellipse cx="80" cy="143" rx="66" ry="12" fill="#b9c8d6"/>'+[[-28,0,38],[-4,-15,54],[24,-3,33]].map(([x,y,h])=>'<path d="M'+(80+x)+' '+(138+y)+'V'+(138+y-(grown?h*1.6:h))+'m0 '+(grown?h*.5:10)+'q-24 4-21-22m22 10q24 1 25-22" stroke="'+(grown?'#ed9fc4':'#b8a5c1')+'" stroke-width="14"/>').join('')+(grown?'<circle cx="32" cy="87" r="9" fill="#a9e2d8"/><circle cx="128" cy="49" r="6" fill="#a9e2d8"/>':''));}
function boat(done=false){return svg(shadow+'<path d="m12 99 136-2-24 42H41Z" fill="#e8ab91" stroke="#b9817e" stroke-width="4"/><path d="M33 113h93" stroke="#ffe4bd" stroke-width="7"/><path d="M81 99V17" stroke="#b99c87" stroke-width="6"/>'+(done?'<path d="M75 23 25 86h50m13-48 39 48H88" fill="#b6d8e5" stroke="#7e9db6" stroke-width="3"/><path d="m78 16 27 7-27 12" fill="#e6a4c0"/>':'<path d="M75 26 28 86h47" stroke="#cab9bf" stroke-width="3" stroke-dasharray="5 7"/>'));}
function cloud(dark=false){return svg('<ellipse cx="81" cy="139" rx="57" ry="8" fill="#3a28551f"/><path d="M37 116Q1 115 9 78q5-22 28-22-3-48 41-47 33 0 41 32 39 0 37 37 12 39-29 42Z" fill="'+(dark?'#9d98bd':'#fff0e0')+'" stroke="'+(dark?'#736c9b':'#cfb9b7')+'" stroke-width="4"/><circle cx="60" cy="77" r="6" fill="#70627d"/><circle cx="104" cy="77" r="6" fill="#70627d"/><path d="M72 99q10 '+(dark?'-10':'10')+' 20 0" stroke="#9f7d91" stroke-width="3"/>'+(dark?'<path d="m85 123-13 23 19-5-8 18" fill="#ffe29d" stroke="#ebc574" stroke-width="3"/>':''));}
function bottle(){return svg('<path d="M65 30V12h30v18m-34 1h38v23q34 21 26 76-1 18-44 19-44-1-45-20-10-56 25-75Z" fill="#b6e6dc" stroke="#79b6af" stroke-width="4"/><path d="M62 27h37" stroke="#d6b88a" stroke-width="14"/><rect x="53" y="70" width="56" height="55" rx="7" transform="rotate(-9 80 96)" fill="#fff1c6" stroke="#d5c49b" stroke-width="3"/>'+star(80,96,18));}
function gate(open=false){return svg(shadow+'<path d="M27 145V58Q80-3 133 58v87" fill="#bba8db" stroke="#8e7eae" stroke-width="4"/><path d="M46 145V67q34-42 68 0v78" fill="'+(open?'#fbdf9d':'#816f9e')+'" stroke="#b9a5cf" stroke-width="5"/>'+star(80,48,17)+(open?'<path d="m81 80 8 14 16 3-16 8-8 17-7-17-17-8 17-3Z" fill="#fff3bf"/>':'<rect x="63" y="89" width="34" height="37" rx="9" fill="#e6c18d" stroke="#b69b7c" stroke-width="3"/>'));}
function house(level=0){return svg('<ellipse cx="80" cy="144" rx="75" ry="13" fill="#29214330"/><path d="M26 70h108v66H26Z" fill="#f2bcab" stroke="#b77e87" stroke-width="4"/><path d="M12 73 79 16l70 57Z" fill="#d98da9" stroke="#b07598" stroke-width="4"/><path d="m24 67 55-45 57 45" stroke="#f3bdd0" stroke-width="5"/><circle cx="80" cy="79" r="24" fill="#ffe39e" stroke="#bf8d86" stroke-width="5"/><path d="M80 59v40m-20-20h40" stroke="#fff1c0" stroke-width="4"/><path d="M38 139v-30q14-13 29 0v30" fill="#9dd1ce" stroke="#7fa7ac" stroke-width="4"/><path d="M20 141h121" stroke="#c0a485" stroke-width="12"/>'+(level>=1?'<g class="wind-rotor"><path d="m131 33-3-25 13 1-5 24m-4 0-25 2 1 12 24-9m2-5 24-4 1 12-25-3" fill="#b3dfd8" stroke="#7ea7af" stroke-width="2"/><circle cx="134" cy="35" r="7" fill="#ffe2a0"/></g>':'')+(level>=2?'<path d="M24 58V8L1 55h23" fill="#c1c9e5" stroke="#8b94bc" stroke-width="3"/>':'')+(level>=3?'<path d="M137 107q9 32-17 33" stroke="#a3d7d6" stroke-width="13"/><path d="m109 15 10-12 10 12-10 11Z" fill="#fff0b4"/>':''));}
function scene(world,round=0){
 const shade={home:['#a0c6c3','#85aaac'],forest:[['#c2d6a7','#8ab5a5'],['#d3c5e0','#9eabbc'],['#e4ce9d','#a7baa0']][round],sea:[['#96dadd','#6eafc4'],['#a4c8e9','#899dcb'],['#b6e6d8','#7cb8c7']][round],space:[['#c0b7dc','#8c81b5'],['#c5b8d5','#a48aaf'],['#afbde0','#8a99c0']][round]}[world]||['#c1c6db','#8e90ad'];
 let b='<defs><linearGradient id="land'+world+'" x2="0" y2="1"><stop stop-color="'+shade[0]+'"/><stop offset="1" stop-color="'+shade[1]+'"/></linearGradient></defs><ellipse cx="500" cy="530" rx="435" ry="76" fill="#151a3d40"/><path d="M65 385q415-130 870 0l-66 142-184 62-232-19-252-54Z" fill="'+shade[1]+'"/><path d="M117 432 228 528 367 557 222 488m427-30 54 123 112-66-43-80" fill="#ffffff0c"/><ellipse cx="500" cy="390" rx="435" ry="142" fill="url(#land'+world+')"/><ellipse cx="500" cy="375" rx="424" ry="124" fill="#ffffff10"/>';
 for(let i=0;i<16;i++){const x=115+(i*193)%770,y=320+(i*83)%144;b+='<ellipse cx="'+x+'" cy="'+y+'" rx="'+(5+i%4*3)+'" ry="3" fill="#fff5d735"/>';}
 if(world==='forest'){
  b+='<path d="M115 391Q360 307 475 402T900 390" fill="none" stroke="#f0d6ac" stroke-width="52"/><ellipse cx="285" cy="432" rx="97" ry="30" fill="#a9d9d3" stroke="#7fb6b3" stroke-width="5"/><path d="M225 428h57m-25 13h47" stroke="#e2f5d8" stroke-width="5"/>';
  for(const [x,y,k]of [[70,190,1],[825,180,.85],[904,305,.65],[160,270,.6]])b+='<g transform="translate('+x+' '+y+') scale('+k+')">'+icon('tree').replace('<svg','<svg width="160" height="160"')+'</g>';
 }
 if(world==='sea'){
  b+='<ellipse cx="511" cy="374" rx="382" ry="108" fill="#a5e2df"/><path d="M121 387q91-58 163 2t160 0 160 0 150 0 125-6" stroke="#d7f2e6" stroke-width="9"/><path d="M160 428q95-31 173 6m280 1q83-28 178-10" stroke="#d3f3e4" stroke-width="6"/><path d="M60 419q75-41 131 5l54 53-79 17-85-34m718-42 131-27 1 55-55 38-108-6" fill="#f0dfb4"/>';
 }
 if(world==='space'){
  b+='<path d="M90 398q247-113 388-4t436 0" fill="none" stroke="#d7c4dc" stroke-width="62"/><path d="M131 376q171-48 335 14m160 34 174-28" stroke="#f6dfbd" stroke-width="4" stroke-dasharray="4 18"/>';
  for(let i=0;i<9;i++)b+=star(150+i*88,300+Math.sin(i)*21,8,'#eedeae');
 }
 if(world==='home')b+='<path d="M188 398q299-88 612 0" stroke="#e7cfaa" stroke-width="56"/><path d="m120 335 60 20m645-20 60 10" stroke="#b9e2d4" stroke-width="25"/>';
 b+='<path d="M256 551q-27 25 5 34m502-43q35 22 8 39" stroke="#c6d9db45" stroke-width="7"/>';
 return svg(b,'0 0 1000 650');
}
function prop(id,s){const C=root.LabCore,h=(f)=>C.has(s,f);switch(id){
 case 'house':return house(Math.floor(C.totalProjects(s)/3));
 case 'flower':return h('bloom')?svg('<svg width="160" height="160">'+flower(true,h('rainbow'))+'</svg><svg class="butterfly" x="102" y="2" width="57" height="57">'+icon('butterfly')+'</svg>'):flower(false);
 case 'fox':return fox(h('clinic'),h('clean'));
 case 'owl':return owl();case 'mill':return mill(h('windmill'));
 case 'puddle':return svg('<ellipse cx="80" cy="116" rx="70" ry="23" fill="#a5e3dc" stroke="#7cbeb8" stroke-width="4"/><ellipse cx="77" cy="111" rx="36" ry="9" stroke="#ddf5e5" stroke-width="5"/>');
 case 'mushrooms':return svg('<svg x="0" y="50" width="83" height="104">'+icon('mushroom')+'</svg><svg x="58" y="2" width="104" height="144">'+icon('mushroom')+'</svg>');
 case 'coral':return coral(h('coral'));case 'cloud':return cloud();case 'boat':return boat(h('boat'));case 'bottle':return bottle();
 case 'buoy':return svg('<path d="M46 130V65q34-16 68 0v65" fill="#edb7d1" stroke="#b286aa" stroke-width="4"/><ellipse cx="80" cy="130" rx="60" ry="20" fill="#b3deda" stroke="#7ca6b1" stroke-width="4"/><path d="M81 22v85" stroke="#b79e88" stroke-width="7"/><path d="m84 27 42 12-42 18" fill="#fff0b7"/>'+star(82,93,19));
 case 'crowd':return svg('<svg x="-4" y="29" width="96" height="116">'+moco({color:'mint',ears:'point',hat:'leaf'})+'</svg><svg x="61" y="6" width="104" height="140">'+moco(C.searchTarget(s))+'</svg>');
 case 'visitor':return h('visitor')?icon('alien'):moco({color:'mint',hat:'none',ears:'round'});
 case 'gears':return svg('<svg x="0" y="50" width="82" height="100">'+icon('gear')+'</svg><svg x="66" y="5" width="96" height="118">'+icon('gear')+'</svg>');
 case 'gate':return gate(h('gate'));
 case 'lamps':return svg(Array.from({length:C.code(s).number},(_,i)=>'<svg x="'+(i*34)+'" y="'+(i%2*25+10)+'" width="51" height="115">'+icon('lantern')+'</svg>').join(''));
 case 'planet':return svg('<ellipse cx="80" cy="80" rx="49" ry="52" fill="'+(h('planetmagic')?'#e7b7d5':'#d6c2ed')+'" stroke="#a393c1" stroke-width="4"/><ellipse cx="80" cy="86" rx="76" ry="20" transform="rotate(-22 80 86)" stroke="#f3dca8" stroke-width="12"/><svg x="51" y="37" width="57" height="57">'+icon(C.code(s).symbol)+'</svg>');
 case 'storm':return cloud(!h('skyshow'));
 default:return icon(id);
}}
function memory(p){const fake={world:p.world,worlds:{[p.world]:{round:p.round,flags:p.flags||[p.bloom?'bloom':'',p.coral?'coral':'',p.clear?'skyshow':''],parts:[]}},earned:[],look:p.look};return svg('<rect width="400" height="300" rx="20" fill="'+({forest:'#c9debc',sea:'#a8e2e4',space:'#c8b7e1'}[p.world]||'#c4d8d8')+'"/><circle cx="330" cy="45" r="51" fill="#fff1c130"/><svg x="125" y="20" width="230" height="240">'+(p.world==='home'?house(p.level):prop(p.target,fake))+'</svg><svg x="15" y="127" width="145" height="155">'+moco(p.look)+'</svg>'+(p.decorations||[]).map(d=>'<svg x="'+(d.x*3.4)+'" y="'+(d.y*2.5)+'" width="'+(45*(d.size||1))+'" height="'+(48*(d.size||1))+'">'+icon(d.art)+'</svg>').join('')+star(358,233,17)+'<text x="24" y="35" fill="#66617c" font-family="sans-serif" font-size="13">MOCO’S MEMORY</text>','0 0 400 300');}
root.LabArt={svg,star,heart,moco,icon,scene,prop,memory,house};
})(window);
