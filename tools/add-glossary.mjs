import { readFileSync, writeFileSync } from 'fs';

const qa = JSON.parse(readFileSync('assets/qa-database.json', 'utf-8'));

const glossary = [
  // === 基本符号 ===
  {q:"δf代表什么",a:"δf=前轮转角(Front Wheel Steer Angle)。你打方向盘,通过转向系统传到前轮的角度。是二自由度模型的输入。",lesson:2,tags:["δf","前轮转角","转向角","steer angle"]},
  {q:"δr代表什么",a:"δr=后轮转角(Rear Wheel Steer Angle)。主动后轮转向系统可以控制δr。四轮转向(4WS)的核心就是同时控制δf和δr。",lesson:2,tags:["δr","后轮转角","四轮转向","4WS"]},
  {q:"α代表什么",a:"α=侧偏角(Slip Angle)。轮胎平面与实际运动方向之间的夹角。αf是前轮侧偏角,αr是后轮侧偏角。侧偏角产生侧向力,是车辆转弯的基础。",lesson:2,tags:["α","侧偏角","slip angle","前轮侧偏角"]},
  {q:"αf代表什么",a:"αf=前轮侧偏角。前轮轮胎平面与前轮实际运动方向的夹角。前轮侧偏角大于后轮时,车表现为不足转向(推头)。",lesson:2,tags:["αf","前轮侧偏角"]},
  {q:"αr代表什么",a:"αr=后轮侧偏角。后轮轮胎平面与后轮实际运动方向的夹角。后轮侧偏角大于前轮时,车表现为过度转向(甩尾)。",lesson:2,tags:["αr","后轮侧偏角"]},
  {q:"β代表什么",a:"β=质心侧偏角(Sideslip Angle)。车身质心实际运动方向与车头朝向之间的夹角。β大说明车身在横着滑,是失控的前兆。闭环控制的目标之一就是把β控制在小范围内。",lesson:2,tags:["β","质心侧偏角","sideslip angle","车身侧滑"]},
  {q:"γ代表什么",a:"γ=外倾角(Camber Angle)。轮胎平面与地面法线之间的夹角。正外倾=轮胎顶部向外倾斜。外倾角影响轮胎接地印迹和侧向力,是悬架定位的重要参数。",lesson:4,tags:["γ","外倾角","camber"]},
  {q:"ω代表什么",a:"ω=横摆角速度(Yaw Rate)。车身绕竖直轴旋转的角速度,单位rad/s。你转弯时车身转多快就是ω。和r同义。",lesson:2,tags:["ω","横摆角速度","yaw rate"]},

  // === 质量和几何 ===
  {q:"m代表什么",a:"m=整车质量(Vehicle Mass)。二自由度模型里的m是整车质量,单位kg。m越大→惯性越大→转向响应越慢。",lesson:2,tags:["m","质量","mass","整车质量","车重"]},
  {q:"V代表什么",a:"V=车速(Vehicle Speed)。二自由度模型的核心参数之一。V增大→稳态横摆增益变化→US/OS特性改变。V的临界值决定稳定性极限。",lesson:2,tags:["V","车速","speed","速度"]},
  {q:"l代表什么",a:"l=轴距(Wheelbase)。前轴到后轴的距离。l越大→转弯半径越大→灵活性降低但直线稳定性提高。l=lf+lr。",lesson:2,tags:["l","轴距","wheelbase"]},
  {q:"lf代表什么",a:"lf=前轴到质心的距离。lf/(lf+lr)就是前轴载荷分配比。lf越大→质心越靠后→前轴载荷小→更容易不足转向。",lesson:2,tags:["lf","前悬长","前轴到质心距离"]},
  {q:"lr代表什么",a:"lr=后轴到质心的距离。lr越大→质心越靠前→后轴载荷小→更容易过度转向。lf+lr=l(轴距)。",lesson:2,tags:["lr","后悬长","后轴到质心距离"]},
  {q:"Tr代表什么",a:"Tr=轮距(Track Width)。左右车轮之间的距离。轮距影响侧倾力矩和载荷转移。Tr越大→侧倾力矩越大→侧倾越大。",lesson:4,tags:["Tr","轮距","track width"]},
  {q:"h代表什么",a:"h=质心高度(Center of Gravity Height)。质心离地面的高度。h越大→转弯时载荷转移越大→轮胎更容易达到极限。降低质心是操控的基础。",lesson:3,tags:["h","质心高度","重心高度","CG height"]},

  // === 轮胎力学 ===
  {q:"Kf代表什么",a:"Kf=前轴侧偏刚度(Cornering Stiffness)。前轮产生单位侧偏角时能给出多大的侧向力。Kf越大→前轮抓地力越强→更不容易推头。",lesson:2,tags:["Kf","前轴侧偏刚度","前轮cornering stiffness"]},
  {q:"Kr代表什么",a:"Kr=后轴侧偏刚度。后轮产生单位侧偏角时能给出多大的侧向力。Kr越大→后轮越不容易侧滑→更不容易甩尾。Kf和Kr的比值决定US/OS倾向。",lesson:2,tags:["Kr","后轴侧偏刚度","后轮cornering stiffness"]},
  {q:"Cα是什么",a:"Cα=轮胎侧偏刚度(Tire Cornering Stiffness)。单个轮胎的侧偏刚度,单位N/rad。Cα=∂Fy/∂α,是侧偏力曲线在原点处的斜率。Cα越大→轮胎对侧偏角的响应越灵敏。",lesson:2,tags:["Cα","侧偏刚度","cornering stiffness","轮胎刚度"]},
  {q:"Fy代表什么",a:"Fy=侧向力(Lateral Force)。轮胎在垂直于滚动方向上产生的力,是车辆转弯的向心力来源。Fy=Cα×α(线性区)。Fy受限于摩擦圆:√(Fx²+Fy²)≤μFz。",lesson:2,tags:["Fy","侧向力","lateral force"]},
  {q:"Fx代表什么",a:"Fx=纵向力(Longitudinal Force)。轮胎在滚动方向上产生的力,包括驱动力(加速)和制动力(刹车)。Fx和Fy共享摩擦圆,一个大了另一个就小。",lesson:2,tags:["Fx","纵向力","longitudinal force"]},
  {q:"Fz代表什么",a:"Fz=垂直载荷(Vertical Load)。地面对轮胎的法向反力,等于轮胎承受的重量。转弯时外轮Fz增大、内轮Fz减小(载荷转移)。Fz影响摩擦圆半径:μFz。",lesson:3,tags:["Fz","垂直载荷","vertical load"]},
  {q:"μ代表什么",a:"μ=路面摩擦系数(Friction Coefficient)。轮胎与路面之间能产生的最大摩擦力与垂直载荷的比值。干燥沥青≈0.8~1.0,湿滑≈0.3~0.5,结冰≈0.1。μ越小→摩擦圆越小→越容易打滑。",lesson:2,tags:["μ","摩擦系数","friction coefficient"]},

  // === 刚度和力矩 ===
  {q:"Kroll代表什么",a:"Kroll=侧倾刚度(Roll Stiffness)。车身每产生单位侧倾角所需的力矩。Kroll越大→车身越不容易侧倾→操控越好。Kroll=弹簧刚度×力臂²+防倾杆刚度。",lesson:4,tags:["Kroll","侧倾刚度","roll stiffness"]},
  {q:"Ts代表什么",a:"Ts=回正力矩(Aligning Torque)。转弯时让方向盘自动回正到直线位置的力矩。Ts=(rτ+tp)×Fy,其中rτ是轮胎拖距,tp是主销后倾拖距。",lesson:2,tags:["Ts","回正力矩","aligning torque"]},
  {q:"rτ代表什么",a:"rτ=轮胎拖距(Pneumatic Trail)。轮胎侧向力合力作用点到轮胎中心的距离。侧偏角增大时rτ减小,到极限时rτ接近零→方向盘变轻→警告你快到极限了。",lesson:2,tags:["rτ","轮胎拖距","pneumatic trail"]},
  {q:"tp代表什么",a:"tp=主销后倾拖距(Mechanical Trail)。转向轴(主销)在轮胎接地中心后面的水平距离。由主销后倾角κ产生。tp让方向盘有回正力矩,是操控稳定性的基础。",lesson:2,tags:["tp","主销后倾拖距","mechanical trail"]},
  {q:"K代表什么",a:"K=稳定系数(Stability Factor),也叫不足转向梯度。K>0→不足转向(稳),K<0→过度转向(灵),K=0→中性转向。完整公式:K=−(m/(2l²))×(lf×Kf−lr×Kr)/(Kf×Kr)。",lesson:2,tags:["K","稳定系数","stability factor","不足转向梯度"]},
  {q:"SM代表什么",a:"SM=静态余量(Static Margin)。质心到中性转向点NSP的距离与轴距的比值。SM>0→不足转向,SM<0→过度转向。SM越大→越稳定但越不灵活。",lesson:2,tags:["SM","静态余量","static margin"]},

  // === 悬架参数 ===
  {q:"κ代表什么",a:"κ=主销后倾角(Caster Angle)。转向轴(主销)在侧视图上向后倾斜的角度。κ产生主销后倾拖距tp,让方向盘有回正力矩。κ越大→回正力矩越大→方向盘越重。",lesson:2,tags:["κ","主销后倾角","caster angle"]},
  {q:"前束角是什么",a:"前束角(Toe):左右车轮前端之间的距离与后端之间的距离之差。前束(Toe-in):前端更窄;后束(Toe-out):前端更宽。前束影响直线稳定性和转向响应。",lesson:4,tags:["前束角","Toe","前束","后束"]},

  // === 驾驶人模型 ===
  {q:"预瞄距离D代表什么",a:"D=预瞄距离(Preview Distance)。驾驶人注视点到车辆当前位置的距离。D≈V×T,其中T是预瞄时间。车速越快→预瞄越远→提前量越大。",lesson:6,tags:["预瞄距离","D","preview distance"]},
  {q:"预瞄时间T代表什么",a:"T=预瞄时间(Preview Time)。驾驶人看到路面信息到到达该位置的时间。T=D/V。常规驾驶≈2秒,转弯≈1秒。T有最优值,太短振荡,太长反应不及时。",lesson:6,tags:["预瞄时间","T","preview time"]},
  {q:"τ代表什么",a:"τ=反应滞后(Reaction Delay)。人从看到偏差到动手操作之间的延迟,约0.1~0.3秒。τ越大→闭环越容易不稳定。疲劳、酒后会增大τ。",lesson:6,tags:["τ","反应滞后","reaction delay"]},
  {q:"Kp代表什么",a:"Kp=预瞄增益(Preview Gain)。驾驶人对偏差的反应强度。Kp太大→过度修正→振荡;Kp太小→修正不够→偏差积累。需要和车的响应特性匹配。",lesson:6,tags:["Kp","预瞄增益","preview gain"]},

  // === 其他重要符号 ===
  {q:"r代表什么",a:"r=横摆角速度(Yaw Rate)。和ω同义,单位rad/s。二自由度模型的核心输出。稳态公式:r=[1/(1+K×V²)]×(V/l)×δf。",lesson:2,tags:["r","横摆角速度","yaw rate"]},
  {q:"Iz代表什么",a:"Iz=绕z轴的转动惯量(Moment of Inertia about Z-axis)。车身绕竖直轴旋转的惯性。Iz越大→横摆响应越慢→转向迟钝但稳定。",lesson:2,tags:["Iz","转动惯量","moment of inertia"]},
  {q:"NSP代表什么",a:"NSP=中性转向点(Neutral Steer Point)。前后轴侧偏刚度贡献刚好平衡的点。质心在NSP之前→US,在NSP之后→OS。NSP的位置决定车辆的转向特性。",lesson:2,tags:["NSP","中性转向点","neutral steer point"]},
  {q:"ESC是什么",a:"ESC=电子稳定控制系统(Electronic Stability Control)。通过单轮制动产生横摆力矩来修正不足转向或过度转向。ESC=ABS+TCS+横摆控制。",lesson:5,tags:["ESC","电子稳定控制","stability control"]},
  {q:"ABS是什么",a:"ABS=防抱死制动系统(Anti-lock Braking System)。刹车时防止车轮抱死,保持轮胎在摩擦圆内工作。ABS让你在紧急刹车时还能打方向。",lesson:5,tags:["ABS","防抱死","anti-lock"]},
  {q:"TCS是什么",a:"TCS=牵引力控制系统(Traction Control System)。加速时防止驱动轮打滑。检测到驱动轮空转时减小发动机输出或对打滑轮制动。",lesson:5,tags:["TCS","牵引力控制","traction control"]},
  {q:"ωn代表什么",a:"ωn=固有频率(Natural Frequency)。二自由度模型瞬态响应的特征频率。ωn越大→响应越快但可能振荡。ωn=√((Cαf+Cαr)/(m×V))。",lesson:2,tags:["ωn","固有频率","natural frequency"]},
  {q:"ζ代表什么",a:"ζ=阻尼比(Damping Ratio)。瞬态响应衰减快慢的指标。ζ>1→过阻尼(迟钝);ζ<1→欠阻尼(振荡);ζ=1→临界阻尼(最优)。通常车的ζ≈0.2~0.4。",lesson:2,tags:["ζ","阻尼比","damping ratio"]},
  {q:"ΔFz代表什么",a:"ΔFz=载荷转移量。转弯时外轮增加、内轮减少的垂直载荷。ΔFz=m×a×h/Tr,其中a是侧向加速度,h是质心高度,Tr是轮距。h越小→ΔFz越小→操控越好。",lesson:3,tags:["ΔFz","载荷转移","load transfer"]},

  // === 补充关键公式条目 ===
  {q:"侧偏角的公式是什么",a:"αf=δf−(ω×lf+Vy)/V, αr=−(ω×lr−Vy)/V。其中δf是前轮转角,ω是横摆角速度,Vy是质心侧向速度,V是车速。简化:αf≈δf−(lf/V)×r, αr≈(lr/V)×r。",lesson:2,tags:["侧偏角公式","αf公式","αr公式","slip angle formula"]},
  {q:"侧向力和侧偏角的关系是什么",a:"线性区:Fy=Cα×α。非线性区:Fy=μFz×sin(arctan(Cα×α/(μFz)))。侧偏角小→力和角度成正比;侧偏角大→力趋向饱和μFz。这就是轮胎的摩擦圆限制。",lesson:2,tags:["侧偏力公式","Fy和α关系","侧偏特性","轮胎力学公式"]},
  {q:"载荷转移的完整公式是什么",a:"前轴:ΔFf=(m×a×h/L)×(Kφf/(Kφf+Kφr))。后轴:ΔFr=(m×a×h/L)×(Kφr/(Kφf+Kφr))。其中Kφf/Kφr是前后侧倾刚度,L是轴距,a是侧向加速度。",lesson:3,tags:["载荷转移公式","ΔFf公式","ΔFr公式","前后载荷转移公式"]},
  {q:"稳态横摆增益的公式是什么",a:"r/δf=[1/(1+K×V²)]×(V/l)。其中K是稳定系数,V是车速,l是轴距。K>0时增益随V减小(越来越推),K<0时增益随V增大(越来越甩)。",lesson:2,tags:["稳态横摆增益公式","增益公式","r/δf公式","横摆增益"]},
  {q:"稳定系数K的完整公式",a:"K=−(m/(2l²))×(lf×Kf−lr×Kr)/(Kf×Kr)。其中m是整车质量,l是轴距,lf/lr是质心到前后轴距离,Kf/Kr是前后轴侧偏刚度。K>0不足转向,K<0过度转向。",lesson:2,tags:["K的公式","稳定系数公式","不足转向梯度公式"]},
  {q:"固有频率ωn的公式是什么",a:"ωn=√((Cαf+Cαr)/(m×V))。Cαf和Cαr是前后轮侧偏刚度,m是整车质量,V是车速。车速越快→固有频率越低→响应越慢。",lesson:2,tags:["固有频率公式","ωn公式","特征频率公式"]},
  {q:"阻尼比ζ的公式是什么",a:"ζ=(m×V)/(2×√((Cαf+Cαr)×m×V))×(a²×Cαf+b²×Cαr)/(Iz)。简化:ζ取决于质量分配、侧偏刚度分配和转动惯量。",lesson:2,tags:["阻尼比公式","ζ公式","damping ratio formula"]},
  {q:"摩擦圆的公式是什么",a:"√(Fx²+Fy²)≤μ×Fz。Fx是纵向力,Fy是侧向力,μ是摩擦系数,Fz是垂直载荷。加速或刹车时(Fx大),可用于转弯的力(Fy)就小了。这就是油门也能转向的原因。",lesson:2,tags:["摩擦圆公式","摩擦圆","friction circle","轮胎极限"]},
  {q:"回正力矩的公式是什么",a:"Ts=(rτ+tp)×Fy。rτ是轮胎拖距,tp是主销后倾拖距,Fy是侧向力。侧偏角增大→rτ减小→Ts减小→方向盘变轻。",lesson:2,tags:["回正力矩公式","Ts公式","aligning torque formula"]},
];

qa.push(...glossary);
writeFileSync('assets/qa-database.json', JSON.stringify(qa, null, 2), 'utf-8');
console.log('Added', glossary.length, 'variable definition entries');
console.log('Total entries:', qa.length);
