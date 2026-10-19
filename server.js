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
      --danger-bg: #fef2f2; --danger-text: #dc2626;
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
    
    .mobile-menu-btn { display: none; background: none; border: none; font-size: 1.5rem; cursor: pointer; color: var(--text-main); }
    .mobile-nav { display: none; position: absolute; top: 80px; left: 0; width: 100%; background: white; border-bottom: 1px solid var(--border); padding: 20px; flex-direction: column; gap: 16px; box-shadow: var(--shadow-md); }
    .mobile-nav.active { display: flex; }

    .btn { padding: 8px 16px; border-radius: 8px; font-size: 0.88rem; font-weight: 600; cursor: pointer; border: 1px solid var(--border); background: white; color: var(--text-main); white-space: nowrap; transition: 0.2s; }
    .btn:hover { background: #f1f5f9; }
    .btn-primary { background: var(--primary); border-color: var(--primary); color: white; }
    .btn-primary:hover { background: var(--primary-hover); }
    
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
    
    .guide-section { background: var(--bg-card); border: 1px solid var(--border); border-radius: 20px; padding: 36px; box-shadow: var(--shadow-lg); }
    .guide-section h2 { font-size: 1.5rem; font-weight: 800; margin-bottom: 12px; color: #0f172a; }
    .guide-section p { color: var(--text-sub); font-size: 0.95rem; margin-bottom: 24px; line-height: 1.7; }
    .guide-table { width: 100%; border-collapse: collapse; margin: 20px 0; background: white; border-radius: 12px; overflow: hidden; border: 1px solid var(--border); }
    .guide-table th, .guide-table td { padding: 14px 18px; text-align: left; border-bottom: 1px solid var(--border); font-size: 0.92rem; }
    .guide-table th { background: var(--border-subtle); color: var(--text-sub); font-weight: 700; font-size: 0.85rem; }
    .logic-box { background: var(--primary-light); border: 1px solid #bfdbfe; border-radius: 14px; padding: 24px; margin-top: 24px; }
    .logic-box h4 { color: var(--primary); font-size: 1.05rem; font-weight: 800; margin-bottom: 10px; }
    .logic-box ul { padding-left: 20px; color: #334155; font-size: 0.9rem; display: flex; flex-direction: column; gap: 8px; }

    .auth-container { max-width: 550px; margin: 40px auto; background: var(--bg-card); border: 1px solid var(--border); border-radius: 20px; padding: 36px; box-shadow: var(--shadow-lg); }
    .auth-container h2 { font-size: 1.6rem; font-weight: 800; margin-bottom: 6px; color: #0f172a; }
    .auth-container p { color: var(--text-sub); font-size: 0.9rem; margin-bottom: 24px; }
    .form-grid { display: grid; grid-template-columns: 1fr; gap: 16px; }
    .form-group { display: flex; flex-direction: column; gap: 6px; }
    .form-label { font-size: 0.88rem; font-weight: 700; color: #334155; }
    .form-input, .form-select { width: 100%; padding: 12px 16px; border: 1px solid var(--border); border-radius: 10px; font-size: 0.95rem; background: #fafafa; outline: none; color: #0f172a; font-weight: 500; }
    .sub-option-box { background: var(--primary-light); border: 1px solid #bfdbfe; padding: 16px; border-radius: 12px; margin-top: 8px; display: none; }
    
    .dashboard-container { max-width: 1200px; margin: 30px auto; padding: 0 16px; }
    .data-table-wrapper { overflow-x: auto; background: white; border-radius: 12px; border: 1px solid var(--border); margin-top: 16px; }
    .data-table { width: 100%; border-collapse: collapse; min-width: 750px; }
    .data-table th, .data-table td { padding: 14px 16px; text-align: left; border-bottom: 1px solid var(--border); font-size: 0.88rem; }
    .data-table th { background: var(--border-subtle); color: var(--text-sub); font-size: 0.8rem; font-weight: 700; }
    
    .badge-status { padding: 4px 10px; border-radius: 20px; font-size: 0.75rem; font-weight: 700; cursor: pointer; border: none; }
    .status-pending { background: var(--warning-bg); color: var(--warning-text); }
    .status-complete { background: var(--success-bg); color: var(--success); }
    
    .tab-menu { display: flex; gap: 10px; margin-bottom: 20px; border-bottom: 1px solid var(--border); padding-bottom: 12px; }
    .tab-btn { padding: 8px 16px; border-radius: 8px; font-weight: 700; font-size: 0.9rem; background: white; border: 1px solid var(--border); cursor: pointer; color: var(--text-sub); }
    .tab-btn.active { background: var(--primary); color: white; border-color: var(--primary); }
    .tab-content { display: none; }
    .tab-content.active { display: block; }

    footer { text-align: center; padding: 30px 20px; color: var(--text-sub); font-size: 0.85rem; border-top: 1px solid var(--border); background: white; margin-top: 30px; }
    
    @media (max-width: 768px) {
      header { padding: 0 16px; height: 70px; }
      .nav-links, .header-right .auth-actions { display: none; }
      .mobile-menu-btn { display: block; }
      .hero h1 { font-size: 1.9rem; }
      .status-section-grid, .pricing-grid { grid-template-columns: 1fr; }
    }
  </style>
  <script>
    // 전역 계좌 정보 설정 (추후 변경 가능)
    const ACCOUNT_INFO = {
      bank: "농협은행",
      accountNumber: "301-XXXX-XXXX-XX",
      holder: "훈스터 (HUNSTER)"
    };

    function switchView(viewId) {
      document.querySelectorAll('.page-view').forEach(el => el.classList.remove('active'));
      document.getElementById(viewId).classList.add('active');
      document.getElementById('mobile-nav').classList.remove('active');
      window.scrollTo(0, 0);
    }

    function toggleMobileMenu() {
      document.getElementById('mobile-nav').classList.toggle('active');
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

    // 접속 IP 체크 및 로그 저장 기능
    async function checkVisitorIP() {
      let logs = JSON.parse(localStorage.getItem('hunster_ip_logs') || '[]');
      let userIp = "121.160.XXX.XX"; // 기본 폴백
      try {
        const res = await fetch('https://api.ipify.org?format=json');
        const data = await res.json();
        userIp = data.ip;
      } catch(e) {
        console.log("IP fetch restricted, using simulation IP.");
      }
      
      const now = new Date().toLocaleString();
      const userAgent = navigator.userAgent.includes('Mobile') ? '모바일 접속' : 'PC 웹 접속';
      
      // 중복 기록 방지 (세션당 1회) 또는 매번 기록
      logs.unshift({ ip: userIp, time: now, device: userAgent });
      if(logs.length > 50) logs.pop(); // 최대 50개 유지
      localStorage.setItem('hunster_ip_logs', JSON.stringify(logs));
    }

    window.onload = function() {
      if (!localStorage.getItem('hunster_users')) {
        localStorage.setItem('hunster_users', JSON.stringify([
          { name: '김철수', id: 'kim123', pw: '1234', phone: '010-9876-5432', address: '서울시 강남구 테헤란로 456', service: '쿠팡 트래픽 (공산품)', slots: 5, depositStatus: '입금완료', taxStatus: '발행완료' }
        ]));
      }
      calculatePrice(document.getElementById('slot-calc-input'));
      checkVisitorIP();
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
      
      const newUser = {
        name, id, pw, phone, address,
        service: '쿠팡 트래픽 (' + (coupangSub === 'industrial' ? '공산품' : '농산물') + ')',
        slots: slotCount,
        depositStatus: '입금대기',
        taxStatus: '발행대기'
      };

      users.push(newUser);
      localStorage.setItem('hunster_users', JSON.stringify(users));
      
      alert('회원가입이 완료되었습니다!\\n[입금 계좌 안내]\\n' + ACCOUNT_INFO.bank + ' ' + ACCOUNT_INFO.accountNumber + ' (' + ACCOUNT_INFO.holder + ')로 입금해주시면 확인 후 승인됩니다.');
      switchView('view-login');
    }

    function handleLogin(event) {
      event.preventDefault();
      const inputId = document.getElementById('login-id').value.trim();
      const inputPw = document.getElementById('login-pw').value.trim();
      
      if (inputId === 'hun1' && inputPw === '1234') {
        renderAdminDashboard();
        switchView('view-admin');
        return;
      }
      
      let users = JSON.parse(localStorage.getItem('hunster_users') || '[]');
      let foundUser = users.find(u => u.id === inputId && u.pw === inputPw);
      if (foundUser) {
        renderUserDashboard(foundUser);
        switchView('view-user-dashboard');
      } else {
        alert('아이디 또는 비밀번호가 일치하지 않습니다.');
      }
    }

    function renderAdminDashboard() {
      let users = JSON.parse(localStorage.getItem('hunster_users') || '[]');
      let tbody = document.getElementById('admin-user-tbody');
      tbody.innerHTML = '';
      
      users.forEach((u, index) => {
        let depositClass = u.depositStatus === '입금완료' ? 'status-complete' : 'status-pending';
        let taxClass = u.taxStatus === '발행완료' ? 'status-complete' : 'status-pending';
        
        tbody.innerHTML += \`<tr>
          <td><strong>\${u.name}</strong><br><span style="color:var(--text-sub); font-size:0.78rem;">(\${u.id})</span></td>
          <td>\${u.phone}<br><span style="color:var(--text-sub); font-size:0.78rem;">\${u.address}</span></td>
          <td><span style="color:var(--primary); font-weight:700;">\${u.service}</span><br><strong>\${u.slots} 슬롯</strong></td>
          <td><button class="badge-status \${depositClass}" onclick="toggleStatus(\${index}, 'deposit')">\${u.depositStatus}</button></td>
          <td><button class="badge-status \${taxClass}" onclick="toggleStatus(\${index}, 'tax')">\${u.taxStatus}</button></td>
        </tr>\`;
      });

      // IP 접속 로그 렌더링
      let logs = JSON.parse(localStorage.getItem('hunster_ip_logs') || '[]');
      let ipTbody = document.getElementById('admin-ip-tbody');
      ipTbody.innerHTML = '';
      logs.forEach(log => {
        ipTbody.innerHTML += \`<tr>
          <td><strong style="color:var(--primary);">\${log.ip}</strong></td>
          <td>\${log.device}</td>
          <td style="color:var(--text-sub);">\${log.time}</td>
        </tr>\`;
      });
    }

    function toggleStatus(index, type) {
      let users = JSON.parse(localStorage.getItem('hunster_users') || '[]');
      if(type === 'deposit') {
        users[index].depositStatus = users[index].depositStatus === '입금완료' ? '입금대기' : '입금완료';
      } else {
        users[index].taxStatus = users[index].taxStatus === '발행완료' ? '발행대기' : '발행완료';
      }
      localStorage.setItem('hunster_users', JSON.stringify(users));
      renderAdminDashboard();
    }

    function renderUserDashboard(user) {
      document.getElementById('my-name').innerText = user.name + ' 파트너님';
      document.getElementById('my-phone').innerText = user.phone;
      document.getElementById('my-address').innerText = user.address;
      document.getElementById('my-service').innerText = user.service;
      document.getElementById('my-slots').innerText = user.slots + ' 슬롯 활성 가동 중';
      document.getElementById('my-deposit-status').innerText = user.depositStatus;
      document.getElementById('my-deposit-status').className = 'badge-status ' + (user.depositStatus === '입금완료' ? 'status-complete' : 'status-pending');
      document.getElementById('my-tax-status').innerText = user.taxStatus;
      document.getElementById('my-tax-status').className = 'badge-status ' + (user.taxStatus === '발행완료' ? 'status-complete' : 'status-pending');
      
      // 계좌 안내 표시
      document.getElementById('account-info-box').innerHTML = \`입금 계좌: <strong>\${ACCOUNT_INFO.bank} \${ACCOUNT_INFO.accountNumber}</strong> (예금주: \${ACCOUNT_INFO.holder})\`;
    }

    function handleSlotExtension(event) {
      event.preventDefault();
      const addCount = parseInt(document.getElementById('extend-slots-input').value) || 5;
      alert(addCount + '개 슬롯 연장/추가 신청이 접수되었습니다.\\n입금 확인 후 즉시 가동 슬롯에 합산됩니다.');
      event.target.reset();
    }

    function switchAdminTab(tabName) {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      document.getElementById('tab-btn-' + tabName).classList.add('active');
      document.getElementById('tab-content-' + tabName).classList.add('active');
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
    <button class="mobile-menu-btn" onclick="toggleMobileMenu()">☰</button>
  </header>

  <div id="mobile-nav" class="mobile-nav">
    <a onclick="switchView('view-main')" style="font-weight:700; color:var(--text-main); text-decoration:none;">홈</a>
    <a onclick="switchView('view-login')" style="font-weight:700; color:var(--primary); text-decoration:none;">로그인</a>
    <a onclick="switchView('view-register')" style="font-weight:700; color:var(--primary); text-decoration:none;">회원가입</a>
  </div>

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

      <section class="guide-section">
        <h2>📈 쿠팡 키워드 검색량별 권장 슬롯 산정 및 로직 분석</h2>
        <p>쿠팡 알고리즘은 검색어별 유효 트래픽 볼륨에 비례하여 순위를 부여합니다. 키워드 규모에 맞는 최적의 슬롯 분배가 상위노출의 성패를 가릅니다.</p>
        <table class="guide-table">
          <thead>
            <tr>
              <th>키워드 월간 검색량 규모</th>
              <th>권장 가동 슬롯 수</th>
              <th>전략 및 운용 가이드</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>1.3만 이하</strong> (소형/세부 키워드)</td>
              <td><span style="color: var(--primary); font-weight: 800;">약 5 슬롯</span></td>
              <td>경쟁 강도가 낮아 최소 기본 슬롯만으로도 빠르게 상위권 진입 및 안착이 가능합니다.</td>
            </tr>
            <tr>
              <td><strong>1.3만 이상 ~ 12만 이하</strong> (중형 키워드)</td>
              <td><span style="color: var(--success); font-weight: 800;">약 10 슬롯</span></td>
              <td>안정적인 유입 분산을 통해 알고리즘 체류 시간 지표를 극대화하는 표준 구간입니다.</td>
            </tr>
            <tr>
              <td><strong>12만 이상</strong> (대형 메인 키워드)</td>
              <td><span style="color: #7c3aed; font-weight: 800;">15 슬롯 이상 (맞춤 상담 필수)</span></td>
              <td>경쟁이 매우 치열하므로, 제품 지수 진단 후 1:1 맞춤형 컨설팅 및 복합 전략이 반드시 필요합니다.</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section class="pricing-section">
        <div style="margin-bottom: 20px;">
          <h2>💰 투명하고 합리적인 요금제 안내</h2>
          <p style="font-size: 0.92rem; color: var(--text-sub);">복잡한 패키지 상품은 없습니다. 효율적인 운영을 위해 <strong>최소 5슬롯 이상</strong>부터 신청 가능합니다.</p>
        </div>
        <div class="pricing-grid">
          <div class="price-card">
            <div>
              <div class="price-title">쿠팡 트래픽 이용권 (1슬롯 단가 기준)</div>
              <div class="price-desc">공산품 및 농산물 전용 고속 프록시 트래픽 할당 (최소 5슬롯 구매)</div>
              <div class="price-tag">55,000원 <span>정가 60,000원</span></div>
              <p style="font-size: 0.82rem; color: var(--success); font-weight: 700; margin-bottom: 16px;">✨ 훈스터 첫 고객 특별 할인가 적용 중</p>
            </div>
            <button class="btn btn-primary" style="width: 100%;" onclick="switchView('view-register')">지금 회원가입 하기</button>
          </div>
          <div class="price-card featured">
            <div>
              <div class="price-title">🧮 실시간 슬롯 수량 및 세금계산기</div>
              <div class="price-desc">원하시는 슬롯 개수(최소 5개)를 입력하여 부가세 포함 금액을 확인하세요.</div>
              <div style="margin: 12px 0;">
                <label class="form-label" style="margin-bottom: 4px; display: block;">신청할 슬롯 개수 입력 (최소 5슬롯)</label>
                <input type="number" id="slot-calc-input" class="form-input" value="5" min="5" oninput="calculatePrice(this)" style="background: white;">
              </div>
              <div style="background: white; padding: 12px; border-radius: 8px; border: 1px solid var(--border); font-size: 0.88rem; display: flex; flex-direction: column; gap: 6px; margin-top: 12px;">
                <div style="display: flex; justify-content: space-between; color: var(--text-sub);">
                  <span>공급가액 (세금 미포함):</span><span id="supply-price-text" style="font-weight: 600; color: var(--text-main);">275,000원</span>
                </div>
                <div style="display: flex; justify-content: space-between; color: var(--text-sub);">
                  <span>부가세 (VAT 10%):</span><span id="vat-text" style="font-weight: 600; color: var(--text-main);">27,500원</span>
                </div>
                <div style="border-top: 1px solid var(--border); padding-top: 6px; display: flex; justify-content: space-between; align-items: center; font-weight: 700;">
                  <span>총 결제 금액 (세금 포함):</span><span id="total-price-text" style="font-size: 1.15rem; color: var(--primary);">302,500원</span>
                </div>
              </div>
            </div>
            <button class="btn btn-primary" style="width: 100%; margin-top: 16px;" onclick="switchView('view-register')">선택 수량으로 가입하기</button>
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
          <div class="form-group"><label class="form-label">아이디</label><input type="text" id="login-id" class="form-input" placeholder="아이디를 입력하세요" required></div>
          <div class="form-group"><label class="form-label">비밀번호</label><input type="password" id="login-pw" class="form-input" placeholder="비밀번호를 입력하세요" required></div>
        </div>
        <div style="margin-top: 24px;"><button type="submit" class="btn btn-primary" style="width: 100%; padding: 12px; font-size: 1rem;">로그인</button></div>
        <div style="margin-top: 16px; text-align: center; font-size: 0.88rem; color: var(--text-sub);">아직 계정이 없으신가요? <a style="color: var(--primary); font-weight: 700; cursor: pointer;" onclick="switchView('view-register')">회원가입하기</a></div>
      </form>
    </div>
  </div>

  <div id="view-register" class="page-view">
    <div class="auth-container" style="max-width: 600px;">
      <h2>파트너 회원가입</h2>
      <p>직접 계정을 생성하고 트래픽 슬롯 서비스를 시작하세요. (최소 5슬롯 이상)</p>
      <form onsubmit="handleRegister(event)">
        <div class="form-grid" style="gap: 14px;">
          <div class="form-group"><label class="form-label">대표자 성명</label><input type="text" id="reg-name" class="form-input" placeholder="성함 입력" required></div>
          <div class="form-group"><label class="form-label">사용할 아이디</label><input type="text" id="reg-id" class="form-input" placeholder="아이디 입력" required></div>
          <div class="form-group"><label class="form-label">비밀번호</label><input type="password" id="reg-pw" class="form-input" placeholder="비밀번호 입력" required></div>
          <div class="form-group"><label class="form-label">연락처 (전화번호)</label><input type="tel" id="reg-phone" class="form-input" placeholder="010-0000-0000" required></div>
          <div class="form-group"><label class="form-label">사업장 주소</label><input type="text" id="reg-address" class="form-input" placeholder="주소 입력" required></div>
          <div class="form-group">
            <label class="form-label">이용 서비스</label>
            <select id="service-type" class="form-select" onchange="handleServiceChange(this)" required>
              <option value="">-- 서비스 선택 --</option>
              <option value="coupang">쿠팡 트래픽</option>
            </select>
            <div id="coupang-sub-option" class="sub-option-box">
              <label class="form-label" style="color: #1e40af; margin-bottom: 6px; display: block;">🔍 [쿠팡 상세] 상품군 선택</label>
              <select id="coupang-sub-select" class="form-select" style="background: white;"><option value="industrial">공산품</option><option value="agricultural">농산물</option></select>
            </div>
          </div>
          <div class="form-group"><label class="form-label">신청 슬롯 수량 (최소 5개)</label><input type="number" id="reg-slots" class="form-input" value="5" min="5" required></div>
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
        <h2>🛡️ 관리자 통합 관제 센터</h2>
        <button class="btn" onclick="switchView('view-main')">로그아웃</button>
      </div>

      <div class="tab-menu">
        <button id="tab-btn-users" class="tab-btn active" onclick="switchAdminTab('users')">파트너 및 입금/세금계산서 관리</button>
        <button id="tab-btn-ips" class="tab-btn" onclick="switchAdminTab('ips')">실시간 방문자 IP 체킹 로그</button>
      </div>

      <div id="tab-content-users" class="tab-content active">
        <p style="font-size:0.88rem; color:var(--text-sub); margin-bottom:10px;">💡 표 안의 **입금 상태**와 **세금계산서 상태** 버튼을 클릭하면 실시간으로 완료/대기 상태가 토글됩니다.</p>
        <div class="data-table-wrapper">
          <table class="data-table">
            <thead>
              <tr>
                <th>성명 / ID</th>
                <th>연락처 / 주소</th>
                <th>서비스 및 슬롯</th>
                <th>입금 확인 상태</th>
                <th>세금계산서 상태</th>
              </tr>
            </thead>
            <tbody id="admin-user-tbody"></tbody>
          </table>
        </div>
      </div>

      <div id="tab-content-ips" class="tab-content">
        <p style="font-size:0.88rem; color:var(--text-sub); margin-bottom:10px;">💡 홈페이지에 접속한 고객들의 실시간 접속 IP 주소와 환경 로그입니다.</p>
        <div class="data-table-wrapper">
          <table class="data-table">
            <thead>
              <tr>
                <th>접속 IP 주소</th>
                <th>접속 환경</th>
                <th>접속 일시</th>
              </tr>
            </thead>
            <tbody id="admin-ip-tbody"></tbody>
          </table>
        </div>
      </div>
    </div>
  </div>

  <div id="view-user-dashboard" class="page-view">
    <div class="dashboard-container">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <h2 id="my-name">파트너님</h2>
        <button class="btn" onclick="switchView('view-main')">로그아웃</button>
      </div>
      
      <div class="card-box" style="background: white; margin-bottom: 24px;">
        <h3>📋 내 파트너 가입 정보 및 처리 상태</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; margin-top: 16px; font-size: 0.92rem;">
          <div><strong>전화번호:</strong> <span id="my-phone" style="color: var(--text-sub);"></span></div>
          <div><strong>주소:</strong> <span id="my-address" style="color: var(--text-sub);"></span></div>
          <div><strong>서비스:</strong> <span id="my-service" style="color: var(--primary); font-weight: 700;"></span></div>
          <div><strong>슬롯 현황:</strong> <span id="my-slots" style="color: var(--success); font-weight: 700;"></span></div>
          <div><strong>입금 상태:</strong> <span id="my-deposit-status" class="badge-status status-pending">입금대기</span></div>
          <div><strong>세금계산서:</strong> <span id="my-tax-status" class="badge-status status-pending">발행대기</span></div>
        </div>
        <div id="account-info-box" style="margin-top: 20px; padding: 14px; background: var(--primary-light); border-radius: 10px; font-size: 0.9rem; color: #1e40af;"></div>
      </div>

      <div class="card-box" style="background: white;">
        <h3>⚡ 슬롯 추가 및 기간 연장 신청</h3>
        <form onsubmit="handleSlotExtension(event)" style="margin-top: 14px; display: flex; gap: 10px; max-width: 500px;">
          <input type="number" id="extend-slots-input" class="form-input" value="5" min="5" placeholder="추가 슬롯 수" required>
          <button type="submit" class="btn btn-primary" style="white-space: nowrap;">연장 신청하기</button>
        </form>
      </div>
    </div>
  </div>

  <footer><p>&copy; 2026 HUNSTER TRAFFIC Inc. All rights reserved.</p></footer>
</body>
</html>`;

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(htmlContent);
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
