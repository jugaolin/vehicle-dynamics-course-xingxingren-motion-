/* chat-widget.js — 右下角AI对话气泡(占位版,后续对接Chatbase) */
(function(){
  // 注入HTML
  var html='<div class="chat-bubble" id="chatBubble" aria-label="AI问答">📖</div>'
    +'<div class="chat-window" id="chatWindow">'
    +'<div class="chat-header"><span>📖 书中问答</span><button class="chat-close" id="chatClose">×</button></div>'
    +'<div class="chat-messages" id="chatMessages">'
    +'<div class="chat-msg bot">你好!我是《汽车运动性能技术》的AI助手。请问我关于这本书的任何问题。</div>'
    +'</div>'
    +'<div class="chat-input-wrap">'
    +'<input type="text" id="chatInput" placeholder="输入你的问题..." autocomplete="off"/>'
    +'<button id="chatSend">→</button>'
    +'</div></div>';
  var d=document.createElement('div');d.innerHTML=html;document.body.appendChild(d);

  var bubble=document.getElementById('chatBubble');
  var win=document.getElementById('chatWindow');
  var close=document.getElementById('chatClose');
  var msgs=document.getElementById('chatMessages');
  var input=document.getElementById('chatInput');
  var send=document.getElementById('chatSend');

  // 打开/关闭
  bubble.onclick=function(){
    var open=win.classList.toggle('open');
    bubble.classList.toggle('active',open);
    if(open){input.focus();save('open')}else{save('closed')}
  };
  close.onclick=function(){win.classList.remove('open');bubble.classList.remove('active');save('closed')};

  // 恢复状态
  try{if(localStorage.getItem('chat-state')==='open'){win.classList.add('open');bubble.classList.add('active');input.focus()}}catch(e){}

  function save(s){try{localStorage.setItem('chat-state',s)}catch(e){}}

  // 发送消息
  function doSend(){
    var t=input.value.trim();if(!t)return;
    addMsg(t,'user');input.value='';
    // mock回复(后续替换为Chatbase API)
    setTimeout(function(){addMsg(mockReply(t),'bot')},600);
  }
  send.onclick=doSend;
  input.onkeydown=function(e){if(e.key==='Enter')doSend()};

  function addMsg(text,who){
    var d=document.createElement('div');d.className='chat-msg '+who;d.textContent=text;
    msgs.appendChild(d);msgs.scrollTop=msgs.scrollHeight;
  }

  // mock关键词回复
  function mockReply(q){
    q=q.toLowerCase();
    if(q.match(/摩擦圆|抓地|极限|轮胎.*力/))return'摩擦圆是轮胎力学的核心概念:轮胎能同时给出的纵向力和侧向力受限于一个圆。详见第1课。';
    if(q.match(/不足|过度|us|os|转向.*特性/))return'不足转向(US)时车转弯半径比预期大但稳定;过度转向(OS)则反之。详见第2课。';
    if(q.match(/共振|频率|发飘|发晃|动态.*响应/))return'横摆角速度的频率响应有共振峰,峰越高越"神经质"。想又快又稳,先做大后轮等效侧抗刚度。详见第3课。';
    if(q.match(/转向|路感|回正|主销|阿克曼/))return'转向系统管两件事:把你的意图变成前轮转角,以及通过路感告诉你极限在哪。详见第4课。';
    if(q.match(/悬架|侧倾|束角|外倾|防倾杆/))return'悬架的核心是"轮子姿态随行程怎么变"。侧倾转向、柔性转向折成等效侧抗刚度。详见第5课。';
    if(q.match(/4ws|四轮转向|dyc|横摆力矩|主动/))return'4WS让后轮也会转(低速逆相/高速同相);DYC通过左右力差直接给车施加横摆力矩。详见第6课。';
    if(q.match(/预瞄|人.*车|闭环|驾驶人|好开/))return'人—车闭环是最终检验。好开=让人容易找到匹配节奏的车。详见第7课。';
    return'这是一个很好的问题!建议翻阅对应课程章节深入了解。本站7课覆盖了全书8章核心内容。';
  }
})();
