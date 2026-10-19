const http = require('http');

const htmlContent = `<!DOCTYPE html>
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
    .logo-area { display: flex; align-items: center; gap: 14px; text-decoration: none; cursor: pointer; }
    .logo-icon { width: 42px; height: 42px; background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%); border-radius: 12px; display: flex; align-items: center; justify-content: center; color: white; font-weight: 900; font-size: 1.4rem; box-shadow: 0 0 20px rgba(37, 99, 235, 0.5); animation: pulseGlow 2s infinite ease-in-out; }
    @keyframes pulseGlow { 0% { transform: scale(1); box-shadow: 0 0 10px rgba(37, 99, 235, 0.4); } 50% { transform: scale(1.05); box-shadow: 0 0 22px rgba(37, 99, 235, 0.8); } 100% { transform: scale(1); box-shadow: 0 0 10px rgba(37, 99, 235, 0.4); } }
    .logo-text-box { display: flex; flex-direction: column; }
    .logo-main-title { font-weight: 900; font-size: 1.25rem; letter-spacing: -0.5px; background: linear-gradient(90deg, #0f172a 0%, #2563eb 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .logo-sub-title { font-size: 0.7rem; font-weight: 700; color: var(--primary); letter-spacing: 1.5px; text-transform: uppercase; }
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
        navHome: "ホーム", navStatus: "リアルタイム状況", navPricing: "料金プラン",
        btnLogin: "ログイン", btnRegister: "会員登録",
        heroBadge: "⚡ PREMIUM TRAFFIC & SLOT SOLUTION",
        heroTitle: "Coupang上位露出的ための<br>圧倒的なリアルタイムトラフィックソリューション",
        heroDesc: "安定したプロキシ分散サーバーと知的スロット管理システムでビジネスの限界を超えましょう。",
        heroBtn: "今すぐ会員登録する",
        metric1Title: "全国フンスターパートナー総スロット誘致量", metric1Val: "882スロット稼働中", metric1Foot: "↑ 全国各地のパートナーリアルタイムトラフィック流入中",
        metric2Title: "サーバーシステム安定性", metric2Val: "99.98%", metric2Foot: "Stable (24時間無停止モニタリング)",
        metric3Title: "平均トラフィック応答速度", metric3Val: "24ms", metric3Foot: "超高速プロキシネットワークコンディション維持",
        statusTitle: "📊 全国リアルタイムスロット誘致状況",
        statusDesc: "全国のパートナー様の実績に基づき、882スロットが登録され稼働中です。",
        statusTotalLabel: "全国稼働スロット合計", statusTotalVal: "882 SLOT RUNNING",
        infraTitle: "🛡️ サービスポートフォリオ＆インフラモニター",
        infraDesc: "Coupangトラフィックサービス正常稼働および拡張予定サービスのステータスです。",
        infra1: "Coupangトラフィックソリューション", infra1Badge: "● 正常稼働中",
        infra2: "Naverリワードサービス", infra2Badge: "準備中",
        infra3: "Naverプレイスソリューション", infra3Badge: "準備中",
        pricingTitle: "💰 透明で合理的な料金プランのご案内",
        pricingDesc: "複雑なパッケージ商品はありません。効率的な運営のため<strong>最小5スロット以上</strong>からお申し込み可能です。",
        plan1Title: "Coupangトラフィック利用権（1スロット単価基準）",
        plan1Desc: "工業製品および農産物専用高速プロキシトラフィック割り当て（最小5スロット購入）",
        plan1Price: "55,000ウォン", plan1Orig: "定価 60,000ウォン", plan1Promo: "✨ フンスター初回お客様特別割引適用中",
        plan1Btn: "今すぐ会員登録する",
        calcTitle: "🧮 リアルタイムスロット数量および税金計算機",
        calcDesc: "ご希望のスロット数（最小5個）を入力し、税込/税抜金額をご確認ください。",
        calcLabel: "申請するスロット数入力（最小5スロット）",
        supplyText: "供給価額（税抜）：", vatText: "付加価値税（VAT 10%）：", totalText: "総決済金額（税込）：",
        calcBtn: "選択数量で登録する"
      }
    };
    function changeLanguage(lang) {
      const t = translations[lang] || translations.ko;
      document.getElementById('nav-home').innerText = t.navHome;
      document.getElementById('nav-status').innerText = t.navStatus;
      document.getElementById('nav-pricing').innerText = t.navPricing;
      document.getElementById('btn-login').innerText = t.btnLogin;
      document.getElementById('btn-register').innerText = t.btnRegister;
      document.getElementById('hero-badge').innerText = t.heroBadge;
      document.getElementById('hero-title').innerHTML = t.heroTitle;
      document.getElementById('hero-desc').innerText = t.heroDesc;
      document.getElementById('hero-btn').innerText = t.heroBtn;
      document.getElementById('m1-title').innerText = t.metric1Title;
      document.getElementById('m1-val').innerText = t.metric1Val;
      document.getElementById('m1-foot').innerText = t.metric1Foot;
      document.getElementById('m2-title').innerText = t.metric2Title;
      document.getElementById('m2-val').innerText = t.metric2Val;
      document.getElementById('m2-foot').innerText = t.metric2Foot;
      document.getElementById('m3-title').innerText = t.metric3Title;
      document.getElementById('m3-val').innerText = t.metric3Val;
      document.getElementById('m3-foot').innerText = t.metric3Foot;
      document.getElementById('st-title').innerText = t.statusTitle;
      document.getElementById('st-desc').innerText = t.statusDesc;
      document.getElementById('st-tot-label').innerText = t.statusTotalLabel;
      document.getElementById('st-tot-val').innerText = t.statusTotalVal;
      document.getElementById('inf-title').innerText = t.infraTitle;
      document.getElementById('inf-desc').innerText = t.infraDesc;
      document.getElementById('inf1-name').innerText = t.infra1; document.getElementById('inf1-badge').innerText = t.infra1Badge;
      document.getElementById('inf2-name').innerText = t.infra2; document.getElementById('inf2-badge').innerText = t.infra2Badge;
      document.getElementById('inf3-name').innerText = t.infra3; document.getElementById('inf3-badge').innerText = t.infra3Badge;
      document.getElementById('pr-title').innerText = t.pricingTitle;
      document.getElementById('pr-desc').innerHTML = t.pricingDesc;
      document.getElementById('p1-title').innerText = t.plan1Title;
      document.getElementById('p1-desc').innerText = t.plan1Desc;
      document.getElementById('p1-price').innerHTML = t.plan1Price + ' <span>' + t.plan1Orig + '</span>';
      document.getElementById('p1-promo').innerText = t.plan1Promo;
      document.getElementById('p1-btn').innerText = t.plan1Btn;
      document.getElementById('calc-title').innerText = t.calcTitle;
      document.getElementById('calc-desc').innerText = t.calcDesc;
      document.getElementById('calc-label').innerText = t.calcLabel;
      document.getElementById('supply-text').innerText = t.supplyText;
      document.getElementById('vat-text-lbl').innerText = t.vatText;
      document.getElementById('total-text-lbl').innerText = t.totalText;
      document.getElementById('calc-btn').innerText = t.calcBtn;
    }
    function switchView(viewId) {
      document.querySelectorAll('.page-view').forEach(el => el.classList.remove('active'));
      document.getElementById(viewId).classList.add('active');
      window.scrollTo(0, 0);
    }
    function handleServiceChange(select) {
      const subBox = document.getElementById('coupang-sub-option');
      subBox.style.display = (select.value === 'coupang') ? 'block' : 'none';
    }
    function calculatePrice(input) {
      let count = parseInt(input.value) || 5;
      if (count < 5) count = 5;
      const supplyPrice = count * 55000;
      const vat = Math.round(supplyPrice * 0.1);
      const totalPrice = supplyPrice + vat;
      document.getElementById('supply-price-text').innerText = supplyPrice.toLocaleString() + '원';
      document.getElementById('vat-text').innerText = vat.toLocaleString() + '원';
      document.getElementById('total-price-text').innerText = totalPrice.toLocaleString() + '원';
    }
    function initStorage() {
      if (!localStorage.getItem('hunster_users')) {
        const initialUsers = [
          { name: '김철수', id: 'kim123', pw: '1234', phone: '010-9876-5432', address: '서울시 강남구 테헤란로 456', service: '쿠팡 트래픽 (공산품)', slots: 5 },
          { name: '이영희', id: 'lee456', pw: '1234', phone: '010-1112-2233', address: '경기도 성남시 분당구 판교로 789', service: '쿠팡 트래픽 (농산물)', slots: 5 }
        ];
        localStorage.setItem('hunster_users', JSON.stringify(initialUsers));
      }
      const calcInput = document.getElementById('slot-calc-input');
      if (calcInput) calculatePrice(calcInput);
    }
    window.onload = initStorage;
    function handleRegister(event) {
      event.preventDefault();
      const name = document.getElementById('reg-name').value;
      const id = document.getElementById('reg-id').value;
      const pw = document.getElementById('reg-pw').value;
      const phone = document.getElementById('reg-phone').value;
      const address = document.getElementById('reg-address').value;
      const coupangSub = document.getElementById('coupang-sub-select').value;
      const slotCount = parseInt(document.getElementById('reg-slots').value) || 5;
      if (slotCount < 5) { alert('슬롯은 최소 5개 이상부터 신청 가능합니다.'); return; }
      let serviceStr = '쿠팡 트래픽 (' + (coupangSub === 'industrial' ? '공산품' : '농산물') + ')';
      let users = JSON.parse(localStorage.getItem('hunster_users') || '[]');
      if(users.some(u => u.id === id)) { alert('이미 존재하는 아이디입니다.'); return; }
      users.push({ name, id, pw, phone, address, service: serviceStr, slots: slotCount });
      localStorage.setItem('hunster_users', JSON.stringify(users));
      alert('회원가입이 완료되었습니다!');
      switchView('view-login');
    }
    let loginFailCount = 0;
    function handleLogin(event) {
      event.preventDefault();
      const inputId = document.getElementById('login-id').value.trim();
      const inputPw = document.getElementById('login-pw').value.trim();
      if (inputId === 'hun1' && inputPw === '1234') {
        loginFailCount = 0;
        loadAdminTable();
        switchView('view-admin');
        return;
      }
      let users = JSON.parse(localStorage.getItem('hunster_users') || '[]');
      let foundUser = users.find(u => u.id === inputId && u.pw === inputPw);
      if (foundUser) {
        loginFailCount = 0;
        document.getElementById('my-name').innerText = foundUser.name + ' 파트너님';
        document.getElementById('my-phone').innerText = foundUser.phone;
        document.getElementById('my-address').innerText = foundUser.address;
        document.getElementById('my-service').innerText = foundUser.service;
        document.getElementById('my-slots').innerText = foundUser.slots + ' 슬롯 활성 가동 중';
        switchView('view-user-dashboard');
      } else {
        loginFailCount++;
        let remaining = 5 - loginFailCount;
        if (remaining <= 0) { alert('로그인 5회 실패로 계정이 차단되었습니다.'); }
        else { alert('아이디 또는 비밀번호가 일치하지 않습니다. (남은 시도: ' + remaining + '회)'); }
      }
    }
    function loadAdminTable() {
      let users = JSON.parse(localStorage.getItem('hunster_users') || '[]');
      let tbody = document.getElementById('admin-user-tbody');
      tbody.innerHTML = '';
      users.forEach(u => {
        let tr = document.createElement('tr');
        tr.innerHTML = '<td><strong>' + u.name + '</strong> (' + u.id + ')</td><td>' + u.phone + '</td><td>' + u.address + '</td><td><span style="color: var(--primary); font-weight: 700;">' + u.service + '</span></td><td><strong style="color: var(--success);">' + u.slots + ' 슬롯</strong></td>';
        tbody.appendChild(tr);
      });
    }
  </script>
</head>
<body>
  <header>
    <a class="logo-area" onclick="switchView('view-main')">
      <div class="logo-icon">H</div>
      <div class="logo-text-box">
        <span class="logo-main-title">HUNSTER</span>
        <span class="logo-sub-title">TRAFFIC NETWORK</span>
      </div>
    </a>
    <div class="nav-links">
      <a id="nav-home" onclick="switchView('view-main')">홈</a>
      <a id="nav-status" onclick="switchView('view-main'); location.hash='#status';">실시간 현황</a>
      <a id="nav-pricing" onclick="switchView('view-main'); location.hash='#pricing';">요금제</a>
    </div>
    <div class="header-right">
      <select class="lang-select" onchange="changeLanguage(this.value)">
        <option value="ko" selected>🇰🇷 한국어</option>
        <option value="en">🇺🇸 English</option>
        <option value="zh">🇨🇳 中文</option>
        <option value="ja">🇯🇵 日本語</option>
      </select>
      <div class="auth-actions">
        <button id="btn-login" class="btn" onclick="switchView('view-login')">로그인</button>
        <button id="btn-register" class="btn btn-primary" onclick="switchView('view-register')">회원가입</button>
      </div>
    </div>
  </header>

  <div id="view-main" class="page-view active">
    <div class="wrapper">
      <section class="hero">
        <span id="hero-badge" class="hero-badge">⚡ PREMIUM TRAFFIC & SLOT SOLUTION</span>
        <h1 id="hero-title">쿠팡 상위노출을 위한<br>압도적인 실시간 트래픽 솔루션</h1>
        <p id="hero-desc">안정적인 프록시 분산 서버와 지능형 슬롯 관리 시스템으로 비즈니스의 한계를 뛰어넘으세요.</p>
        <button id="hero-btn" class="btn btn-primary" style="padding: 14px 30px; font-size: 1rem;" onclick="switchView('view-register')">지금 바로 회원가입 하기</button>
      </section>

      <section class="metrics-grid">
        <div class="metric-card">
          <div id="m1-title" class="metric-title">전국 훈스터 파트너 총 슬롯 유치량</div>
          <div id="m1-val" class="metric-value">882 슬롯 가동중</div>
          <div id="m1-foot" class="metric-footer">↑ 전국 각지 파트너 실시간 트래픽 유입 중</div>
        </div>
        <div class="metric-card" style="--primary: #059669;">
          <div id="m2-title" class="metric-title">서버 시스템 안정성</div>
          <div id="m2-val" class="metric-value">99.98%</div>
          <div id="m2-foot" class="metric-footer">Stable (무중단 24시간 모니터링)</div>
        </div>
        <div class="metric-card" style="--primary: #7c3aed;">
          <div id="m3-title" class="metric-title">평균 트래픽 응답 속도</div>
          <div id="m3-val" class="metric-value">24ms</div>
          <div id="m3-foot" class="metric-footer">초고속 프록시 네트워크 컨디션 유지</div>
        </div>
      </section>

      <section id="status" class="status-section-grid">
        <div class="card-box">
          <h3 id="st-title">📊 전국 실시간 슬롯 유치 현황</h3>
          <p id="st-desc" style="color: var(--text-sub); font-size: 0.9rem; margin-top: 6px;">전국적으로 훈스터에 슬롯 유치하신 분들 토대로 882 슬롯 등록 및 가동 중입니다.</p>
          <div style="margin-top: 20px; padding: 16px; background: var(--bg-body); border-radius: 10px; border: 1px solid var(--border);">
            <span id="st-tot-label" style="font-size: 0.85rem; color: var(--text-sub); font-weight: 700; display: block; margin-bottom: 4px;">전국 가동 슬롯 합계</span>
            <span id="st-tot-val" style="font-size: 1.6rem; font-weight: 800; color: var(--primary);">882 SLOT RUNNING</span>
          </div>
        </div>
        <div class="card-box">
          <h3 id="inf-title">🛡️ 서비스 포트폴리오 및 인프라 모니터</h3>
          <p id="inf-desc" style="color: var(--text-sub); font-size: 0.9rem; margin-top: 6px;">쿠팡 트래픽 서비스 정상 가동 및 확장 예정 서비스 상태입니다.</p>
          <div style="margin-top: 16px;">
            <div class="server-status-item"><span id="inf1-name" style="font-weight: 600;">쿠팡 트래픽 솔루션</span><span id="inf1-badge" class="badge-online">● 정상 가동중</span></div>
            <div class="server-status-item"><span id="inf2-name" style="font-weight: 600;">네이버 리워드 서비스</span><span id="inf2-badge" class="badge-preparing">준비 중</span></div>
            <div class="server-status-item"><span id="inf3-name" style="font-weight: 600;">네이버 플레이스 솔루션</span><span id="inf3-badge" class="badge-preparing">준비 중</span></div>
          </div>
        </div>
      </section>

      <section id="pricing" class="pricing-section">
        <div class="section-header" style="margin-bottom: 20px;">
          <h2 id="pr-title">💰 투명하고 합리적인 요금제 안내</h2>
          <p id="pr-desc" style="font-size: 0.92rem; color: var(--text-sub);">복잡한 패키지 상품은 없습니다. 효율적인 운영을 위해 <strong>최소 5슬롯 이상</strong>부터 신청 가능합니다.</p>
        </div>
        <div class="pricing-grid">
          <div class="price-card">
            <div>
              <div id="p1-title" class="price-title">쿠팡 트래픽 이용권 (1슬롯 단가 기준)</div>
              <div id="p1-desc" class="price-desc">공산품 및 농산물 전용 고속 프록시 트래픽 할당 (최소 5슬롯 구매)</div>
              <div id="p1-price" class="price-tag">55,000원 <span>정가 60,000원</span></div>
              <p id="p1-promo" style="font-size: 0.82rem; color: var(--success); font-weight: 700; margin-bottom: 16px;">✨ 훈스터 첫 고객 특별 할인가 적용 중</p>
            </div>
            <button id="p1-btn" class="btn btn-primary" style="width: 100%;" onclick="switchView('view-register')">지금 회원가입 하기</button>
          </div>
          <div class="price-card featured">
            <div>
              <div id="calc-title" class="price-title">🧮 실시간 슬롯 수량 및 세금계산기</div>
              <div id="calc-desc" class="price-desc">원하시는 슬롯 개수(최소 5개)를 입력하여 부가세 포함/미포함 금액을 확인하세요.</div>
              <div style="margin: 12px 0;">
                <label id="calc-label" class="form-label" style="margin-bottom: 4px; display: block;">신청할 슬롯 개수 입력 (최소 5슬롯)</label>
                <input type="number" id="slot-calc-input" class="form-input" value="5" min="5" oninput="calculatePrice(this)" style="background: white;">
              </div>
              <div style="background: white; padding: 12px; border-radius: 8px; border: 1px solid var(--border); font-size: 0.88rem; display: flex; flex-direction: column; gap: 6px; margin-top: 12px;">
                <div style="display: flex; justify-content: space-between; color: var(--text-sub);">
                  <span id="supply-text">공급가액 (세금 미포함):</span>
                  <span id="supply-price-text" style="font-weight: 600; color: var(--text-main);">275,000원</span>
                </div>
                <div style="display: flex; justify-content: space-between; color: var(--text-sub);">
                  <span id="vat-text-lbl">부가세 (VAT 10%):</span>
                  <span id="vat-text" style="font-weight: 600; color: var(--text-main);">27,500원</span>
                </div>
                <div style="border-top: 1px solid var(--border); padding-top: 6px; display: flex; justify-content: space-between; align-items: center; font-weight: 700;">
                  <span id="total-text-lbl" style="color: var(--text-main);">총 결제 금액 (세금 포함):</span>
                  <span id="total-price-text" style="font-size: 1.15rem; color: var(--primary);">302,500원</span>
                </div>
              </div>
            </div>
            <button id="calc-btn" class="btn btn-primary" style="width: 100%; margin-top: 16px;" onclick="switchView('view-register')">선택 수량으로 가입하기</button>
          </div>
        </div>
      </section>
    </div>
  </div>

  <div id="view-login" class="page-view">
    <div class="auth-container">
      <h2>로그인</h2>
      <p>등록하신 아이디와 비밀번호를 입력해주세요.</p>
      <form onsubmit="handleLogin(event)">
        <div class="form-grid">
          <div class="form-group">
            <label class="form-label">아이디</label>
            <input type="text" id="login-id" class="form-input" placeholder="아이디를 입력하세요" required>
          </div>
          <div class="form-group">
            <label class="form-label">비밀번호</label>
            <input type="password" id="login-pw" class="form-input" placeholder="비밀번호를 입력하세요" required>
          </div>
        </div>
        <div style="margin-top: 24px;">
          <button type="submit" class="btn btn-primary" style="width: 100%; padding: 12px; font-size: 1rem;">로그인</button>
        </div>
        <div style="margin-top: 16px; text-align: center; font-size: 0.88rem; color: var(--text-sub);">
          아직 계정이 없으신가요? <a style="color: var(--primary); font-weight: 700; cursor: pointer;" onclick="switchView('view-register')">회원가입하기</a>
        </div>
      </form>
    </div>
  </div>

  <div id="view-register" class="page-view">
    <div class="auth-container" style="max-width: 600px;">
      <h2>파트너 회원가입</h2>
      <p>직접 계정을 생성하고 트래픽 슬롯 서비스를 시작하세요. (최소 5슬롯 이상 신청 가능)</p>
      <form onsubmit="handleRegister(event)">
        <div class="form-grid" style="gap: 14px;">
          <div class="form-group">
            <label class="form-label">대표자 성명</label>
            <input type="text" id="reg-name" class="form-input" placeholder="성함을 입력하세요" required>
          </div>
          <div class="form-group">
            <label class="form-label">사용할 아이디</label>
            <input type="text" id="reg-id" class="form-input" placeholder="로그인용 아이디 입력" required>
          </div>
          <div class="form-group">
            <label class="form-label">비밀번호</label>
            <input type="password" id="reg-pw" class="form-input" placeholder="비밀번호 입력" required>
          </div>
          <div class="form-group">
            <label class="form-label">연락처 (전화번호)</label>
            <input type="tel" id="reg-phone" class="form-input" placeholder="010-0000-0000" required>
          </div>
          <div class="form-group">
            <label class="form-label">사업장 또는 수령 주소</label>
            <input type="text" id="reg-address" class="form-input" placeholder="도로명 주소를 상세히 입력하세요" required>
          </div>
          <div class="form-group">
            <label class="form-label">이용 희망 서비스 구분</label>
            <select id="service-type" class="form-select" onchange="handleServiceChange(this)" required>
              <option value="">-- 서비스 종류를 선택해 주세요 --</option>
              <option value="coupang">쿠팡 트래픽</option>
            </select>
            <div id="coupang-sub-option" class="sub-option-box">
              <label class="form-label" style="color: #1e40af; margin-bottom: 6px; display: block;">🔍 [쿠팡 트래픽 상세 설정] 상품군 선택</label>
              <select id="coupang-sub-select" class="form-select" style="background: white;">
                <option value="industrial">공산품</option>
                <option value="agricultural">농산물</option>
              </select>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">신청할 초기 슬롯 수량 (최소 5개)</label>
            <input type="number" id="reg-slots" class="form-input" value="5" min="5" required>
          </div>
        </div>
        <div style="margin-top: 28px; display: flex; gap: 10px;">
          <button type="button" class="btn" style="flex: 1; padding: 12px;" onclick="switchView('view-main')">취소</button>
          <button type="submit" class="btn btn-primary" style="flex: 2; padding: 12px; font-size: 0.95rem;">회원가입 완료</button>
        </div>
      </form>
    </div>
  </div>

  <div id="view-admin" class="page-view">
    <div class="dashboard-container">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <div>
          <h2>🛡️ 관리자 통합 관제 센터</h2>
          <p style="color: var(--text-sub); font-size: 0.9rem;">가입된 모든 파트너 회원의 정보를 실시간 확인합니다.</p>
        </div>
        <button class="btn" onclick="switchView('view-main')">로그아웃</button>
      </div>
      <table class="data-table">
        <thead>
          <tr>
            <th>성명 및 아이디</th>
            <th>전화번호</th>
            <th>사업장 주소</th>
            <th>서비스 및 상품군</th>
            <th>유치 슬롯량</th>
          </tr>
        </thead>
        <tbody id="admin-user-tbody"></tbody>
      </table>
    </div>
  </div>

  <div id="view-user-dashboard" class="page-view">
    <div class="dashboard-container">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <div>
          <h2 id="my-name">파트너님</h2>
          <p style="color: var(--text-sub); font-size: 0.9rem;">본인 계정의 신청 정보 및 실시간 트래픽 슬롯 가동 현황입니다.</p>
        </div>
        <button class="btn" onclick="switchView('view-main')">로그아웃</button>
      </div>
      <div class="card-box" style="background: white; margin-bottom: 30px;">
        <h3 style="margin-bottom: 16px;">📋 내 파트너 가입 정보</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; font-size: 0.92rem;">
