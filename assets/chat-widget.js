/* chat-widget.js — 西瓜小人AI对话助手(纯前端mock,无需API) */
(function(){
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
    + '<div class="chat-msg bot"><div class="chat-avatar-sm"><img src="../assets/avatar.jpg" alt="" onerror="this.src=\'assets/avatar.jpg\'"/></div><div class="chat-bubble-text">你好呀!我是星星人 AI 助手 🍉<br>问我关于《汽车运动性能技术》的任何问题吧~<br><br>💡 试试问我:<br>· 摩擦圆是什么?<br>· 不足转向和过度转向?<br>· 悬架怎么影响操控?<br>· 预瞄时间是什么?</div></div>'
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
  try { if(localStorage.getItem('chat-state')==='open') openPanel(); } catch(e){}
  function save(s){ try{ localStorage.setItem('chat-state',s); }catch(e){} }

  function doSend(){
    var t = input.value.trim(); if(!t) return;
    addMsg(t, 'user'); input.value = '';
    var reply = mockReply(t);
    setTimeout(function(){ addMsg(reply, 'bot', t); }, 400 + Math.random()*300);
  }
  send.onclick = doSend;
  input.onkeydown = function(e){ if(e.key==='Enter') doSend(); };

  // Worker URL (Cloudflare Worker 代理,token安全存储在Worker中)
  var WORKER_URL = ''; // 部署后填入

  function addMsg(text, who, rawQ){
    var d = document.createElement('div');
    d.className = 'chat-msg ' + who;
    if(who==='bot'){
      var id = 'msg-' + Date.now();
      d.innerHTML = '<div class="chat-avatar-sm"><img src="../assets/avatar.jpg" alt="" onerror="this.src=\'assets/avatar.jpg\'"/></div>'
        + '<div><div class="chat-bubble-text">' + text + '</div>'
        + '<div class="chat-feedback" id="'+id+'">'
        + '<button class="fb-btn" data-q="'+escHtml(rawQ||'')+'" data-a="'+escHtml(text)+'" data-r="up" title="有帮助">👍</button>'
        + '<button class="fb-btn" data-q="'+escHtml(rawQ||'')+'" data-a="'+escHtml(text)+'" data-r="down" title="需改进">👎</button>'
        + '</div></div>';
      // 绑定点击
      setTimeout(function(){
        var btns = d.querySelectorAll('.fb-btn');
        btns.forEach(function(btn){
          btn.onclick = function(){
            sendFeedback(btn.dataset.q, btn.dataset.a, btn.dataset.r);
            // 标记已评价
            var container = btn.parentElement;
            container.innerHTML = btn.dataset.r==='up' ? '<span class="fb-done">👍 感谢反馈!</span>' : '<span class="fb-done">👎 已记录,我们会改进</span>';
          };
        });
      }, 10);
    } else {
      d.innerHTML = '<div class="chat-bubble-text">' + text + '</div>';
    }
    msgs.appendChild(d);
    msgs.scrollTop = msgs.scrollHeight;
  }

  function escHtml(s){ return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;'); }

  function sendFeedback(q, a, rating){
    // 存到 localStorage
    var log = [];
    try { log = JSON.parse(localStorage.getItem('chat-feedback') || '[]'); } catch(e){}
    log.push({q:q, a:a, rating:rating, time:Date.now()});
    try { localStorage.setItem('chat-feedback', JSON.stringify(log)); } catch(e){}
    // 尝试发送到 Worker
    if(WORKER_URL){
      fetch(WORKER_URL, {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({question:q, answer:a, rating:rating, timestamp:Date.now()})
      }).catch(function(){});
    }
  }

  /* ========== 知识库:严格依据《汽车运动性能技术》 ========== */
  var KB = [
    // ---- 第1课:轮胎 ----
    {k:'摩擦圆|抓地力|极限|轮胎.*力|纵向力|侧向力',
     a:'<b>摩擦圆</b>是轮胎力学的核心概念。轮胎能同时给出的纵向力(Fx)和侧向力(Fy)受限于一个圆:<b>√(Fx²+Fy²) ≤ μ·Fz</b>(μ为摩擦系数,Fz为垂直载荷)。纵向力用得越多,留给侧向力的余量就越小——这就是为什么过弯中猛踩油门容易打滑。详见<b>第1课</b>~'},
    {k:'侧偏角|侧偏|滑移角|slip.*angle',
     a:'<b>侧偏角(β)</b>是轮胎实际运动方向与轮胎朝向之间的夹角。侧偏角不是"打滑"——轮胎接地印迹在弹性变形中逐步偏离,产生侧向力。在小侧偏角范围内,侧向力与侧偏角近似<b>线性</b>关系,比例系数叫<b>侧偏刚度 Cα</b>。超过一定角度后力不再增大,达到摩擦极限。详见<b>第1课</b>~'},
    {k:'侧偏刚度|cornering stiffness',
     a:'<b>侧偏刚度 Cα</b>= 侧向力 / 侧偏角(在线性区内)。它取决于轮胎气压、垂直载荷、轮胎宽度等因素。前后轮侧偏刚度的相对大小,直接决定了车是不足转向还是过度转向。详见<b>第1课</b>~'},
    {k:'轮胎.*坐标|轮胎.*方向|前进方向',
     a:'轮胎坐标系:以轮胎接地中心为原点,X轴为前进方向(纵向),Y轴为侧向,Z轴向下。纵向力Fx沿X轴,侧向力Fy沿Y轴。第1课有详细的坐标系图解~'},
    {k:'载荷转移|weight transfer|垂直载荷',
     a:'过弯时车身侧倾,重量从内侧轮转移到外侧轮。由于轮胎力对垂直载荷是<b>非线性</b>的,载荷转移越大,这根轴的总侧向力反而越"亏"。这就是侧倾刚度分配能改 US/OS 的根本原因。详见<b>第1课+第5课</b>~'},

    // ---- 第2课:二自由度模型 ----
    {k:'二自由度|2dof|两自由度',
     a:'<b>二自由度模型</b>是分析车辆操纵稳定性的基础。两个自由度是:<b>横摆角速度 r</b>(车绕竖直轴旋转)和<b>质心侧偏角 β</b>(车身侧向滑移)。前轮转角δ是输入,横摆率和侧偏角是输出。第2课有完整的模型推导~'},
    {k:'不足转向|过度转向|中性转向|understeer|oversteer',
     a:'<b>不足转向(US)</b>:转弯半径比预期大,车"推头",但稳定——前轮先到极限。<b>过度转向(OS)</b>:转弯半径比预期小,车"甩尾",不稳定——后轮先到极限。<b>中性转向</b>:转弯半径恰好等于预期。稳态下由前后轮侧抗刚度决定: Cf&lt;Cr → US, Cf&gt;Cr → OS。详见<b>第2课</b>~'},
    {k:'稳定系数|K|稳定性因数',
     a:'<b>稳定系数 K</b>(式2-21):K = m/(L²) × (a/Cr - b/Cf)。K&gt;0 → 不足转向(稳定); K&lt;0 → 过度转向(不稳定); K=0 → 中性转向。K越大,车越"推头"但越稳。详见<b>第2课</b>~'},
    {k:'临界车速|不稳定|失控',
     a:'<b>临界车速 Vcr</b>(式2-27):Vcr = L/√(-K)。只有过度转向(K&lt;0)的车才有临界车速——超过这个速度,横摆响应会发散,车变得不稳定。不足转向的车没有临界车速限制。详见<b>第2课</b>~'},
    {k:'横摆|yaw|绕竖直轴',
     a:'<b>横摆(r)</b>是车绕竖直轴的旋转角速度,单位 rad/s。你打方向盘时,车绕竖直轴"转头"就是横摆。横摆角速度的响应特性(快不快、稳不稳)是评价操控性的核心指标。详见<b>第2课</b>~'},

    // ---- 第3课:瞬态响应 ----
    {k:'固有频率|natural frequency|wn|omega',
     a:'<b>固有频率 ωn</b>(式2-30):描述车"想多快回应"的本事。ωn越高,车的横摆响应越快、越跟手。它由轮胎侧偏刚度、车辆质量、轴距等决定。详见<b>第3课</b>~'},
    {k:'阻尼比|damping|zeta|过冲',
     a:'<b>阻尼比 ζ</b>(式2-30):描述车"稳不稳得住"。ζ太小→过冲、来回晃(发晃); ζ合适→一步到位(跟手); ζ太大→响应迟钝(发飘)。工程师要的是ωn高+ζ合适。详见<b>第3课</b>~'},
    {k:'共振|resonance|频率响应|峰值',
     a:'<b>横摆角速度频率响应</b>有个<b>共振峰 fy</b>。以不同频率晃方向盘时,在fy附近响应被放大——峰越高,车在那个频率上越"神经质"。峰值增益比与阻尼、稳定系数K都有关。想又快又稳,关键做大后轮等效侧抗刚度。详见<b>第3课</b>~'},
    {k:'响应时间|tp|响应延迟',
     a:'<b>横摆率响应时间 tp</b>(式3-15):打方向到横摆率第一次到峰值的时间。tp越短,车越"跟手"。它和固有频率ωn、阻尼比ζ共同刻画瞬态响应品质。详见<b>第3课</b>~'},
    {k:'推头|甩尾|前轮.*极限|后轮.*极限',
     a:'<b>前轮先到极限</b>:你再加方向,转弯半径也不再变小,车顺着变宽的弧往外冲(推头)。<b>后轮先到极限</b>:车身侧滑角骤增,绕质心转起来,尾巴甩出去。高速快速回打→后轮容易先到;持续加大转向→前轮容易到。详见<b>第3课</b>~'},
    {k:'低摩擦|冰雪|湿滑|水膜|abs|tcs',
     a:'干燥路面轮胎接地力有富裕;但冰雪/湿滑路面摩擦系数骤降,摩擦圆变小又变挤。<b>水膜效应</b>:高速时水膜变厚,接地力急速下降。应对:<b>ABS</b>(防抱死)、<b>TCS</b>(防打滑)、<b>稳定控制系统</b>(施加横摆力矩+减速)帮你把车留在还能动的范围里。详见<b>第3课</b>~'},

    // ---- 第4课:转向系统 ----
    {k:'转向系统|方向盘|转向.*两件事',
     a:'转向系统管两件事:(1)把你的意图变成<b>前轮转角</b>(转向响应);(2)通过<b>转向反作用力</b>(路感)告诉你极限在哪。两者缺一不可。详见<b>第4课</b>~'},
    {k:'路感|road feel|转向力|反馈',
     a:'<b>路感</b>是轮胎侧向力通过转向系统传回方向盘的力。三个来源(4.1.3节):(1)主销后倾拖距tp产生的回正力矩;(2)轮胎拖距rτ;(3)转向系统本身的摩擦和弹性。路感清楚=你知道轮胎还剩多少余量。详见<b>第4课</b>~'},
    {k:'主销后倾|caster|回正|拖距',
     a:'<b>主销后倾角 τ</b>(通常2°~9°):转向轴向后倾斜,使轮胎接地中心C在转向轴投影S的后方,形成<b>后倾拖距 tp</b>。侧向力Fy在C点产生绕S的回正力矩 <b>Ts = (rτ+tp)·Fy</b>,让方向盘自动回正。极限附近tp缩小→"脱落感"。详见<b>第4课</b>~'},
    {k:'阿克曼|ackermann|内外轮',
     a:'<b>阿克曼转向</b>(4.3.1节):转弯时,内侧轮转角α要大于外侧轮转角β,因为内侧轮走的弧更小。理想阿克曼让四个轮子绕同一个瞬时中心O转动。实际车通常实现50%~70%阿克曼。详见<b>第4课</b>~'},
    {k:'脱落感|极限.*感|转向.*轻',
     a:'接近极限时,主销后倾拖距tp缩小,回正力矩减小,方向盘突然变轻——这就是<b>"脱落感"</b>。它在告诉你:轮胎快到极限了。理想的转向力特性是:从轻到重再到饱和,层次分明。详见<b>第4课</b>~'},

    // ---- 第5课:悬架 ----
    {k:'悬架|suspension|三个功能|缓冲|导向|传力',
     a:'悬架管三件事:(1)<b>缓冲</b>:隔开路面颠簸,保乘坐舒适和轮胎接地;(2)<b>导向</b>:决定车轮相对车身的姿态怎么变(束角、外倾);(3)<b>传力</b>:把轮胎的侧向力、纵向力、回正力矩传给车身。详见<b>第5课</b>~'},
    {k:'侧倾转向|roll steer|束角变化',
     a:'<b>侧倾转向</b>(5.2节):车身侧倾时,悬架几何使车轮束角改变,效果等同于这根轴"自己转了一个小角度"。后轴朝前束增大(toe-in)方向变→增强US(更稳);朝toe-out变→偏OS(更灵活)。详见<b>第5课</b>~'},
    {k:'柔性转向|compliance steer|衬套',
     a:'<b>柔性转向</b>(5.3节):悬架橡胶衬套、连杆被力压得变形,束角随之改变。分两种:侧向力柔性转向和纵向力柔性转向。这就是为什么急刹或收油入弯时转向感会变。工程师把侧倾转向+柔性转向+外倾变化折算成<b>等效侧抗刚度</b>。详见<b>第5课</b>~'},
    {k:'侧倾中心|roll center|侧倾轴',
     a:'<b>侧倾中心</b>:每根轴由悬架几何决定的一个点,车身绕它侧倾。前后侧倾中心连线=<b>侧倾轴</b>。侧倾中心越高,侧倾越小但有副作用;越低则相反。质心到侧倾轴的距离(力臂)越大,同样的侧向力压出的侧倾越大。详见<b>第5课</b>~'},
    {k:'侧倾刚度.*分配|防倾杆|稳定杆|前后.*分配',
     a:'<b>侧倾刚度前后分配</b>是改 US/OS 的最实用旋钮:加大<b>前轴</b>侧倾刚度→前轴分担更多载荷转移→前轴更亏→增强<b>不足转向</b>;加大<b>后轴</b>→偏向<b>过度转向</b>。换一根防倾杆就能改脾气,不用碰轮胎!详见<b>第5课</b>~'},
    {k:'抗前俯|anti.*dive|点头|刹车.*姿态',
     a:'<b>抗前俯率(anti-dive)</b>(式5-22):刹车时抵抗车头下扎的能力。过高会让路感变生硬。详见<b>第5课</b>~'},
    {k:'抗后仰|anti.*squat|anti.*lift|上浮|加速.*姿态',
     a:'<b>抗上浮/抗后仰率</b>(式5-23):加速时抵抗车尾下沉、车头上抬的能力。和抗前俯一样,不是越大越好——要在姿态稳和滤震柔之间取平衡。详见<b>第5课</b>~'},
    {k:'天棚|skyhook|主动悬架|active suspension',
     a:'<b>天棚阻尼(Skyhook)</b>(5.6节,式5-31~5-34):想象在车身和"天上一个固定点"之间挂了一根阻尼器,专门吸收车身起伏,却不把路面颠簸硬传进来。车身像被天空温柔"钩住",同时轮胎还能贴地——漂亮地兼顾了平稳与操控。详见<b>第5课</b>~'},
    {k:'外倾|camber|外倾角',
     a:'<b>外倾角</b>:车轮平面与垂直面的夹角。正外倾=轮子向外张,负外倾=向内收。过弯时车身侧倾会让外侧轮变成正外倾(不利),所以运动车常用负外倾来补偿。外倾变化也影响等效侧抗刚度。详见<b>第5课</b>~'},

    // ---- 第6课:4WS + 力分配 ----
    {k:'4ws|四轮转向|后轮.*转',
     a:'<b>四轮转向(4WS)</b>让后轮也会转:<b>低速逆相位</b>(后轮反着打)→转弯半径大幅缩小,窄路好掉头;<b>高速同相位</b>(后轮跟着小幅同向)→车身侧偏角变小,变道又快又稳。详见<b>第6课</b>~'},
    {k:'零侧偏角|zero sideslip|β=0',
     a:'<b>零侧偏角控制</b>(式6-18):让车身侧偏角β恒为0,车头始终指着前进方向。车"贴着"轨迹走,不再有"车头朝里、车往外飘"的错位感。这是4WS在动态品质上的高级形态。详见<b>第6课</b>~'},
    {k:'dyc|直接横摆力矩|左右.*分配|力差',
     a:'<b>直接横摆力矩控制(DYC)</b>:给外侧轮更大驱动力、内侧更小(或制动),左右力差×轮距直接产生横摆力矩 <b>M=(F右-F左)×Tr/2</b>。不靠转向、不靠侧偏,冰雪极限下也能拧正车头。车身稳定控制系统用单侧轻点刹车实现它。详见<b>第6课</b>~'},
    {k:'间接横摆|前后.*分配|油门.*转向|加速.*us|减速.*os',
     a:'<b>前后力分配=间接横摆</b>:过弯中加速→更多力压在驱动轴→侧向余量变少→偏US(推头);收油/轻刹→载荷前移→偏OS(尾巴发活)。这就是"油门也能转向",通过摩擦圆间接改变前后侧向力平衡。详见<b>第6课</b>~'},
    {k:'lsd|限滑差速器|差速器',
     a:'<b>限滑差速器(LSD)</b>:在左右驱动轮之间限制转速差,间接影响左右驱动力分配,给出一点横摆力矩效果——可以看成DYC的纯机械、被动雏形。电控DYC把这件事做得又快又准。详见<b>第6课</b>~'},
    {k:'摩擦圆.*约束|力.*分配.*极限',
     a:'所有力分配(前后、左右、4WS)都有一个共同天花板:<b>摩擦圆</b>。力再怎么分配,也不能超过每个轮胎能给的总量。这是第1课的概念贯穿全书的体现。详见<b>第6课</b>~'},

    // ---- 第7课:人车闭环 ----
    {k:'人.*车.*闭环|闭环|environment|环境.*系统',
     a:'实际行驶是<b>人—车—环境</b>组成的闭环系统:人不断观察偏差→修正方向→车响应→环境给出新偏差,如此循环。"好不好开"取决于人和车配不配,不只看车本身。详见<b>第7课</b>~'},
    {k:'预瞄|preview|注视.*距离|看远',
     a:'<b>预瞄</b>:人不是等偏差发生才反应,而是提前望向前方"注视点"。预瞄时间 <b>T = 注视距离 / 车速</b>(常规≈2秒,转弯≈1秒)。车越快越要看得远——"眼睛看远一点"的科学版本。详见<b>第7课</b>~'},
    {k:'驾驶人模型|pid|近藤|吉本|模糊|神经网络',
     a:'书中用几类模型描述驾驶人行为:(1)<b>PID型</b>(式8-1/8-2):根据偏差大小/累积/趋势打方向,带反应滞后;(2)<b>预瞄模型</b>:近藤(伪一阶)、吉本(伪二阶);(3)<b>模糊/神经网络模型</b>:刻画"说不清但很准"的经验判断。详见<b>第7课</b>~'},
    {k:'稳定极限速度|极限.*速度|好开',
     a:'<b>稳定极限速度</b>在适中预瞄时间(≈0.5秒)处取到峰值,不是单调上升。好开的车=让人容易找到匹配节奏的车。人的参数(预瞄时间T、增益K、滞后τ)和车速V共同决定闭环稳不稳。详见<b>第7课</b>~'},
    {k:'反应滞后|tau|延迟|人.*反应',
     a:'<b>反应滞后 τ</b>:人从看到偏差到动手操作之间的延迟,大约0.1~0.3秒。τ越大,闭环越容易不稳定。这就是为什么疲劳驾驶危险——反应滞后会增大。详见<b>第7课</b>~'},

    // ---- 通用问题 ----
    {k:'你好|你是|名字|叫什么|谁',
     a:'我是<b>星星人 AI 助手</b> 🍉 基于《汽车运动性能技术》这本书的内容,可以回答书中相关的技术问题~'},
    {k:'这本书|教材|书名|谁写的|作者',
     a:'《<b>汽车运动性能技术</b>》是日本汽车技术协会「汽车技术经典书系」第4分册,原书名《自動車の運動性能向上技術》。主编<b>安部正人、大沢洋</b>。全书8章,从轮胎力学讲到人—车闭环。本站7课覆盖了全部核心内容~'},
    {k:'课程|一共|几课|目录|大纲',
     a:'本站共<b>7课</b>,覆盖全书8章:<br>1️⃣ 轮胎(力源)<br>2️⃣ 二自由度(转弯)<br>3️⃣ 瞬态响应(快不快/晃不晃)<br>4️⃣ 转向系统(路感/回正)<br>5️⃣ 悬架(侧倾/分配)<br>6️⃣ 4WS+力分配(主动技术)<br>7️⃣ 人—车闭环(收尾)<br>前7章造车,第8章交给人~'},
    {k:'公式|equation|数学',
     a:'书中关键公式:<br>· 摩擦圆: √(Fx²+Fy²) ≤ μFz<br>· 稳定系数: K = m/(L²)(a/Cr - b/Cf)<br>· 回正力矩: Ts = (rτ+tp)·Fy<br>· DYC力矩: M = (F右-F左)×Tr/2<br>· 预瞄时间: T = 注视距离/车速<br>想看具体推导,请翻阅对应课程~'},
    {k:'谢谢|感谢|thanks|多谢',
     a:'不客气!继续问我吧~ 😊 有问题随时找我 🍉'},
    {k:'再见|拜拜|bye',
     a:'拜拜~ 🍉 记得去上课哦!首页就有~'},
  ];

  function mockReply(q){
    q = q.toLowerCase().replace(/[？?！!。，,\s]+/g,' ');

    // 优先匹配:更长的关键词优先
    var best = null, bestLen = 0;
    for(var i=0; i<KB.length; i++){
      var patterns = KB[i].k.split('|');
      for(var j=0; j<patterns.length; j++){
        if(q.indexOf(patterns[j]) !== -1 && patterns[j].length > bestLen){
          best = KB[i]; bestLen = patterns[j].length;
        }
      }
    }
    if(best) return best.a;

    // 模糊匹配:按课号
    if(q.match(/第?1|第一/)) return'第1课讲<b>轮胎</b>——唯一的力源。摩擦圆、侧偏角、侧偏刚度是核心概念。详见<b>第1课</b>~';
    if(q.match(/第?2|第二/)) return'第2课讲<b>二自由度模型</b>——车怎么转弯。不足/过度/中性转向、稳定系数K。详见<b>第2课</b>~';
    if(q.match(/第?3|第三/)) return'第3课讲<b>瞬态响应</b>——快不快、晃不晃。固有频率、阻尼比、频率响应共振峰。详见<b>第3课</b>~';
    if(q.match(/第?4|第四/)) return'第4课讲<b>转向系统</b>——路感从哪来。主销后倾、回正力矩、阿克曼。详见<b>第4课</b>~';
    if(q.match(/第?5|第五/)) return'第5课讲<b>悬架</b>——四个轮子怎么装。侧倾转向、侧倾刚度分配、Skyhook。详见<b>第5课</b>~';
    if(q.match(/第?6|第六/)) return'第6课讲<b>4WS+力分配</b>——让车更听话。低速逆相/高速同相、DYC、LSD。详见<b>第6课</b>~';
    if(q.match(/第?7|第七|收尾/)) return'第7课讲<b>人—车闭环</b>——最后一环是你。预瞄、驾驶人模型、稳定极限速度。详见<b>第7课</b>~';

    return'好问题!我暂时没有精确匹配的答案,但本站 7 课覆盖了全书核心内容,建议翻阅对应章节~<br><br>💡 你可以问我:<br>· 摩擦圆公式<br>· 不足转向和过度转向的区别<br>· 悬架怎么影响操控<br>· 4WS原理<br>· 预瞄时间是什么';
  }
})();
