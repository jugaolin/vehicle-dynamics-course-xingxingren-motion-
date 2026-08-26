/**
 * build-kb.mjs — 从Q&A数据库构建TF-IDF索引
 * 用法: node tools/build-kb.mjs
 * 无外部依赖,纯 Node.js
 */
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const ASSETS_DIR = join(__dirname, '..', 'assets');

/* ===== 中文分词 ===== */
const STOP = '的了是在有和与或但而也都不这就我你他她它们被把让给从到对于及等所能会可以应该需要因为所以如果虽然但是可以已经正在什么为什么怎么怎样如何'.split('');

function tokenize(text) {
  const clean = text.toLowerCase()
    .replace(/[a-zA-Z0-9]+/g, m => ' ' + m + ' ')
    .replace(/[^一-龥a-z0-9\s]/g, ' ');
  const chars = clean.split('').filter(c => c.trim());
  const tokens = [];
  for (let i = 0; i < chars.length; i++) {
    if (STOP.indexOf(chars[i]) === -1) tokens.push(chars[i]); // unigram
    if (i < chars.length - 1 && STOP.indexOf(chars[i]) === -1 && STOP.indexOf(chars[i+1]) === -1) tokens.push(chars[i] + chars[i + 1]); // bigram (skip if either char is stop)
    if (i < chars.length - 2 && STOP.indexOf(chars[i]) === -1 && STOP.indexOf(chars[i+1]) === -1 && STOP.indexOf(chars[i+2]) === -1) tokens.push(chars[i] + chars[i + 1] + chars[i + 2]); // trigram (skip if any char is stop)
  }
  const enWords = text.toLowerCase().match(/[a-z][a-z0-9]+/g) || [];
  tokens.push(...enWords);
  return tokens;
}

/* ===== TF-IDF ===== */
function computeTFIDF(chunks) {
  const N = chunks.length;
  const df = {};
  const docTokens = chunks.map(c => {
    const toks = tokenize(c.text);
    const freq = {};
    for (const t of toks) {
      freq[t] = (freq[t] || 0) + 1;
      df[t] = (df[t] || 0) + 1;
    }
    return freq;
  });

  const idf = {};
  for (const [term, count] of Object.entries(df)) {
    idf[term] = Math.log((N + 1) / (count + 1)) + 1;
  }

  const tfidf = docTokens.map(freq => {
    const vec = {};
    const maxFreq = Math.max(...Object.values(freq), 1);
    for (const [term, count] of Object.entries(freq)) {
      const tf = 0.5 + 0.5 * (count / maxFreq);
      vec[term] = tf * (idf[term] || 1);
    }
    return vec;
  });

  const norms = tfidf.map(vec => {
    let sum = 0;
    for (const v of Object.values(vec)) sum += v * v;
    return Math.sqrt(sum) || 1;
  });
  for (let i = 0; i < tfidf.length; i++) {
    for (const term in tfidf[i]) {
      tfidf[i][term] /= norms[i];
    }
  }

  return { idf, tfidf };
}

/* ===== 主流程 ===== */
async function main() {
  console.log('=== 构建 Q&A TF-IDF 索引 ===');

  // 读取Q&A数据库
  const qaData = JSON.parse(await readFile(join(ASSETS_DIR, 'qa-database.json'), 'utf-8'));
  console.log(`Q&A条目: ${qaData.length}`);

  // 构建文本块: 问题+答案+标签 作为搜索文本
  const chunks = qaData.map((qa, i) => ({
    id: `qa-${i}`,
    lesson: qa.lesson,
    q: qa.q,
    a: qa.a,
    tags: qa.tags || '',
    text: qa.q + ' ' + qa.a + ' ' + (qa.tags || '')
  }));

  // 计算 TF-IDF
  console.log('计算 TF-IDF...');
  const { idf, tfidf } = computeTFIDF(chunks);

  // 保存索引
  const indexData = {
    N: chunks.length,
    idf: idf,
    vectors: tfidf.map(v => {
      const flat = [];
      for (const [k, val] of Object.entries(v)) {
        flat.push(k, Math.round(val * 10000) / 10000);
      }
      return flat;
    })
  };

  const indexPath = join(ASSETS_DIR, 'tfidf-index.json');
  await writeFile(indexPath, JSON.stringify(indexData), 'utf-8');
  console.log(`索引: ${indexPath} (${(Buffer.byteLength(JSON.stringify(indexData)) / 1024).toFixed(1)} KB)`);

  // 同时保存Q&A数据为知识库格式(供前端直接使用)
  const kbPath = join(ASSETS_DIR, 'knowledge-base.json');
  await writeFile(kbPath, JSON.stringify(chunks.map(c => ({
    id: c.id, lesson: c.lesson, q: c.q, a: c.a, tags: c.tags, text: c.text
  }))), 'utf-8');
  console.log(`知识库: ${kbPath} (${(Buffer.byteLength(JSON.stringify(chunks)) / 1024).toFixed(1)} KB)`);

  console.log('\n=== 完成! ===');
}

main().catch(console.error);
