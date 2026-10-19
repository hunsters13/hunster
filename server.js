const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  
  let html = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>HUNSTER - Enterprise Traffic & Slot Operations</title>
  <link href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css" rel="stylesheet">
  <style>
    :root {
      --bg-body: #f8fafc; --bg-card: #ffffff; --border: #e2e8f0; --border-subtle: #f1f5f9;
      --text-main: #0f172a; --text-sub: #64748b; --primary: #2563eb; --primary-hover: #1d4ed8;
      --primary-light: #eff6ff; --success: #059669; --success-bg: #ecfdf5; --warning-bg: #fffbeb; --warning-text: #d97706;
      --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05); --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.07); --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.08);
    }
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Pretendard', sans-serif; scroll-behavior: smooth; }
    body { background-color: var(--bg-body); color: var(--text-main); line-height: 1.6; word-break: keep-all; }
    header { height: 80px; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; padding: 0 40px; background: rgba(255, 255, 255, 0.95); position: sticky; top: 0; z-index: 100; box-shadow: var(--shadow-sm); }
    .logo-area { display: flex; align-items: center; gap: 10px; font-weight: 800; font-size: 1.15rem; color: #0f172a; text-decoration: none; cursor: pointer; }
    .logo-icon { width: 34px; height: 34px; background: var(--primary); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; font-weight: 800; }
    .nav-links { display: flex; gap: 24px; align-items: center; }
    .nav-links a { text-decoration: none; color: var(--text-sub); font-weight: 600; font-size: 0.9rem; cursor: pointer; }
    .nav-links a:hover { color: var(--primary); }
    .header-right { display: flex; gap: 12px; align-items: center; }
    .lang-select { padding: 8px 12px; border-radius: 8px; border: 1px solid var(--border); background: white; font-size: 0.88rem; font-weight: 700; color: var(--text-main); outline: none; cursor: pointer; }
    .auth-actions { display: flex; gap: 8px; align-items: center; }
    .btn { padding: 8px 16px; border-radius: 8px; font-size: 0.88rem; font-weight: 600; cursor: pointer; border: 1px solid var(--border); background: white; color: var(--text-main); white-space: nowrap; }
    .btn-primary { background: var(--primary); border-color: var(--primary); color: white; }
    .page-view { display: none; }
    .page-view.active { display: block; }
    .wrapper { max-width: 1200px; margin: 0 auto; padding: 40px 20px; display: flex; flex-direction: column; gap: 60px; }
    .hero { text-align: center; padding: 40px 0; }
    .hero-badge { display: inline-block; background: var(--primary-light); color: var(--primary); padding: 6px 14px; border-radius: 20px; font-size: 0.82rem; font-weight: 700; margin-bottom: 16px; }
    .hero h1 { font-size: 2.5rem; font-weight: 800; color: #0f172a; line-height: 1.25; margin-bottom: 16px; }
    .hero p { font-size: 1.05rem; color: var(--text-sub); max-width: 700px; margin: 0 auto 28px auto; }
    .metrics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 20px; }
    .metric-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: 16px; padding: 24px; box-shadow: var(--shadow-md); position: relative; overflow: hidden; }
    .metric-card::before { content: ''; position: absolute; top: 0; left: 0; width: 4px; height: 100%; background: var(--primary); }
    .metric-title { font-size: 0.88rem; font-weight: 700; color: var(--text-sub); margin-bottom: 8px; }
    .metric-value { font-size: 2rem; font-weight: 800; color: #0f172a; }
    .metric-footer { font-size: 0.82rem; color: var(--success); font-weight: 600; margin-top: 8px; }
    .status-section-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
    .card-box { background: var(--bg-card); border: 1px solid var(--border); border-radius: 16px; padding: 28px; box-shadow: var(--shadow-md); }
    .card-box h3 { font-size: 1.2rem; font-weight: 800; margin-bottom: 16px; }
    .server-status-item { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid var(--border-subtle); font-size: 0.92rem; }
    .badge-online { background: var(--success-bg); color: var(--success); padding: 4px 10px; border-radius: 20px; font-size: 0.78rem; font-weight: 700; }
    .badge-preparing { background: var(--warning-bg); color: var(--warning-text); padding: 4px 10px; border-radius: 20px; font-size: 0.78rem; font-weight: 700; }
    .pricing-section { background: var(--bg-card); border: 1px solid var(--border); border-radius: 20px; padding: 36px; box-shadow: var(--shadow-lg); }
    .pricing-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-top: 24px; }
    .price-card { background: var(--bg-body); border: 1px solid var(--border); border-radius: 14px; padding: 24px; display: flex; flex-direction: column; justify-content: space-between; }
    .price-card.featured { border-color: var(--primary); background: var(--primary-light); }
    .price-title { font-size: 1.1rem; font-weight: 800; margin-bottom: 6px; }
    .price-desc { font-size: 0.88rem; color: var(--text-sub); margin-bottom: 16px; }
    .price-tag { font-size: 1.6rem; font-weight: 800; color: var(--primary); margin-bottom: 16px; }
    .price-tag span { font-size: 0.85rem; color: var(--text-sub); font-weight: 500; text-decoration: line-through; margin-left: 6px; }
    .auth-container { max-width: 550px; margin: 40px auto; background: var(--bg-card); border: 1px solid var(--border); border-radius: 20px; padding: 36px; box-shadow: var(--shadow-lg); }
    .auth-container h2 { font-size: 1.6rem; font-weight: 800; margin-bottom: 6px; color: #0f172a; }
    .auth-container p { color: var(--text-sub); font-size: 0.9rem; margin-bottom: 24px; }
    .form-grid { display: grid; grid-template-columns: 1fr; gap: 16px; }
    .form-group { display: flex; flex-direction: column; gap: 6px; }
    .form-label { font-size: 0.88rem; font-weight: 700; color: #334155; }
    .form-input, .form-select { width: 100%; padding: 12px 16px; border: 1px solid var(--border); border-radius: 10px; font-size: 0.95rem; background: #fafafa; outline: none; color: #0f172a; font-weight: 500; }
    .sub-option-box { background: var(--primary-light); border: 1px solid #bfdbfe; padding: 16px; border-radius: 12px; margin-top: 8px; display: none; }
    .dashboard-container { max-width: 1100px; margin: 30px auto; padding: 0 16px; overflow-x: auto; }
    .data-table { width: 100%; border-collapse: collapse; margin-top: 16px; background: white; border-radius: 12px; overflow: hidden; border: 1px solid var(--border); min-width: 600px; }
    .data-table th, .data-table td { padding: 14px 16px; text-align: left; border-bottom: 1px solid var(--border); font-size: 0.9rem; }
    .data-table th { background: var(--border-subtle); color: var(--text-sub); font-size: 0.8rem; font-weight: 700; }
    footer { text-align: center; padding: 40px 0; color: var(--text-sub); font-size: 0.85rem; border-top: 1px solid var(--border); background: white; margin-top: 30px; }
    @media (max-width: 768px) {
      header { padding: 0 16px; height: 70px; }
      .nav-links { display: none; }
      .hero h1 { font-size: 1.9rem; }
      .hero p { font-size: 0.95rem; }
      .status-section-grid, .pricing-grid { grid-template-columns: 1fr; }
      .wrapper { padding: 20px 14px; gap: 40px; }
      .auth-container, .card-box, .pricing-section { padding: 20px 16px; }
    }
  </style>
  <script>
    const translations = {
      ko: {
        navHome: "홈", navStatus: "실시간 현황", navPricing: "요금제",
        btnLogin: "로그인", btnRegister: "회원가입",
        heroBadge: "⚡ PREMIUM TRAFFIC & SLOT SOLUTION",
        heroTitle: "쿠팡 상위노출을 위한<br>압도적인 실시간 트래픽 솔루션",
        heroDesc: "안정적인 프록시 분산 서버와 지능형 슬롯 관리 시스템으로 비즈니스의 한계를 뛰어넘으세요.",
        heroBtn: "지금 바로 회원가입 하기",
        metric1Title: "전국 훈스터 파트너 총 슬롯 유치량", metric1Val: "882 슬롯 가동중", metric1Foot: "↑ 전국 각지 파트너 실시간 트래픽 유입 중",
        metric2Title: "서버 시스템 안정성", metric2Val: "99.98%", metric2Foot: "Stable (무중단 24시간 모니터링)",
        metric3Title: "평균 트래픽 응답 속도", metric3Val: "24ms", metric3Foot: "초고속 프록시 네트워크 컨디션 유지",
        statusTitle: "📊 전국 실시간 슬롯 유치 현황",
        statusDesc: "전국적으로 훈스터에 슬롯 유치하신 분들 토대로 882 슬롯 등록 및 가동 중입니다.",
        statusTotalLabel: "전국 가동 슬롯 합계", statusTotalVal: "882 SLOT RUNNING",
        infraTitle: "🛡️ 서비스 포트폴리오 및 인프라 모니터",
        infraDesc: "쿠팡 트래픽 서비스 정상 가동 및 확장 예정 서비스 상태입니다.",
        infra1: "쿠팡 트래픽 솔루션", infra1Badge: "● 정상 가동중",
        infra2: "네이버 리워드 서비스", infra2Badge: "준비 중",
        infra3: "네이버 플레이스 솔루션", infra3Badge: "준비 중",
        pricingTitle: "💰 투명하고 합리적인 요금제 안내",
        pricingDesc: "복잡한 패키지 상품은 없습니다. 효율적인 운영을 위해 <strong>최소 5슬롯 이상</strong>부터 신청 가능합니다.",
        plan1Title: "쿠팡 트래픽 이용권 (1슬롯 단가 기준)",
        plan1Desc: "공산품 및 농산물 전용 고속 프록시 트래픽 할당 (최소 5슬롯 구매)",
        plan1Price: "55,000원", plan1Orig: "정가 60,000원", plan1Promo: "✨ 훈스터 첫 고객 특별 할인가 적용 중",
        plan1Btn: "지금 회원가입 하기",
        calcTitle: "🧮 실시간 슬롯 수량 및 세금계산기",
        calcDesc: "원하시는 슬롯 개수(최소 5개)를 입력하여 부가세 포함/미포함 금액을 확인하세요.",
        calcLabel: "신청할 슬롯 개수 입력 (최소 5슬롯)",
        supplyText: "공급가액 (세금 미포함):", vatText: "부가세 (VAT 10%):", totalText: "총 결제 금액 (세금 포함):",
        calcBtn: "선택 수량으로 가입하기"
      },
      en: {
        navHome: "Home", navStatus: "Live Status", navPricing: "Pricing",
        btnLogin: "Login", btnRegister: "Register",
        heroBadge: "⚡ PREMIUM TRAFFIC & SLOT SOLUTION",
        heroTitle: "Unmatched Real-Time Traffic Solution<br>for Coupang Top Rankings",
        heroDesc: "Push the limits of your business with stable proxy distribution servers and intelligent slot management.",
        heroBtn: "Register Now",
        metric1Title: "Total Hunster Partner Active Slots", metric1Val: "882 Slots Running", metric1Foot: "↑ Real-time traffic flowing nationwide",
        metric2Title: "Server System Stability", metric2Val: "99.98%", metric2Foot: "Stable (24/7 Uninterrupted Monitoring)",
        metric3Title: "Avg Traffic Response Speed", metric3Val: "24ms", metric3Foot: "High-speed proxy network condition maintained",
        statusTitle: "📊 Nationwide Real-Time Slot Status",
        statusDesc: "Based on partners across the country, 882 slots are registered and currently running.",
        statusTotalLabel: "Nationwide Active Slots Total", statusTotalVal: "882 SLOT RUNNING",
        infraTitle: "🛡️ Service Portfolio & Infrastructure Monitor",
        infraDesc: "Coupang traffic service operational and upcoming expansion status.",
        infra1: "Coupang Traffic Solution", infra1Badge: "● Operational",
        infra2: "Naver Reward Service", infra2Badge: "Coming Soon",
        infra3: "Naver Place Solution", infra3Badge: "Coming Soon",
        pricingTitle: "💰 Transparent & Reasonable Pricing",
        pricingDesc: "No complex packages. Available from a <strong>minimum of 5 slots</strong> for efficient operation.",
        plan1Title: "Coupang Traffic Pass (Per Slot)",
        plan1Desc: "Dedicated high-speed proxy traffic for industrial & agricultural goods (Min. 5 slots)",
        plan1Price: "55,000 KRW", plan1Orig: "Regular 60,000 KRW", plan1Promo: "✨ First-time customer special discount applied",
        plan1Btn: "Register Now",
        calcTitle: "🧮 Real-Time Slot & Tax Calculator",
        calcDesc: "Enter desired slots (min. 5) to check amounts with/without VAT.",
        calcLabel: "Enter Slot Count (Min. 5)",
        supplyText: "Supply Price (Excl. Tax):", vatText: "VAT (10%):", totalText: "Total Amount (Incl. VAT):",
        calcBtn: "Register with Selected Quantity"
      },
      zh: {
        navHome: "首页", navStatus: "实时状态", navPricing: "价格方案",
        btnLogin: "登录", btnRegister: "注册",
        heroBadge: "⚡ PREMIUM TRAFFIC & SLOT SOLUTION",
        heroTitle: "助力Coupang排名的<br>卓越实时流量解决方案",
        heroDesc: "通过稳定的代理分发服务器和智能槽位管理系统，突破业务极限。",
        heroBtn: "立即注册",
        metric1Title: "全国合作伙伴总槽位进驻量", metric1Val: "882个槽位运行中", metric1Foot: "↑ 全国各地合作伙伴实时流量引入中",
        metric2Title: "服务器系统稳定性", metric2Val: "99.98%", metric2Foot: "Stable (24小时不间断监控)",
        metric3Title: "平均流量响应速度", metric3Val: "24ms", metric3Foot: "维持超高速代理网络状态",
        statusTitle: "📊 全国实时槽位进驻状态",
        statusDesc: "根据全国各地伙伴的进驻情况，已有882个槽位注册并运行中。",
        statusTotalLabel: "全国运行槽位合计", statusTotalVal: "882 SLOT RUNNING",
        infraTitle: "🛡️ 服务组合与基础设施监控",
        infraDesc: "Coupang流量服务正常运行及扩展预定服务状态。",
        infra1: "Coupang流量解决方案", infra1Badge: "● 正常运行",
        infra2: "Naver奖励服务", infra2Badge: "筹备中",
        infra3: "Naver地点解决方案", infra3Badge: "筹备中",
        pricingTitle: "💰 透明合理的定价指南",
        pricingDesc: "没有复杂的套餐。为了高效运营，<strong>最少可申请5个槽位以上</strong>。",
        plan1Title: "Coupang流量通行证（单槽位基准）",
        plan1Desc: "工业品及农产品专用高速代理流量分配（最少购买5个槽位）",
        plan1Price: "55,000韩元", plan1Orig: "原价 60,000韩元", plan1Promo: "✨ 适用首位客户特惠折扣",
        plan1Btn: "立即注册",
        calcTitle: "🧮 实时槽位数量及税费计算器",
        calcDesc: "输入您想要的槽位数量（最少5个），确认含税/不含税金额。",
        calcLabel: "输入申请槽位数量（最少5槽）",
        supplyText: "供应价（不含税）：", vatText: "增值税（VAT 10%）：", totalText: "总结算金额（含税）：",
        calcBtn: "以所选数量注册"
      },
      ja: {
