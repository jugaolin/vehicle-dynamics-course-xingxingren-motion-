/* chat-widget.js — 西瓜小人AI对话助手 */
(function(){
  var isDark = window.matchMedia('(prefers-color-scheme:dark)').matches
    || document.documentElement.getAttribute('data-theme')==='dark';

  // 注入HTML
  var wrap = document.createElement('div');
  wrap.innerHTML =
    '<div class="chat-avatar" id="chatAvatar" aria-label="AI问答">'
    + '<img src="../assets/avatar.jpg" alt="西瓜小人" onerror="this.src=\'assets/avatar.jpg\'"/>'
    + '</div>'
    + '<div class="chat-panel" id="chatPanel">'
    + '<div class="chat-panel-header">'
    + '<div class="chat-panel-title"><span class="chat-panel-icon">💬</span> 星星人·讲运动学 AI助手</div>'
    + '<button class="chat-panel-close" id="chatClose">×</button>'
    + '</div>'
    + '<div class="chat-panel-messages" id="chatMessages">'
    + '<div class="chat-msg bot"><div class="chat-avatar-sm"><img src="../assets/avatar.jpg" alt="" onerror="this.src=\'assets/avatar.jpg\'"/></div><div class="chat-bubble-text">你好呀!我是星星人 AI 助手 🍉<br>问我关于《汽车运动性能技术》的任何问题吧~</div></div>'
    + '</div>'
    + '<div class="chat-panel-input">'
    + '<input type="text" id="chatInput" placeholder="输入你的问题..." autocomplete="off"/>'
    + '<button id="chatSend"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg></button>'
    + '</div></div>';
  document.body.appendChild(wrap);

  var avatar = document.getElementById('chatAvatar');
  var panel = document.getElementById('chatPanel');
  var closeBtn = document.getElementById('chatClose');
  var msgs = document.getElementById('chatMessages');
  var input = document.getElementById('chatInput');
  var send = document.getElementById('chatSend');

  function openPanel(){ panel.classList.add('open'); avatar.classList.add('active'); input.focus(); save('open'); }
  function closePanel(){ panel.classList.remove('open'); avatar.classList.remove('active'); save('closed'); }

  avatar.onclick = function(){ panel.classList.contains('open') ? closePanel() : openPanel(); };
  closeBtn.onclick = closePanel;

  // 恢复状态
  try { if(localStorage.getItem('chat-state')==='open') openPanel(); } catch(e){}

  function save(s){ try{ localStorage.setItem('chat-state',s); }catch(e){} }

  function doSend(){
    var t = input.value.trim(); if(!t) return;
    addMsg(t, 'user'); input.value = '';
    setTimeout(function(){ addMsg(mockReply(t), 'bot'); }, 500 + Math.random()*400);
  }
  send.onclick = doSend;
  input.onkeydown = function(e){ if(e.key==='Enter') doSend(); };

  function addMsg(text, who){
    var d = document.createElement('div');
    d.className = 'chat-msg ' + who;
    if(who==='bot'){
      d.innerHTML = '<div class="chat-avatar-sm"><img src="../assets/avatar.jpg" alt="" onerror="this.src=\'assets/avatar.jpg\'"/></div><div class="chat-bubble-text">' + text + '</div>';
    } else {
      d.innerHTML = '<div class="chat-bubble-text">' + text + '</div>';
    }
    msgs.appendChild(d);
    msgs.scrollTop = msgs.scrollHeight;
  }

  function mockReply(q){
    q = q.toLowerCase();
    if(q.match(/摩擦圆|抓地|极限|轮胎.*力/)) return'摩擦圆是轮胎力学的核心:轮胎能同时给出的纵向力和侧向力受限于一个圆。<b>第 1 课</b>有详细讲解哦~';
    if(q.match(/不足|过度|us|os|转向特性/)) return'不足转向(US)时车转弯半径比预期大但稳定;过度转向(OS)则相反。<b>第 2 课</b>二自由度模型讲得很清楚~';
    if(q.match(/共振|频率|发飘|发晃|动态响应/)) return'横摆角速度的频率响应有个共振峰,峰越高的车越"神经质"。想又快又稳,先做大后轮等效侧抗刚度。详见<b>第 3 课</b>~';
    if(q.match(/转向|路感|回正|主销|阿克曼/)) return'转向系统管两件事:把你的意图变成前轮转角,以及通过路感告诉你极限在哪。主销后倾拖距让方向盘自己回正~<b>第 4 课</b>详解~';
    if(q.match(/悬架|侧倾|束角|外倾|防倾杆/)) return'悬架的核心是"轮子姿态随行程怎么变"。调前后侧倾刚度比例就能改 US/OS,不用换轮胎!<b>第 5 课</b>~';
    if(q.match(/4ws|四轮转向|dyc|横摆力矩|主动/)) return'4WS让后轮也会转:低速逆相缩小转弯半径,高速同相减侧偏。DYC通过左右力差直接拧车头~详见<b>第 6 课</b>!';
    if(q.match(/预瞄|人.*车|闭环|驾驶|好开/)) return'人—车闭环才是最终检验。好开 = 让人容易找到匹配节奏的车。眼睛看远一点=预瞄时间足~<b>第 7 课</b>收尾~';
    if(q.match(/你好|你是|名字|叫什么/)) return'我是星星人 AI 助手 🍉 基于《汽车运动性能技术》这本书训练的,可以回答书中相关问题~';
    if(q.match(/谢谢|感谢|thanks/)) return'不客气!继续问我问题吧~ 😊';
    return'好问题!建议翻阅对应课程深入了解。本站 7 课覆盖了全书 8 章核心内容,每课都有开车验证题哦~ 🚗';
  }
})();
