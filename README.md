# 🚗 星星人讲运动学

> 一套面向"只会开车的小白"的汽车运动性能课程 —— 从你开车的真实感觉出发,把《汽车运动性能技术》一本书讲通。

## 🌐 在线阅读(GitHub Pages)

**➡️ https://jugaolin.github.io/vehicle-dynamics-course-xingxingren-motion-/**

站点是一套共享设计、互相链接的 HTML 讲义(含原创插图、亮/暗主题):

| 页面 | 说明 |
|---|---|
| [首页 `index.html`](index.html) | 课程总览与目录 |
| [全书框架 `framework.html`](framework.html) | 一条"人—车—环境"运动链 + 全书真实目录(8 章)|
| [课程表 `syllabus.html`](syllabus.html) | 教学方法 + 7 节课安排 |
| [第 1 课 `lessons/lesson-01-tires.html`](lessons/lesson-01-tires.html) | 轮胎特性:侧偏角→侧向力 · 抓地力极限 · 摩擦圆 |
| [第 2 课 `lessons/lesson-02-2dof.html`](lessons/lesson-02-2dof.html) | 平面二自由度模型 · 不足/过度/中性转向 · 稳定系数 K · 临界车速 · 为什么 US 才稳定 |
| [第 3 课 `lessons/lesson-03-response.html`](lessons/lesson-03-response.html) | 瞬态响应:固有频率/阻尼 · 横摆角速度频率响应与共振峰 · 极限(前后轮谁先到)· 低摩擦路面 |
| [第 4 课 `lessons/lesson-04-steering.html`](lessons/lesson-04-steering.html) | 转向系统两件事 · 路感/回正力矩与主销后倾拖距 · 理想转向力 · 阿克曼 · 主销后倾角 |
| [第 5 课 `lessons/lesson-05-suspension.html`](lessons/lesson-05-suspension.html) | 悬架三功能 · 侧倾转向/柔性转向/等效侧抗刚度 · 侧倾中心与侧倾轴 · 侧倾刚度分配改 US/OS · 抗前俯/抗上浮 · 主动悬架 Skyhook |
| [第 6 课 `lessons/lesson-06-active.html`](lessons/lesson-06-active.html) | 4WS(低速逆相位/高速同相位/零侧偏角)· 前后分配=间接横摆 · 左右分配=DYC 直接横摆力矩 · LSD · 摩擦圆约束 |
| [第 7 课 `lessons/lesson-07-human.html`](lessons/lesson-07-human.html) | 人—车—环境闭环 · 驾驶人模型(PID/预瞄/模糊/神经网络)· 预瞄时间 · 闭环稳定性与稳定极限速度 · 收尾:这台车好不好开 |

> `docs/` 下另存有早期的纯 Markdown 版讲义,便于在 GitHub 上直接浏览;线上 HTML 站点为主。

## 🧭 一句话总纲

> 轮胎是唯一的力源(受**摩擦圆**约束)→ 前后/左右怎么**分配这些力**,决定了车的横摆与侧移响应(**二自由度模型**)→ 转向、悬架、4WS、驱动/制动控制都只是**调节这个响应的旋钮** → 最后必须把车交给"人",在**人—车闭环**里检验能不能开得稳。**前 7 章造车,第 8 章把车交给人。**

## ℹ️ 关于本仓库

- **性质**:个人学习笔记 / 教学讲义。所有讲解为本人用自己的语言组织,插图按书中概念**原创重绘**,**未复制原书图片或成段原文**。
- **原则**:只依据《汽车运动性能技术》(主编 安部正人、大沢洋)内容,**不与外部资料对比、不扩展**。
- **触发语**(在对话里):`星星人讲运动学`。

> 版权提示:原书受著作权保护。本仓库仅作个人学习之用,不含原书扫描件、图表原图或成段原文。
