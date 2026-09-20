const assert=require('node:assert/strict');
const D=require('./core.js');
let schedules=0;
for(let n=8;n<=48;n++){
 const rounds=D.schedule(n,6),byes=Array(n).fill(0),pairs=new Set();
 for(const r of rounds){const all=r.matches.flatMap(m=>m.teams.flat()).concat(r.byes);assert.equal(new Set(all).size,n);assert.equal(all.length,n);r.byes.forEach(p=>byes[p]++);for(const m of r.matches){assert(m.table<=6);for(const t of m.teams){const key=t.slice().sort((a,b)=>a-b).join(':');assert(!pairs.has(key),`Repeated partner at ${n}`);pairs.add(key);}}}
 assert(Math.max(...byes)-Math.min(...byes)<=1);
 const s={version:1,title:'Test event',players:Array.from({length:n},(_,i)=>`Player ${i+1}`),tables:6,rounds,playoffs:null};
 D.validate(s);rounds.forEach(r=>r.matches.forEach(m=>m.score=[108,75]));
 const rows=D.standings(s);assert.equal(rows.reduce((t,p)=>t+p.points,0),rounds.flatMap(r=>r.matches).length*2*(108+75));
 assert(rows.every(p=>p.played===3-byes[p.id]));
 s.playoffs=D.createPlayoffs(s);D.validate(s);
 assert.deepEqual(s.playoffs.semis[0].teams,[[s.playoffs.seeds[0],s.playoffs.seeds[7]],[s.playoffs.seeds[3],s.playoffs.seeds[4]]]);
 s.playoffs.semis[0].score=[108,75];s.playoffs.semis[1].score=[91,111];D.syncFinal(s.playoffs);assert.deepEqual(s.playoffs.final.teams,[s.playoffs.semis[0].teams[0],s.playoffs.semis[1].teams[1]]);
 s.playoffs.final.score=[100,75];D.validate(JSON.parse(JSON.stringify(s)));schedules++;
}
assert(D.validScore(108,75));assert(D.validScore(0,100));for(const pair of [[100,100],[99,75],[-1,100],[100.1,75],[Infinity,0]])assert(!D.validScore(...pair));
assert(D.compare({wins:2,played:2,points:205},{wins:2,played:3,points:300})<0,'win percentage has priority');
assert.equal(D.compare({wins:2,played:2,points:210},{wins:3,played:3,points:315}),0,'exact ratio ties');
assert(D.compare({wins:2,played:3,points:271},{wins:2,played:3,points:270})<0,'full point precision');
const tied={version:1,title:'Tie',players:Array.from({length:8},(_,i)=>`P${i}`),tables:2,rounds:D.schedule(8,2),playoffs:null};
assert.throws(()=>D.createPlayoffs(tied));tied.rounds.forEach(r=>r.matches.forEach(m=>m.score=[100,99]));tied.playoffs=D.createPlayoffs(tied);const before=JSON.stringify(tied.playoffs);D.standings(tied);D.standings(tied);assert.equal(JSON.stringify(tied.playoffs),before,'standings do not redraw');
const bad=JSON.parse(JSON.stringify(tied));bad.rounds[0].matches[0].teams[0][0]=999;assert.throws(()=>D.validate(bad));
console.log(`PASS: ${schedules} attendance counts (8–48), fair byes, unique teammates, full points, ranking, playoff seeding, persistence validation, and invalid-score rejection.`);
