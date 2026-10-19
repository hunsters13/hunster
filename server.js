const http = require('http');

// 서버 메모리에 데이터 저장 (새로고침해도 서버가 켜져 있는 동안 유지되며 실시간 연동됨)
let serverUsers = [
  { name: '김철수', id: 'kim123', pw: '1234', phone: '010-9876-5432', address: '서울시 강남구 테헤란로 456', service: '쿠팡 트래픽 (공산품)', slots: 5, depositStatus: '입금완료', taxStatus: '발행완료' }
];

let serverInquiries = [
  { id: 1, author: '김철수 (kim123)', title: '슬롯 추가 문의드립니다.', content: '슬롯 5개 추가 연장하고 싶어요.', reply: '확인 후 처리해드리겠습니다.', status: '답변완료', date: '2026-10-19' }
];

let serverIpLogs = [];

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
    .logo-icon { width: 42px; height: 42px; background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%); border-radius: 12px; display: flex; align-items: center; justify-content: center; color: white; font-weight: 900; font-size: 1.4rem; box-shadow: 0 0 20px rgba(37, 99, 235, 0.5); }
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
    
    .guide-section { background: var(--bg-card); border: 1px solid var(--border); border-radius: 20px; padding: 36px; box-shadow: var(--shadow-lg); }
    .guide-section h2 { font-size: 1.5rem; font-weight: 800; margin-bottom: 12px; color: #0f172a; }
    .guide-table { width: 100%; border-collapse: collapse; margin: 20px 0; background: white; border-radius: 12px; overflow: hidden; border: 1px solid var(--border); }
    .guide-table th, .guide-table td { padding: 14px 18px; text-align: left; border-bottom: 1px solid var(--border); font-size: 0.92rem; }
    .guide-table th { background: var(--border-subtle); color: var(--text-sub); font-weight: 700; font-size: 0.85rem; }

    .auth-container { max-width: 550px; margin: 40px auto; background: var(--bg-card); border: 1px solid var(--border); border-radius: 20px; padding: 36px; box-shadow: var(--shadow-lg); }
    .auth-container h2 { font-size: 1.6rem; font-weight: 800; margin-bottom: 6px; color: #0f172a; }
    .auth-container p { color: var(--text-sub); font-size: 0.9rem; margin-bottom: 24px; }
    .form-grid { display: grid; grid-template-columns: 1fr; gap: 16px; }
    .form-group { display: flex; flex-direction: column; gap: 6px; }
    .form-label { font-size: 0.88rem; font-weight: 700; color: #334155; }
    .form-input, .form-select, .form-textarea { width: 100%; padding: 12px 16px; border: 1px solid var(--border); border-radius: 10px; font-size: 0.95rem; background: #fafafa; outline: none; color: #0f172a; font-weight: 500; }
    .form-textarea { resize: vertical; min-height: 100px; }
    .sub-option-box { background: var(--primary-light); border: 1px solid #bfdbfe; padding: 16px; border-radius: 12px; margin-top: 8px; display: none; }
    
    .dashboard-container { max-width: 1200px; margin: 30px auto; padding: 0 16px; }
    .data-table-wrapper { overflow-x: auto; background: white; border-radius: 12px; border: 1px solid var(--border); margin-top: 16px; }
    .data-table { width: 100%; border-collapse: collapse; min-width: 750px; }
    .data-table th, .data-table td { padding: 14px 16px; text-align: left; border-bottom: 1px solid var(--border); font-size: 0.88rem; }
    .data-table th { background: var(--border-subtle); color: var(--text-sub); font-size: 0.8rem; font-weight: 700; }
    
    .badge-status { padding: 4px 10px; border-radius: 20px; font-size: 0.75rem; font-weight: 700; cursor: pointer; border: none; }
    .status-pending { background: var(--warning-bg); color: var(--warning-text); }
    .status-complete { background: var(--success-bg); color: var(--success); }
    
    .tab-menu { display: flex; gap: 10px; margin-bottom: 20px; border-bottom: 1px solid var(--border); padding-bottom: 12px; flex-wrap: wrap; }
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
    const ACCOUNT_INFO = { bank: "카카오뱅크", accountNumber: "3333-22-922-9190", holder: "김*훈" };
    const ADMIN_INFO = { name: "관리자 (김*훈)", phone: "010-3672-7807", company: "훈스터 (HUNSTER)" };

    let currentUser = null;

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

    // 서버와 실시간 데이터 동기화 함수들
    async function trackVisitor(userName = "비회원 (일반 방문)", userId = "-") {
      let userIp = "121.160.XXX.XX";
      try {
        const res = await fetch('https://api.ipify.org?format=json');
        const data = await res.json();
        userIp = data.ip;
      } catch(e) {}
      
      const now = new Date().toLocaleString();
      const device = navigator.userAgent.includes('Mobile') ? '모바일' : 'PC 웹';
      
      await fetch('/api/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ip: userIp, name: userName, id: userId, time: now, device })
      });
    }

    window.onload = async function() {
      calculatePrice(document.getElementById('slot-calc-input'));
      trackVisitor();
    };

    async function handleRegister(event) {
      event.preventDefault();
      const name = document.getElementById('reg-name').value;
      const id = document.getElementById('reg-id').value;
      const pw = document.getElementById('reg-pw').value;
      const phone = document.getElementById('reg-phone').value;
      const address = document.getElementById('reg-address').value;
      const coupangSub = document.getElementById('coupang-sub-select').value;
      const slotCount = parseInt(document.getElementById('reg-slots').value) || 5;
      
      if (slotCount < 5) { alert('슬롯은 최소 5개 이상부터 신청 가능합니다.'); return; }
      
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, id, pw, phone, address, coupangSub, slots: slotCount })
      });
      
      const result = await response.json();
      if(result.success) {
        alert('회원가입 완료!\\n[입금 계좌]\\n' + ACCOUNT_INFO.bank + ' ' + ACCOUNT_INFO.accountNumber + ' (' + ACCOUNT_INFO.holder + ')');
        trackVisitor(name + ' (회원가입)', id);
        switchView('view-login');
      } else {
        alert(result.message);
      }
    }

    async function handleLogin(event) {
      event.preventDefault();
      const inputId = document.getElementById('login-id').value.trim();
      const inputPw = document.getElementById('login-pw').value.trim();
      
      if (inputId === 'hun1' && inputPw === '1234') {
        await loadAdminData();
        switchView('view-admin');
        return;
      }
      
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: inputId, pw: inputPw })
      });
      const data = await res.json();
      
      if (data.success) {
        currentUser = data.user;
        trackVisitor(currentUser.name + ' (로그인)', currentUser.id);
        renderUserDashboard(currentUser);
        switchView('view-user-dashboard');
      } else {
        alert('아이디 또는 비밀번호가 일치하지 않습니다.');
      }
    }

    async function loadAdminData() {
      const res = await fetch('/api/admin/data');
      const data = await res.json();
      
      // 파트너 목록 렌더링
      let tbody = document.getElementById('admin-user-tbody');
      tbody.innerHTML = '';
      data.users.forEach((u, index) => {
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

      // 1:1 문의 렌더링
      let inqTbody = document.getElementById('admin-inquiry-tbody');
      inqTbody.innerHTML = '';
      data.inquiries.forEach((inq) => {
        inqTbody.innerHTML += \`<tr>
          <td>\${inq.author}</td>
          <td><strong>\${inq.title}</strong><br><span style="color:var(--text-sub);">\${inq.content}</span></td>
          <td><span class="badge-status \${inq.status === '답변완료' ? 'status-complete' : 'status-pending'}">\${inq.status}</span></td>
          <td><textarea id="reply-\${inq.id}" class="form-input" placeholder="답변 입력..." style="font-size:0.82rem; margin-bottom:4px;">\${inq.reply || ''}</textarea>
              <button class="btn btn-primary" style="padding:4px 10px; font-size:0.75rem;" onclick="submitReply(\${inq.id})">답변 등록</button></td>
        </tr>\`;
      });

      // 방문자 IP 로그 렌더링
      let ipTbody = document.getElementById('admin-ip-tbody');
      ipTbody.innerHTML = '';
      data.ipLogs.forEach(log => {
        ipTbody.innerHTML += \`<tr>
          <td><strong style="color:var(--primary);">\${log.ip}</strong></td>
          <td><span style="font-weight:700; color:var(--text-main);">\${log.name}</span> <span style="font-size:0.78rem; color:var(--text-sub);">(\${log.id})</span></td>
          <td>\${log.device}</td>
          <td style="color:var(--text-sub);">\${log.time}</td>
        </tr>\`;
      });
    }

    async function toggleStatus(index, type) {
      await fetch('/api/admin/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ index, type })
      });
      loadAdminData();
    }

    async function submitReply(id) {
      let replyText = document.getElementById('reply-' + id).value;
      await fetch('/api/admin/reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, reply: replyText })
      });
      alert('답변이 등록되었습니다.');
      loadAdminData();
    }

    async function renderUserDashboard(user) {
      document.getElementById('my-name').innerText = user.name + ' 파트너님';
      document.getElementById('my-phone').innerText = user.phone;
      document.getElementById('my-address').innerText = user.address;
      document.getElementById('my-service').innerText = user.service;
      document.getElementById('my-slots').innerText = user.slots + ' 슬롯 활성 가동 중';
      document.getElementById('my-deposit-status').innerText = user.depositStatus;
      document.getElementById('my-deposit-status').className = 'badge-status ' + (user.depositStatus === '입금완료' ? 'status-complete' : 'status-pending');
      document.getElementById('my-tax-status').innerText = user.taxStatus;
      document.getElementById('my-tax-status').className = 'badge-status ' + (user.taxStatus === '발행완료' ? 'status-complete' : 'status-pending');
      
      document.getElementById('account-info-box').innerHTML = \`입금 계좌: <strong>\${ACCOUNT_INFO.bank} \${ACCOUNT_INFO.accountNumber}</strong> (예금주: \${ACCOUNT_INFO.holder})\`;
      renderUserInquiries(user);
    }

    async function renderUserInquiries(user) {
      const res = await fetch('/api/inquiries?id=' + user.id);
      const myInqList = await res.json();
      let container = document.getElementById('my-inquiry-list');
      container.innerHTML = '';
      
      if(myInqList.length === 0) {
        container.innerHTML = '<p style="font-size:0.88rem; color:var(--text-sub);">작성한 문의 내역이 없습니다.</p>';
        return;
      }

      myInqList.forEach(inq => {
        container.innerHTML += \`<div style="border:1px solid var(--border); padding:12px; border-radius:8px; margin-bottom:8px; background:white;">
          <div style="display:flex; justify-content:space-between; font-size:0.85rem; color:var(--text-sub); margin-bottom:4px;">
            <span>작성일: \${inq.date}</span>
            <span class="badge-status \${inq.status === '답변완료' ? 'status-complete' : 'status-pending'}">\${inq.status}</span>
          </div>
          <div style="font-weight:700; font-size:0.92rem; margin-bottom:4px;">\${inq.title}</div>
          <div style="font-size:0.88rem; color:var(--text-main); margin-bottom:8px;">\${inq.content}</div>
          \${inq.reply ? \`<div style="background:var(--primary-light); padding:10px; border-radius:6px; font-size:0.85rem; color:#1e40af;"><strong>[관리자 답변]</strong> \${inq.reply}</div>\` : ''}
        </div>\`;
      });
    }

    async function handleNewInquiry(event) {
      event.preventDefault();
      if(!currentUser) { alert('로그인 정보가 없습니다.'); return; }
      
      const title = document.getElementById('inq-title').value;
      const content = document.getElementById('inq-content').value;
      
      await fetch('/api/inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ author: currentUser.name + ' (' + currentUser.id + ')', userId: currentUser.id, title, content })
      });

      alert('1:1 문의가 등록되었습니다.');
      document.getElementById('inquiry-form').reset();
      renderUserInquiries(currentUser);
    }

    function handleSlotExtension(event) {
      event.preventDefault();
      const addCount = parseInt(document.getElementById('extend-slots-input').value) || 5;
      alert(addCount + '개 슬롯 연장/추가 신청이 접수되었습니다.');
      event.target.reset();
    }

    function switchAdminTab(tabName) {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      document.getElementById('tab-btn-' + tabName).classList.add('active');
      document.getElementById('tab-content-' + tabName).classList.add('active');
    }

    function calculateQuoteTotal() {
      let count = parseInt(document.getElementById('q-slots-count').value) || 5;
      let unitPrice = parseFloat(document.getElementById('q-unit-price').value) || 55000;
      if(count < 1) count = 1;

      let supply = count * unitPrice;
      let vat = Math.round(supply * 0.1);
      let total = supply + vat;

      document.getElementById('q-supply-sub').innerText = supply.toLocaleString() + '원';
      document.getElementById('q-vat-sub').innerText = vat.toLocaleString() + '원';
      document.getElementById('q-total-sub').innerText = total.toLocaleString() + '원';
      document.getElementById('q-total-display').innerText = total.toLocaleString() + '원';
    }

    function copyQuoteToClipboard() {
      const clientName = document.getElementById('q-client-name').value || '고객님';
      const slots = document.getElementById('q-slots-count').value || 5;
      const unitPrice = parseInt(document.getElementById('q-unit-price').value) || 55000;
      const total = document.getElementById('q-total-display').innerText;

      const quoteText = 
\`[ 훈스터(HUNSTER) 공식 견적서 ]
- 공급자: \${ADMIN_INFO.company} / 연락처: \${ADMIN_INFO.phone}
- 수신자: \${clientName} 대표님
- 품목: 쿠팡 트래픽 고속 프록시 슬롯 (\${slots}슬롯 / 1슬롯당 \${unitPrice.toLocaleString()}원)
- 총 합계금액 (VAT 포함): \${total}
- 입금 계좌: \${ACCOUNT_INFO.bank} \${ACCOUNT_INFO.accountNumber} (\${ACCOUNT_INFO.holder})

감사합니다. 비즈니스의 성공을 응원합니다!\`;

      navigator.clipboard.writeText(quoteText).then(() => {
        alert('📋 견적서 텍스트가 클립보드에 복사되었습니다! 카카오톡이나 문자메시지에 바로 붙여넣기(Ctrl+V) 하세요.');
      }).catch(err => {
        alert('복사에 실패했습니다.');
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
        <button id="tab-btn-quote" class="tab-btn" onclick="switchAdminTab('quote')">공식 견적서 발행 및 복사</button>
        <button id="tab-btn-inquiries" class="tab-btn" onclick="switchAdminTab('inquiries')">1:1 고객센터 문의 관리</button>
        <button id="tab-btn-ips" class="tab-btn" onclick="switchAdminTab('ips')">실시간 방문자 IP & 회원 매칭 로그</button>
      </div>

      <div id="tab-content-users" class="tab-content active">
        <p style="font-size:0.88rem; color:var(--text-sub); margin-bottom:10px;">💡 서버에 등록된 파트너 현황 및 입금/세금계산서 상태를 관리합니다.</p>
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

      <div id="tab-content-quote" class="tab-content">
        <div class="card-box" style="background: white;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 10px;">
            <h3>📑 고객용 공식 견적서 생성기</h3>
            <button class="btn btn-primary" onclick="copyQuoteToClipboard()">📋 견적서 텍스트 원클릭 복사</button>
          </div>

          <div style="border: 2px solid var(--border); border-radius: 12px; padding: 30px; background: #fafafa; max-width: 800px; margin: 0 auto;">
            <div style="text-align: center; margin-bottom: 24px; border-bottom: 2px solid var(--text-main); padding-bottom: 12px;">
              <h2 style="font-size: 1.8rem; font-weight: 900;">견 적 서</h2>
              <p style="font-size: 0.8rem; color: var(--text-sub);">ESTIMATE SHEET</p>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px; font-size: 0.9rem;">
              <div style="border: 1px solid var(--border); padding: 14px; border-radius: 8px; background: white;">
                <h4 style="font-size: 0.95rem; font-weight: 800; color: var(--primary); margin-bottom: 8px;">[ 공급자 ]</h4>
                <div><strong>회사명:</strong> 훈스터 (HUNSTER)</div>
                <div><strong>담당자:</strong> 관리자 (김*훈)</div>
                <div><strong>연락처:</strong> 010-3672-7807</div>
              </div>
              <div style="border: 1px solid var(--border); padding: 14px; border-radius: 8px; background: white;">
                <h4 style="font-size: 0.95rem; font-weight: 800; color: var(--success); margin-bottom: 8px;">[ 공급받는 자 (고객) ]</h4>
                <div style="margin-bottom: 6px;"><strong>고객명:</strong> <input type="text" id="q-client-name" value="홍길동 대표" class="form-input" style="padding: 4px 8px; font-size: 0.88rem; width: 70%; display:inline-block;"></div>
                <div><strong>전화번호:</strong> <input type="text" id="q-client-phone" value="010-1234-5678" class="form-input" style="padding: 4px 8px; font-size: 0.88rem; width: 70%; display:inline-block;"></div>
              </div>
            </div>

            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 0.88rem; background: white; border-radius: 8px; overflow: hidden; border: 1px solid var(--border);">
              <thead>
                <tr style="background: var(--border-subtle); border-bottom: 1px solid var(--border);">
                  <th style="padding: 10px; text-align: left;">품명 및 규격</th>
                  <th style="padding: 10px; text-align: center; width: 80px;">수량</th>
                  <th style="padding: 10px; text-align: right; width: 130px;">단가 (원)</th>
                  <th style="padding: 10px; text-align: right; width: 110px;">금액</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style="padding: 12px 10px;">쿠팡 트래픽 고속 프록시 슬롯 이용권</td>
                  <td style="padding: 12px 10px; text-align: center;"><input type="number" id="q-slots-count
