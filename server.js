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
    footer { text-align: center; padding: 30px 20px; color: var(--text-sub); font-size: 0.85rem; border-top: 1px solid var(--border); background: white; margin-top: 30px; line-height: 1.8; }
    @media (max-width: 768px) {
      header { padding: 0 16px; height: 70px; }
      .nav-links { display: none; }
      .hero h1 { font-size: 1.9rem; }
      .status-section-grid, .pricing-grid { grid-template-columns: 1fr; }
    }
  </style>
  <script>
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
    window.onload = function() {
      if (!localStorage.getItem('hunster_users')) {
        localStorage.setItem('hunster_users', JSON.stringify([
          { name: '김철수', id: 'kim123', pw: '1234', phone: '010-9876-5432', address: '서울시 강남구 테헤란로 456', service: '쿠팡 트래픽 (공산품)', slots: 5 }
        ]));
      }
      calculatePrice(document.getElementById('slot-calc-input'));
    };
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
      let users = JSON.parse(localStorage.getItem('hunster_users') || '[]');
      if(users.some(u => u.id === id)) { alert('이미 존재하는 아이디입니다.'); return; }
      users.push({ name, id, pw, phone, address, service: '쿠팡 트래픽 (' + (coupangSub === 'industrial' ? '공산품' : '농산물') + ')', slots: slotCount });
      localStorage.setItem('hunster_users', JSON.stringify(users));
      alert('회원가입이 완료되었습니다!');
      switchView('view-login');
    }
    function handleLogin(event) {
      event.preventDefault();
      const inputId = document.getElementById('login-id').value.trim();
      const inputPw = document.getElementById('login-pw').value.trim();
      if (inputId === 'hun1' && inputPw === '1234') {
        let users = JSON.parse(localStorage.getItem('hunster_users') || '[]');
        let tbody = document.getElementById('admin-user-tbody');
        tbody.innerHTML = '';
        users.forEach(u => {
          tbody.innerHTML += '<tr><td><strong>' + u.name + '</strong> (' + u.id + ')</td><td>' + u.phone + '</td><td>' + u.address + '</td><td><span style="color:var(--primary);font-weight:700;">' + u.service + '</span></td><td><strong style="color:var(--success);">' + u.slots + ' 슬롯</strong></td></tr>';
        });
        switchView('view-admin');
        return;
      }
      let users = JSON.parse(localStorage.getItem('hunster_users') || '[]');
      let foundUser = users.find(u => u.id === inputId && u.pw === inputPw);
      if (foundUser) {
        document.getElementById('my-name').innerText = foundUser.name + ' 파트너님';
        document.getElementById('my-phone').innerText = foundUser.phone;
        document.getElementById('my-address').innerText = foundUser.address;
        document.getElementById('my-service').innerText = foundUser.service;
        document.getElementById('my-slots').innerText = foundUser.slots + ' 슬롯 활성 가동 중';
        switchView('view-user-dashboard');
      } else {
        alert('아이디 또는 비밀번호가 일치하지 않습니다.');
      }
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
      <a onclick="switchView('view-main')">홈</a>
      <a onclick="switchView('view-main')">실시간 현황</a>
      <a onclick="switchView('view-main')">요금제</a>
    </div>
    <div class="header-right">
      <div class="auth-actions">
        <button class="btn" onclick="switchView('view-login')">로그인</button>
        <button class="btn btn-primary" onclick="switchView('view-register')">회원가입</button>
      </div>
    </div>
  </header>

  <div id="view-main" class="page-view active">
    <div class="wrapper">
      <section class="hero">
        <span class="hero-badge">⚡ PREMIUM TRAFFIC & SLOT SOLUTION</span>
        <h1>쿠팡 상위노출을 위한<br>압도적인 실시간 트래픽 솔루션</h1>
        <p>안정적인 프록시 분산 서버와 지능형 슬롯 관리 시스템으로 비즈니스의 한계를 뛰어넘으세요.</p>
        <button class="btn btn-primary" style="padding: 14px 30px; font-size: 1rem;" onclick="switchView('view-register')">지금 바로 회원가입 하기</button>
      </section>

      <section class="metrics-grid">
        <div class="metric-card">
          <div class="metric-title">전국 훈스터 파트너 총 슬롯 유치량</div>
          <div class="metric-value">882 슬롯 가동중</div>
          <div class="metric-footer">↑ 전국 각지 파트너 실시간 트래픽 유입 중</div>
        </div>
        <div class="metric-card" style="--primary: #059669;">
          <div class="metric-title">서버 시스템 안정성</div>
          <div class="metric-value">99.98%</div>
          <div class="metric-footer">Stable (무중단 24시간 모니터링)</div>
        </div>
        <div class="metric-card" style="--primary: #7c3aed;">
          <div class="metric-title">평균 트래픽 응답 속도</div>
          <div class="metric-value">24ms</div>
          <div class="metric-footer">초고속 프록시 네트워크 컨디션 유지</div>
        </div>
      </section>

      <section class="status-section-grid">
        <div class="card-box">
          <h3>📊 전국 실시간 슬롯 유치 현황</h3>
          <p style="color: var(--text-sub); font-size: 0.9rem; margin-top: 6px;">전국적으로 훈스터에 슬롯 유치하신 분들 토대로 882 슬롯 등록 및 가동 중입니다.</p>
          <div style="margin-top: 20px; padding: 16px; background: var(--bg-body); border-radius: 10px; border: 1px solid var(--border);">
            <span style="font-size: 0.85rem; color: var(--text-sub); font-weight: 700; display: block; margin-bottom: 4px;">전국 가동 슬롯 합계</span>
            <span style="font-size: 1.6rem; font-weight: 800; color: var(--primary);">882 SLOT RUNNING</span>
          </div>
        </div>
        <div class="card-box">
          <h3>🛡️ 서비스 포트폴리오 및 인프라 모니터</h3>
          <p style="color: var(--text-sub); font-size: 0.9rem; margin-top: 6px;">쿠팡 트래픽 서비스 정상 가동 및 확장 예정 서비스 상태입니다.</p>
          <div style="margin-top: 16px;">
            <div class="server-status-item"><span style="font-weight: 600;">쿠팡 트래픽 솔루션</span><span class="badge-online">● 정상 가동중</span></div>
            <div class="server-status-item"><span style="font-weight: 600;">네이버 리워드 서비스</span><span style="color: var(--warning-text); font-weight: 700; font-size: 0.78rem;">준비 중</span></div>
            <div class="server-status-item"><span style="font-weight: 600;">네이버 플레이스 솔루션</span><span style="color: var(--warning-text); font-weight: 700; font-size: 0.78rem;">준비 중</span></div>
          </div>
        </div>
      </section>

      <section class="pricing-section">
        <div style="margin-bottom: 20px;">
          <h2>💰 투명하고 합리적인 요금제 안내</h2>
