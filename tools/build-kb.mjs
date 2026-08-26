/**
 * build-kb.mjs — 从课程HTML提取文本 → 构建知识库 + TF-IDF索引
 * 用法: node tools/build-kb.mjs
 * 无外部依赖,纯 Node.js
 */
import { readdir, readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const LESSONS_DIR = join(__dirname, '..', 'lessons');
const ASSETS_DIR = join(__dirname, '..', 'assets');

/* ===== HTML 文本提取 ===== */

function stripTags(html) {
  return html
    .replace(/<svg[\s\S]*?<\/svg>/gi, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<figure[\s\S]*?<\/figure>/gi, m => {
      const cap = m.match(/<figcaption>([\s\S]*?)<\/figcaption>/i);
      return cap ? cap[1].replace(/<[^>]+>/g, ' ') : '';
    })
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&').replace(/&#\d+;/g, '')
    .replace(/\s+/g, ' ').trim();
}

function extractSections(html, lessonNum) {
  const sections = [];
  const titleMatch = html.match(/<title>(.*?)<\/title>/i);
  const title = titleMatch ? titleMatch[1].replace(/<[^>]+>/g, '').trim() : `第${lessonNum}课`;

  const sectionRegex = /<section>([\s\S]*?)<\/section>/gi;
  let match;
  while ((match = sectionRegex.exec(html)) !== null) {
    const sHtml = match[1];
    const h2Match = sHtml.match(/<h2>([\s\S]*?)<\/h2>/i);
    const sectionTitle = h2Match ? h2Match[1].replace(/<[^>]+>/g, '').trim() : '';

    const paragraphs = [];
    // 段落
    const pRegex = /<p[^>]*>([\s\S]*?)<\/p>/gi;
    let p;
    while ((p = pRegex.exec(sHtml)) !== null) {
      const t = p[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      if (t.length > 10) paragraphs.push(t);
    }
    // 公式
    const fRegex = /<div class="formula">(.*?)<\/div>/gi;
    let f;
    while ((f = fRegex.exec(sHtml)) !== null) {
      const t = f[1].replace(/<[^>]+>/g, '').trim();
      if (t.length > 3) paragraphs.push('公式: ' + t);
    }
    // 列表
    const lRegex = /<li>([\s\S]*?)<\/li>/gi;
    let l;
    while ((l = lRegex.exec(sHtml)) !== null) {
      const t = l[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      if (t.length > 10) paragraphs.push(t);
    }

    if (paragraphs.length > 0) {
      sections.push({
        lesson: lessonNum,
        lessonTitle: title,
        sectionTitle,
        content: paragraphs.join('\n')
      });
    }
  }
  return sections;
}

/* ===== 分块 ===== */

function chunkText(text, maxLen = 400) {
  if (text.length <= maxLen) return [text];
  const chunks = [];
  const sentences = text.split(/(?<=[。！？])\s*/);
  let cur = '';
  for (const s of sentences) {
    if ((cur + s).length > maxLen && cur.length > 0) {
      chunks.push(cur.trim());
      cur = '';
    }
    cur += s;
  }
  if (cur.trim().length > 0) chunks.push(cur.trim());
  return chunks;
}

/* ===== 中文分词 (bigram + 关键词) ===== */

// 停用词
const STOP = new Set('的了是在有和与或但而也都不这就我你他她它们被把让给从到对于及等所能会可以应该需要因为所以如果虽然但是可以已经正在'.split(''));

function tokenize(text) {
  const clean = text.toLowerCase()
    .replace(/[a-zA-Z0-9]+/g, m => ' ' + m + ' ')  // 英文数字加空格
    .replace(/[^一-龥a-z0-9\s]/g, ' ');     // 保留中英文数字

  const tokens = [];
  const chars = [...clean].filter(c => c.trim());

  // unigrams (去停用词)
  for (const c of chars) {
    if (c.trim() && !STOP.has(c)) tokens.push(c);
  }

  // bigrams
  for (let i = 0; i < chars.length - 1; i++) {
    const bg = chars[i] + chars[i + 1];
    if (bg.trim().length === 2) tokens.push(bg);
  }

  // trigrams
  for (let i = 0; i < chars.length - 2; i++) {
    const tg = chars[i] + chars[i + 1] + chars[i + 2];
    if (tg.trim().length === 3) tokens.push(tg);
  }

  // 英文单词
  const enWords = text.toLowerCase().match(/[a-z][a-z0-9]+/g) || [];
  tokens.push(...enWords);

  return tokens;
}

/* ===== TF-IDF 计算 ===== */

function computeTFIDF(chunks) {
  const N = chunks.length;

  // 文档频率
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

  // IDF
  const idf = {};
  for (const [term, count] of Object.entries(df)) {
    idf[term] = Math.log((N + 1) / (count + 1)) + 1;
  }

  // TF-IDF 向量 (稀疏表示: {term: tfidf_value})
  const tfidf = docTokens.map(freq => {
    const vec = {};
    const maxFreq = Math.max(...Object.values(freq), 1);
    for (const [term, count] of Object.entries(freq)) {
      const tf = 0.5 + 0.5 * (count / maxFreq);  // 增强TF
      vec[term] = tf * (idf[term] || 1);
    }
    return vec;
  });

  // 归一化
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
  console.log('=== 构建知识库 + TF-IDF索引 ===');

  const files = (await readdir(LESSONS_DIR)).filter(f => f.endsWith('.html')).sort();
  console.log(`找到 ${files.length} 个课程文件`);

  const allSections = [];
  for (const file of files) {
    const numMatch = file.match(/lesson-0*(\d+)/);
    const lessonNum = numMatch ? parseInt(numMatch[1]) : 0;
    const html = await readFile(join(LESSONS_DIR, file), 'utf-8');
    const sections = extractSections(html, lessonNum);
    allSections.push(...sections);
    console.log(`  第${lessonNum}课: ${sections.length} 个段落`);
  }

  // 分块
  const chunks = [];
  for (const sec of allSections) {
    const textChunks = chunkText(sec.content);
    for (const chunk of textChunks) {
      chunks.push({
        id: `L${sec.lesson}-${chunks.length}`,
        lesson: sec.lesson,
        lessonTitle: sec.lessonTitle,
        sectionTitle: sec.sectionTitle,
        text: chunk
      });
    }
  }
  console.log(`总计 ${chunks.length} 个文本块`);

  // 保存知识库JSON
  const kbPath = join(ASSETS_DIR, 'knowledge-base.json');
  await writeFile(kbPath, JSON.stringify(chunks), 'utf-8');
  console.log(`知识库: ${kbPath} (${(Buffer.byteLength(JSON.stringify(chunks)) / 1024).toFixed(1)} KB)`);

  // 计算 TF-IDF
  console.log('\n计算 TF-IDF...');
  const { idf, tfidf } = computeTFIDF(chunks);

  // 保存 TF-IDF 索引 (精简JSON)
  const indexData = {
    N: chunks.length,
    idf: idf,
    vectors: tfidf.map(v => {
      // 转为数组格式 [term, value, term, value, ...] 更紧凑
      const flat = [];
      for (const [k, val] of Object.entries(v)) {
        flat.push(k, Math.round(val * 10000) / 10000);
      }
      return flat;
    })
  };

  const indexPath = join(ASSETS_DIR, 'tfidf-index.json');
  await writeFile(indexPath, JSON.stringify(indexData), 'utf-8');
  console.log(`TF-IDF索引: ${indexPath} (${(Buffer.byteLength(JSON.stringify(indexData)) / 1024).toFixed(1)} KB)`);

  console.log('\n=== 完成! ===');
}

main().catch(console.error);
