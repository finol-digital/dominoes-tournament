/* Tournament calculations shared by the standalone app and its checks. */
(function(root){
'use strict';
const randomInt = n => { const a=new Uint32Array(1); const limit=4294967296-(4294967296%n); do{crypto.getRandomValues(a);}while(a[0]>=limit); return a[0]%n; };
function shuffle(a){ a=a.slice(); for(let i=a.length-1;i>0;i--){const j=randomInt(i+1);[a[i],a[j]]=[a[j],a[i]];}return a; }
const key=(a,b)=>a<b?`${a}:${b}`:`${b}:${a}`;
const MIN_MATCHES=4;
function requiredRounds(n){return Math.ceil(MIN_MATCHES*n/(4*Math.floor(n/4)));}
function scheduledCounts(s){const counts=Array(s.players.length).fill(0);for(const r of s.rounds)for(const m of r.matches)for(const i of m.teams.flat())counts[i]++;return counts;}
function needsExtension(s){return s.rounds.length>0&&scheduledCounts(s).some(n=>n<MIN_MATCHES);}
function schedule(n,tables=6,existing=[]){
 if(!Number.isInteger(n)||n<8||n>48)throw Error('Use 8 to 48 players.');
 if(!Number.isInteger(tables)||tables<1||tables>12)throw Error('Use 1 to 12 tables.');
 const rounds=JSON.parse(JSON.stringify(existing)), met={}, partnered={}, rests=Array(n).fill(0);
 for(const round of rounds){round.byes.forEach(i=>rests[i]++);for(const m of round.matches){const g=m.teams.flat();for(let j=0;j<4;j++)for(let k=j+1;k<4;k++)met[key(g[j],g[k])]=(met[key(g[j],g[k])]||0)+1;for(const team of m.teams)partnered[key(...team)]=1;}}
 function bestPair(g){
   const patterns=[[g[0],g[1],g[2],g[3]],[g[0],g[2],g[1],g[3]],[g[0],g[3],g[1],g[2]]];
   return patterns.map(p=>({p,c:(partnered[key(p[0],p[1])]||0)+(partnered[key(p[2],p[3])]||0)})).sort((a,b)=>a.c-b.c)[0];
 }
 function cost(a){let c=0; for(let i=0;i<a.length;i+=4){const g=a.slice(i,i+4);c+=bestPair(g).c*10000;for(let j=0;j<4;j++)for(let k=j+1;k<4;k++)c+=(met[key(g[j],g[k])]||0)**2;}return c;}
 for(let r=rounds.length;r<requiredRounds(n);r++){
   const pool=shuffle(Array.from({length:n},(_,i)=>i)).sort((a,b)=>rests[a]-rests[b]);
   const byes=pool.slice(0,n%4);byes.forEach(p=>rests[p]++);
   let best=shuffle(pool.slice(n%4)), bestCost=cost(best), a=best.slice(), c=bestCost;
   for(let step=0;step<7000 && bestCost>0;step++){
     const i=randomInt(a.length),j=randomInt(a.length);[a[i],a[j]]=[a[j],a[i]];
     const next=cost(a),temp=Math.max(.08,2*(1-step/7000));
     if(next<=c || Math.random()<Math.exp((c-next)/temp)){c=next;if(c<bestCost){best=a.slice();bestCost=c;}}
     else [a[i],a[j]]=[a[j],a[i]];
   }
   if(bestCost>=10000)throw Error('Could not find a rotation without repeat partners. Please generate again.');
   const matches=[];
   for(let i=0;i<best.length;i+=4){const g=bestPair(best.slice(i,i+4)).p;
     for(let j=0;j<4;j++)for(let k=j+1;k<4;k++)met[key(g[j],g[k])]=(met[key(g[j],g[k])]||0)+1;
     for(const [a,b] of [[g[0],g[1]],[g[2],g[3]]])partnered[key(a,b)]=1;
     const m=i/4;matches.push({teams:[g.slice(0,2),g.slice(2)],score:null,table:m%tables+1,wave:Math.floor(m/tables)+1});
   }
   rounds.push({byes,matches});
 }
 return rounds;
}
function validScore(a,b){return Number.isSafeInteger(a)&&Number.isSafeInteger(b)&&a>=0&&b>=0&&Math.max(a,b)>=100&&Math.min(a,b)<100&&Math.max(a,b)<=1000000;}
function compare(a,b){return b.wins*a.played-a.wins*b.played || b.points*a.played-a.points*b.played;}
function standings(state){
 const rows=state.players.map((name,id)=>({id,name,wins:0,points:0,played:0,byes:0}));
 for(const round of state.rounds){round.byes.forEach(i=>rows[i].byes++);for(const m of round.matches){if(!m.score)continue;m.teams.forEach((team,t)=>team.forEach(i=>{rows[i].played++;rows[i].points+=m.score[t];if(m.score[t]>m.score[1-t])rows[i].wins++;}));}}
 const order=state.playoffs?.seeds||[];
 return rows.sort((a,b)=>{
   if(!a.played||!b.played)return b.played-a.played||a.id-b.id;
   return compare(a,b)||(order.length?order.indexOf(a.id)-order.indexOf(b.id):a.id-b.id);
 });
}
const complete=s=>s.rounds.length>0&&s.rounds.every(r=>r.matches.every(m=>m.score))&&standings(s).every(p=>p.played>=MIN_MATCHES);
function createPlayoffs(state){
 if(!complete(state))throw Error('Finish all qualifying matches; every player must play at least four before playoffs.');
 const rows=standings({...state,playoffs:null}),seeds=[],draws=[];
 for(let i=0;i<rows.length;){let j=i+1;while(j<rows.length&&compare(rows[i],rows[j])===0)j++;
   const group=rows.slice(i,j).map(p=>p.id),order=group.length>1?shuffle(group):group;
   if(group.length>1)draws.push({firstRank:i+1,order});seeds.push(...order);i=j;
 }
 const pair=(a,b)=>[seeds[a-1],seeds[b-1]];
 return {seeds,draws,created:new Date().toISOString(),semis:[{teams:[pair(1,8),pair(4,5)],score:null},{teams:[pair(2,7),pair(3,6)],score:null}],final:null};
}
function syncFinal(p){if(p.semis.every(m=>m.score))p.final={teams:p.semis.map(m=>m.teams[m.score[0]>m.score[1]?0:1]),score:null};else p.final=null;}
function validate(s){
 if(!s||![1,2].includes(s.version)||!Array.isArray(s.players)||s.players.length<8||s.players.length>48||s.players.some(n=>typeof n!=='string'||!n.trim()||n.length>70)||new Set(s.players.map(n=>n.trim().toLowerCase())).size!==s.players.length)throw Error('Invalid player list in backup.');
 if(typeof s.title!=='string'||s.title.length>100||!Number.isInteger(s.tables)||s.tables<1||s.tables>12||!Array.isArray(s.rounds)||![0,s.version===1?3:requiredRounds(s.players.length)].includes(s.rounds.length))throw Error('Invalid event settings.');
 const n=s.players.length,partner=new Set(),byeCount=Array(n).fill(0);
 function match(m){if(!m||!Array.isArray(m.teams)||m.teams.length!==2||m.teams.some(t=>!Array.isArray(t)||t.length!==2)||new Set(m.teams.flat()).size!==4||m.teams.flat().some(i=>!Number.isInteger(i)||i<0||i>=n)||!(m.score===null||(Array.isArray(m.score)&&m.score.length===2&&validScore(...m.score))))throw Error('Invalid match in backup.');}
 for(const r of s.rounds){if(!Array.isArray(r.byes)||!Array.isArray(r.matches)||r.byes.length!==n%4||r.matches.length!==Math.floor(n/4))throw Error('Invalid round in backup.');const seen=r.byes.slice();
   r.byes.forEach(i=>{if(!Number.isInteger(i)||i<0||i>=n)throw Error('Invalid bye.');byeCount[i]++;});
   for(const m of r.matches){match(m);if(!Number.isInteger(m.table)||m.table<1||m.table>s.tables||!Number.isInteger(m.wave)||m.wave<1)throw Error('Invalid table.');seen.push(...m.teams.flat());for(const t of m.teams){const k=key(...t);if(partner.has(k))throw Error('Repeated partner in backup.');partner.add(k);}}
   if(seen.length!==n||new Set(seen).size!==n)throw Error('Players missing or duplicated in a round.');
 }
 if(Math.max(...byeCount)-Math.min(...byeCount)>1)throw Error('Unbalanced byes.');
 if(s.version===2&&needsExtension(s))throw Error('The schedule does not give every player four matches.');
 const legacyComplete=s.version===1&&s.rounds.length===3&&s.rounds.every(r=>r.matches.every(m=>m.score));
 if(s.playoffs){const p=s.playoffs;if(!(complete(s)||legacyComplete)||!Array.isArray(p.seeds)||p.seeds.length!==n||new Set(p.seeds).size!==n||p.seeds.some(i=>!Number.isInteger(i)||i<0||i>=n)||!Array.isArray(p.draws)||!Array.isArray(p.semis)||p.semis.length!==2)throw Error('Invalid playoffs.');
   const rows=standings({...s,playoffs:null}),byId=Object.fromEntries(rows.map(r=>[r.id,r]));for(let i=1;i<n;i++)if(compare(byId[p.seeds[i-1]],byId[p.seeds[i]])>0)throw Error('Invalid seeding order.');
   const expected=[[[p.seeds[0],p.seeds[7]],[p.seeds[3],p.seeds[4]]],[[p.seeds[1],p.seeds[6]],[p.seeds[2],p.seeds[5]]]];
   p.semis.forEach((m,i)=>{match(m);if(JSON.stringify(m.teams)!==JSON.stringify(expected[i]))throw Error('Invalid semifinal teams.');});
   p.draws.forEach(d=>{if(!Number.isInteger(d.firstRank)||!Array.isArray(d.order)||d.order.length<2||JSON.stringify(p.seeds.slice(d.firstRank-1,d.firstRank-1+d.order.length))!==JSON.stringify(d.order))throw Error('Invalid draw record.');});
   if(p.final){match(p.final);if(!p.semis.every(m=>m.score)||JSON.stringify(p.final.teams)!==JSON.stringify(p.semis.map(m=>m.teams[m.score[0]>m.score[1]?0:1])))throw Error('Invalid final teams.');}
   else if(p.semis.every(m=>m.score))throw Error('Missing final.');
 }
 return s;
}
const api={MIN_MATCHES,requiredRounds,scheduledCounts,needsExtension,shuffle,schedule,validScore,compare,standings,complete,createPlayoffs,syncFinal,validate};
if(typeof module!=='undefined')module.exports=api;else root.Domino=api;
})(typeof window!=='undefined'?window:globalThis);
