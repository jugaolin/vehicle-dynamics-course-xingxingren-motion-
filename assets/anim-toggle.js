/* anim-toggle.js — 动画手动开关(无视系统 prefers-reduced-motion) */
(function(){
  var KEY='anim-mode'; // 'on'|'off'|null
  var html=document.documentElement;
  var btn=document.getElementById('animToggle');
  if(!btn) return;

  function apply(mode){
    if(mode==='on'){html.setAttribute('data-anim','on');btn.textContent='⏸ 静图';btn.classList.add('on')}
    else if(mode==='off'){html.setAttribute('data-anim','off');btn.textContent='▶ 动图';btn.classList.remove('on')}
    else{html.removeAttribute('data-anim');/* 回退到系统设置 */
      /* 检测系统偏好来决定按钮文案 */
      var sysOff=window.matchMedia('(prefers-reduced-motion:reduce)').matches;
      btn.textContent=sysOff?'▶ 开启动画':'⏸ 关闭动画';
      btn.classList.remove('on');
    }
  }

  // 初始化:读 localStorage
  var saved=null;
  try{saved=localStorage.getItem(KEY)}catch(e){}
  apply(saved);

  btn.addEventListener('click',function(){
    var cur=html.getAttribute('data-anim');
    var next;
    if(cur==='on') next='off';
    else if(cur==='off') next='on';
    else{
      /* 从系统默认出发:如果系统是reduce则切到on,否则切到off */
      var sysOff=window.matchMedia('(prefers-reduced-motion:reduce)').matches;
      next=sysOff?'on':'off';
    }
    apply(next);
    try{localStorage.setItem(KEY,next)}catch(e){}
  });
})();
