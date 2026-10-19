const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  
  res.end(`
    <!DOCTYPE html>
    <html lang="ko">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>HUNSTER - Enterprise Traffic & Slot Operations</title>
      <link href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css" rel="stylesheet">
      <style>
        :root {
          --bg-body: #f8fafc;
          --bg-card: #ffffff;
          --border: #e2e8f0;
          --border-subtle: #f1f5f9;
          --text-main: #0f172a;
          --text-sub: #64748b;
          --primary: #2563eb;
          --primary-hover: #1d4ed8;
          --primary-light: #eff6ff;
          --success: #059669;
          --success-bg: #ecfdf5;
          --warning-bg: #fffbeb;
          --warning-text: #d97706;
          --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
          --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.07), 0 2px 4px -2px rgb(0 0 0 / 0.07);
          --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.08), 0 4px 6px -4px rgb(0 0 0 / 0.08);
        }

        * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif; scroll-behavior: smooth; }
        body { background-color: var(--bg-body); color: var(--text-main); line-height: 1.6; letter-spacing: -0.01em; }

        header { height: 80px; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; padding: 0 60px; background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(10px); position: sticky; top: 0; z-index: 100; box-shadow: var(--shadow-sm); }
        .logo-area { display: flex; align-items: center; gap: 12px; font-weight: 800; font-size: 1.25rem; color: #0f172a; text-decoration: none; cursor: pointer; }
        .logo-icon { width: 38px; height: 38px; background: var(--primary); border-radius: 10px; display: flex; align-items: center; justify-content: center; color: white; font-weight: 800; box-shadow: 0 4px 12px rgba(37,99,235,0.3); }
        
        .nav-links { display: flex; gap: 32px; align-items: center; }
        .nav-links a { text-decoration: none; color: var(--text-sub); font-weight: 600; font-size: 0.95rem; transition: color 0.2s; cursor: pointer; }
        .nav-links a:hover { color: var(--primary); }

        .auth-actions { display: flex; gap: 12px; align-items: center; }
        .btn { padding: 10px 22px; border-radius: 10px; font-size: 0.92rem; font-weight: 600; cursor: pointer; border: 1px solid var(--border); background: white; color: var(--text-main); transition: all 0.2s; box-shadow: var(--shadow-sm); }
        .btn:hover { background: #f8fafc; border-color: #cbd5e1; }
        .btn-primary { background: var(--primary); border-color: var(--primary); color: white; box-shadow: 0 4px 12px rgba(37,99,235,0.25); }
        .btn-primary:hover { background: var(--primary-hover); }

        .page-view { display: none; }
        .page-view.active { display: block; }

        .wrapper { max-width: 1200px; margin: 0 auto; padding: 60px 20px; display: flex; flex-direction: column; gap: 80px; }

        .hero { text-align: center; padding: 60px 0; }
        .hero-badge { display: inline-block; background: var(--primary-light); color: var(--primary); padding: 6px 16px; border-radius: 20px; font-size: 0.88rem; font-weight: 700; margin-bottom: 20px; }
        .hero h1 { font-size: 3.2rem; font-weight: 800; color: #0f172a; line-height: 1.25; margin-bottom: 20px; letter-spacing: -0.03em; }
        .hero p { font-size: 1.2rem; color: var(--text-sub); max-width: 700px; margin: 0 auto 36px auto; }

        .metrics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px; }
        .metric-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: 20px; padding: 32px; box-shadow: var(--shadow-md); position: relative; overflow: hidden; }
        .metric-card::before { content: ''; position: absolute; top: 0; left: 0; width: 4px; height: 100%; background: var(--primary); }
        .metric-title { font-size: 0.92rem; font-weight: 700; color: var(--text-sub); margin-bottom: 12px; }
        .metric-value { font-size: 2.3rem; font-weight: 800; color: #0f172a; }
        .metric-footer { font-size: 0.88rem; color: var(--success); font-weight: 600; margin-top: 12px; display: flex; align-items: center; gap: 6px; }

        .status-section-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
        @media(max-width: 900px) { .status-section-grid { grid-template-columns: 1fr; } }
        .card-box { background: var(--bg-card); border: 1px solid var(--border); border-radius: 20px; padding: 36px; box-shadow: var(--shadow-md); }
        .card-box h3 { font-size: 1.3rem; font-weight: 800; margin-bottom: 20px; }
        
        .server-status-item { display: flex; justify-content: space-between; align-items: center; padding: 14px 0; border-bottom: 1px solid var(--border-subtle); }
        .server-status-item:last-child { border-bottom: none; }
        .badge-online { background: var(--success-bg); color: var(--success); padding: 6px 12px; border-radius: 20px; font-size: 0.8rem; font-weight: 700; }
        .badge-preparing { background: var(--warning-bg); color: var(--warning-text); padding: 6px 12px; border-radius: 20px; font-size: 0.8rem; font-weight: 700; }

        .pricing-section { background: var(--bg-card); border: 1px solid var(--border); border-radius: 24px; padding: 48px; box-shadow: var(--shadow-lg); }
        .pricing-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-top: 30px; }
        @media(max-width: 768px) { .pricing-grid { grid-template-columns: 1fr; } }
        .price-card { background: var(--bg-body); border: 1px solid var(--border); border-radius: 16px; padding: 32px; display: flex; flex-direction: column; justify-content: space-between; }
        .price-card.featured { border-color: var(--primary); background: var(--primary-light); }
        .price-title { font-size: 1.2rem; font-weight: 800; margin-bottom: 8px; }
        .price-desc { font-size: 0.9rem; color: var(--text-sub); margin-bottom: 20px; }
        .price-tag { font-size: 1.8rem; font-weight: 800; color: var(--primary); margin-bottom: 20px; }
        .price-tag span { font-size: 0.9rem; color: var(--text-sub); font-weight: 500; text-decoration: line-through; margin-left: 8px; }

        .auth-container { max-width: 600px; margin: 60px auto; background: var(--bg-card); border: 1px solid var(--border); border-radius: 24px; padding: 48px; box-shadow: var(--shadow-lg); }
        .auth-container h2 { font-size: 1.8rem; font-weight: 800; margin-bottom: 8px; color: #0f172a; }
        .auth-container p { color: var(--text-sub); font-size: 0.95rem; margin-bottom: 32px; }

        .form-grid { display: grid; grid-template-columns: 1fr; gap: 20px; }
        .form-group { display: flex; flex-direction: column; gap: 8px; }
        .form-label { font-size: 0.92rem; font-weight: 700; color: #334155; }
        .form-input, .form-select { width: 100%; padding: 14px 18px; border: 1px solid var(--border); border-radius: 12px; font-size: 1rem; background: #fafafa; outline: none; transition: all 0.2s; color: #0f172a; font-weight: 500; }
        .form-input:focus, .form-select:focus { border-color: var(--primary); background: white; box-shadow: 0 0 0 4px rgba(37,99,235,0.12); }
        
        .sub-option-box { background: var(--primary-light); border: 1px solid #bfdbfe; padding: 20px; border-radius: 14px; margin-top: 10px; display: none; }

        .dashboard-container { max-width: 1100px; margin: 40px auto; padding: 0 20px; }
        .data-table { width: 100%; border-collapse: collapse; margin-top: 20px; background: white; border-radius: 16px; overflow: hidden; border: 1px solid var(--border); box-shadow: var(--shadow-sm); }
        .data-table th, .data-table td { padding: 16px 20px; text-align: left; border-bottom: 1px solid var(--border); font-size: 0.95rem; }
        .data-table th { background: var(--border-subtle); color: var(--text-sub); font-size: 0.85rem; font-weight: 700; text-transform: uppercase; }
        .data-table td { color: var(--text-main); font-weight: 500; }
        
        footer { text-align: center; padding: 60px 0; color: var(--text-sub); font-size: 0.9rem; border-top: 1px solid var(--border); background: white; margin-top: 40px; }
      </style>
      <script>
        function switchView(viewId) {
          document.querySelectorAll('.page-view').forEach(el => el.classList.remove('active'));
          document.getElementById(viewId).classList.add('active');
          window.scrollTo(0, 0);
        }

        function handleServiceChange(select) {
          const subBox = document.getElementById('coupang-sub-option');
          if (select.value === 'coupang') {
            subBox.style.display = 'block';
          } else {
            subBox.style.display = 'none';
          }
        }

        // 최소 5슬롯 제한 및 공급가액 / 부가세(10%) 실시간 계산
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
          const serviceType = document.getElementById('service-type').value;
          const coupangSub = document.getElementById('coupang-sub-select').value;
          const slotCount = parseInt(document.getElementById('reg-slots').value) || 5;

          if (slotCount < 5) {
            alert('슬롯은 최소 5개 이상부터 신청 가능합니다.');
            return;
          }

          let serviceStr = '쿠팡 트래픽 (' + (coupangSub === 'industrial' ? '공산품' : '농산물') + ')';
          if (serviceType === 'naver-reward') serviceStr = '네이버 리워드';
          if (serviceType === 'naver-place') serviceStr = '네이버 플레이스';

          let users = JSON.parse(localStorage.getItem('hunster_users') || '[]');
          
          if(users.some(u => u.id === id)) {
            alert('이미 존재하는 아이디입니다. 다른 아이디를 입력해주세요.');
            return;
          }

          users.push({ name, id, pw, phone, address, service: serviceStr, slots: slotCount });
          localStorage.setItem('hunster_users', JSON.stringify(users));

          alert('회원가입이 성공적으로 완료되었습니다! 로그인 후 이용해주세요.');
          switchView('view-login');
        }

        let loginFailCount = 0;

        function handleLogin(event) {
          event.preventDefault();
          const inputId = document.getElementById('login-id').value.trim();
          const inputPw = document.getElementById('login-pw').value.trim();

          // 관리자 로그인 (화면 노출 완전 차단, 백그라운드 체크)
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
            if (remaining <= 0) {
              alert('로그인 5회 실패로 보안상 계정이 차단되었습니다. 관리자에게 문의하세요.');
              document.getElementById('login-btn').disabled = true;
              document.getElementById('login-btn').style.background = '#cbd5e1';
            } else {
              alert('아이디 또는 비밀번호가 일치하지 않습니다. (남은 시도 횟수: ' + remaining + '회)');
            }
          }
        }

        function loadAdminTable() {
          let users = JSON.parse(localStorage.getItem('hunster_users') || '[]');
          let tbody = document.getElementById('admin-user-tbody');
          tbody.innerHTML = '';

          users.forEach(u => {
            let tr = document.createElement('tr');
            tr.innerHTML = \`
              <td><strong>\${u.name}</strong> (\${u.id})</td>
              <td>\${u.phone}</td>
              <td>\${u.address}</td>
              <td><span style="color: var(--primary); font-weight: 700;">\${u.service}</span></td>
              <td><strong style="color: var(--success);">\${u.slots} 슬롯</strong></td>
            \`;
            tbody.appendChild(tr);
          });
        }
      </script>
    </head>
    <body>

      <header>
        <a class="logo-area" onclick="switchView('view-main')">
          <div class="logo-icon">H</div>
          <span>HUNSTER TRAFFIC (v2)</span>
        </a>
        <div class="nav-links">
          <a onclick="switchView('view-main')">홈</a>
          <a onclick="switchView('view-main'); location.hash='#status';">실시간 현황</a>
          <a onclick="switchView('view-main'); location.hash='#pricing';">요금제</a>
        </div>
        <div class="auth-actions">
          <button class="btn" onclick="switchView('view-login')">로그인</button>
          <button class="btn btn-primary" onclick="switchView('view-register')">회원가입</button>
        </div>
      </header>

      <div id="view-main" class="page-view active">
        <div class="wrapper">
