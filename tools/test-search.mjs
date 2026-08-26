import { readFileSync } from 'fs';

const qa = JSON.parse(readFileSync('assets/knowledge-base.json', 'utf-8'));
const idx = JSON.parse(readFileSync('assets/tfidf-index.json', 'utf-8'));
const vecs = idx.vectors.map(f => { const v = {}; for(let i=0;i<f.length;i+=2) v[f[i]]=f[i+1]; return v; });
const STOP = '的了是在有和与或但而也都不这就我你他她它们被把让给从到对于及等所能会可以应该需要因为所以如果虽然但是可以已经正在什么为什么怎么怎样如何'.split('');

function tok(t) {
  const c = t.toLowerCase().replace(/[a-zA-Z0-9]+/g, m => ' '+m+' ').replace(/[^一-龥a-z0-9\s]/g, ' ').split('').filter(x => x.trim());
  const tk = [];
  for(let i=0; i<c.length; i++){
    if(!STOP.includes(c[i])) tk.push(c[i]);
    if(i<c.length-1 && !STOP.includes(c[i]) && !STOP.includes(c[i+1])) tk.push(c[i]+c[i+1]);
    if(i<c.length-2 && !STOP.includes(c[i]) && !STOP.includes(c[i+1]) && !STOP.includes(c[i+2])) tk.push(c[i]+c[i+1]+c[i+2]);
  }
  tk.push(...(t.toLowerCase().match(/[a-z][a-z0-9]+/g) || []));
  return tk;
}

function queryVec(q) {
  const tk = tok(q), fr = {};
  tk.forEach(t => fr[t] = (fr[t]||0)+1);
  const v = {}, mx = Math.max(...Object.values(fr), 1);
  for(const [k,w] of Object.entries(fr)) v[k] = (0.5+0.5*(w/mx)) * (idx.idf[k]||0);
  const nm = Math.sqrt(Object.values(v).reduce((s,x)=>s+x*x,0)) || 1;
  for(const k in v) v[k] /= nm;
  return v;
}

function cosine(a, b) { let d=0; for(const k in a) if(b[k]) d+=a[k]*b[k]; return d; }

function tfidfSearch(q, topN) {
  const qv = queryVec(q);
  const wantFormula = /公式|方程|表达式|数学/.test(q);
  const qTokens = q.toLowerCase().match(/[一-鿿]{2,}/g) || [];
  const sc = [];
  for(let i=0; i<vecs.length; i++) {
    let s = cosine(qv, vecs[i]);
    if(s <= 0.05) continue;
    const qHasFormula = wantFormula && qa[i].q.indexOf('公式') !== -1;
    if(wantFormula && qa[i].a.indexOf('公式') !== -1) s *= 1.3;
    if(qHasFormula) s *= 1.5;
    const ql = qa[i].q;
    let mc = 0;
    for(const t of qTokens) if(ql.indexOf(t) !== -1) mc++;
    if(mc >= 2) s *= 1.4;
    else if(mc === 1 && qTokens.length <= 2) s *= 1.2;
    sc.push({ idx: i, score: s });
  }
  sc.sort((a,b) => b.score - a.score);
  return sc.slice(0, topN||3).map(s => ({ q: qa[s.idx].q, a: qa[s.idx].a, lesson: qa[s.idx].lesson, score: s.score }));
}

function directMatch(q, topN) {
  const tokens = q.toLowerCase().match(/[a-zαβγδεζηθικλμνξοπρστυφχψω]+/g) || [];
  const meaningful = tokens.filter(t => t.length > 1 || /[αβγδεζηθικλμνξοπρστυφχψω]/.test(t));
  if(meaningful.length === 0) meaningful.push(...tokens);
  const results = [];
  for(let i=0; i<qa.length; i++) {
    const item = qa[i];
    const ql = item.q.toLowerCase();
    let score = 0;
    for(const t of meaningful) {
      if(ql.indexOf(t) !== -1) {
        // Token must be standalone word (not part of larger variable like τ in rτ)
        const re = new RegExp('(^|[^a-z0-9])' + t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '([^a-z0-9]|$)');
        const isStandalone = re.test(ql);
        const exactMatch = isStandalone && (ql.indexOf(t+'代表') !== -1 || ql.indexOf(t+'是什么') !== -1 || ql.indexOf(t+'是什么意思') !== -1);
        score += exactMatch ? 0.9 : (isStandalone ? 0.5 : 0.15);
      }
    }
    for(const t of meaningful) {
      if(item.a.toLowerCase().indexOf(t) !== -1) score += 0.1;
    }
    if(score > 0.3) results.push({ idx: i, score: Math.min(score, 1) });
  }
  results.sort((a,b) => b.score - a.score);
  return results.slice(0, topN||3).map(s => ({ q: qa[s.idx].q, a: qa[s.idx].a, lesson: qa[s.idx].lesson, score: s.score }));
}

function search(q) {
  const shortQuery = q.length <= 10 || /[αβγδεζηθικλμνξοπρστυφχψω]/.test(q) || /^[A-Za-z]+[是什么代表]/.test(q);
  if(shortQuery) {
    const direct = directMatch(q, 3);
    if(direct.length > 0 && direct[0].score >= 0.5) return { m: 'direct', r: direct };
  }
  const tfidf = tfidfSearch(q, 3);
  if(tfidf.length > 0) return { m: 'tfidf', r: tfidf };
  if(shortQuery) {
    const direct = directMatch(q, 1);
    if(direct.length > 0) return { m: 'direct-fb', r: direct };
  }
  return { m: 'none', r: [] };
}

const tests = [
  ['K是什么', '稳定系数K是什么'],
  ['α是什么', 'α代表什么'],
  ['β代表什么', 'β代表什么'],
  ['δf是什么', 'δf代表什么'],
  ['m是什么', '质量'],
  ['V代表什么', 'V代表什么'],
  ['l是什么', 'l代表'],
  ['Kf是什么', 'Kf代表'],
  ['Fy代表什么', 'Fy代表'],
  ['μ是什么', 'μ代表'],
  ['Ts代表什么', 'Ts代表'],
  ['κ代表什么', 'κ代表'],
  ['τ代表什么', '反应滞后'],
  ['SM是什么', '静态余量'],
  ['ωn代表什么', 'ωn代表'],
  ['ζ代表什么', 'ζ代表'],
  ['ABS是什么', 'ABS是什么'],
  ['ESC是什么', '电子稳定'],
  ['二自由度模型的公式', '核心公式'],
  ['摩擦圆公式', '公式'],
  ['预瞄时间公式', '预瞄'],
  ['载荷转移公式', '载荷转移'],
  ['稳态横摆增益公式', '增益'],
  ['转弯的时候车尾甩出去', '甩尾'],
  ['为什么疲劳驾驶危险', '疲劳'],
  ['油门也能转向', '间接横摆'],
  ['防倾杆怎么改操控', '防倾杆'],
];

let pass = 0, fail = 0;
tests.forEach(([q, expect]) => {
  const s = search(q);
  const topQ = s.r.length ? s.r[0].q : '';
  const ok = topQ.includes(expect);
  if(ok) pass++; else fail++;
  console.log(ok ? '✓' : '✗', q, '→', s.m, topQ.substring(0, 35));
});
console.log('\n' + pass + '/' + tests.length + ' passed (' + Math.round(pass/tests.length*100) + '%)');
