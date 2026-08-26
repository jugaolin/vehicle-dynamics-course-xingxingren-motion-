// Cloudflare Worker: AI对话反馈代理
// 将用户的问题和评分发送到 GitHub Issues

export default {
  async fetch(request, env) {
    // CORS 预检
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders() });
    }

    if (request.method === 'POST') {
      try {
        const data = await request.json();
        const { question, answer, rating, timestamp } = data;

        // 创建 GitHub Issue
        const title = `[AI反馈] ${rating === 'up' ? '👍' : '👎'} ${question.slice(0, 50)}`;
        const body = `## AI对话反馈\n\n**问题:** ${question}\n\n**AI回答:** ${answer}\n\n**评分:** ${rating === 'up' ? '👍 有帮助' : '👎 需改进'}\n\n**时间:** ${new Date(timestamp).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}`;

        const resp = await fetch(`https://api.github.com/repos/${env.GITHUB_REPO}/issues`, {
          method: 'POST',
          headers: {
            'Authorization': `token ${env.GITHUB_TOKEN}`,
            'Content-Type': 'application/json',
            'User-Agent': 'chat-feedback-worker'
          },
          body: JSON.stringify({
            title: title,
            body: body,
            labels: ['chat-feedback']
          })
        });

        if (resp.ok) {
          return new Response(JSON.stringify({ ok: true }), {
            headers: { ...corsHeaders(), 'Content-Type': 'application/json' }
          });
        } else {
          const err = await resp.text();
          return new Response(JSON.stringify({ ok: false, error: err }), {
            status: 500,
            headers: { ...corsHeaders(), 'Content-Type': 'application/json' }
          });
        }
      } catch (e) {
        return new Response(JSON.stringify({ ok: false, error: e.message }), {
          status: 500,
          headers: { ...corsHeaders(), 'Content-Type': 'application/json' }
        });
      }
    }

    return new Response('Chat Feedback Worker', { headers: corsHeaders() });
  }
};

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };
}
