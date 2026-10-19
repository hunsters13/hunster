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
          --bg-sidebar: #ffffff;
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
          --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
          --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.07), 0 2px 4px -2px rgb(0 0 0 / 0.07);
          --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.08), 0 4px 6px -4px rgb(0 0 0 / 0.08);
        }

        * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif; }
        body { background-color: var(--bg-body); color: var(--text-main); display: flex; height: 100vh; overflow: hidden; letter-spacing: -0.01em; }

        /* 사이드바 */
        aside { width: 280px; background: var(--bg-sidebar); border-right: 1px solid var(--border); display: flex; flex-direction: column; justify-content: space-between; padding: 32px 24px; z-index: 20; }
        .brand-area { display: flex; align-items: center; gap: 12px; margin-bottom: 36px; padding-left: 8px; }
        .brand-icon { width: 36px; height: 36px; background: var(--primary); border-radius: 10px; display: flex; align-items: center; justify-content: center; color: white; font-weight: 800; font-size: 1.1rem; box-shadow: 0 4px 12px rgba(37,99,235,0.3); }
        .brand-text h1 { font-size: 1.1rem; font-weight: 800; color: #0f172a; line-height: 1.2; }
        .brand-text p { font-size: 0.75rem; color: var(--text-sub); font-weight: 500; }

        .nav-section-title { font-size: 0.7rem; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; padding-left: 12px; margin-bottom: 12px; }
        .nav-menu { display: flex; flex-direction: column; gap: 4px; margin-bottom: 24px; }
        .nav-item { padding: 12px 16px; border-radius: 10px; color: var(--text-sub); text-decoration: none; font-size: 0.92rem; font-weight: 600; display: flex; align-items: center; gap: 12px; transition: all 0.2s ease; cursor: pointer; }
        .nav-item:hover { background: var(--border-subtle); color: var(--text-main); }
        .nav-item.active { background: var(--primary-light); color: var(--primary); font-weight: 700; }

        .sidebar-footer { padding-top: 20px; border-top: 1px solid var(--border); display: flex; align-items: center; gap: 12px; }
        .sidebar-avatar { width: 40px; height: 40px; background: #e2e8f0; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; color: #475569; }
        .sidebar-user-info div:first-child { font-size: 0.88rem; font-weight: 700; color: #1e293b; }
        .sidebar-user-info div:last-child { font-size: 0.75rem; color: var(--text-sub); }

        /* 메인 영역 */
        main { flex: 1; display: flex; flex-direction: column; overflow-y: auto; }
        
        /* 헤더 (로그인/회원가입 고정) */
        header { height: 80px; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; padding: 0 48px; background: var(--bg-sidebar); position: sticky; top: 0; z-index: 10; box-shadow: var(--shadow-sm); }
        .header-title h2 { font-size: 1.35rem; font-weight: 800; color: #0f172a; letter-spacing: -0.02em; }
        .header-title p { font-size: 0.82rem; color: var(--text-sub); margin-top: 2px; }
        
        .auth-actions { display: flex; gap: 12px; align-items: center; }
        .btn { padding: 10px 20px; border-radius: 10px; font-size: 0.9rem; font-weight: 600; cursor: pointer; border: 1px solid var(--border); background: white; color: var(--text-main); transition: all 0.2s; box-shadow: var(--shadow-sm); }
        .btn:hover { background: #f8fafc; border-color: #cbd5e1; }
        .btn-primary { background: var(--primary); border-color: var(--primary); color: white; box-shadow: 0 4px 12px rgba(37,99,235,0.25); }
        .btn-primary:hover { background: var(--primary-hover); }

        /* 컨텐츠 바디 */
        .content-body { padding: 40px 48px; max-width: 1440px; width: 100%; margin: 0 auto; display: flex; flex-direction: column; gap: 32px; }

        /* 대시보드 요약 카드 */
        .metrics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 24px; }
        .metric-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: 16px; padding: 24px; box-shadow: var(--shadow-md); position: relative; overflow: hidden; }
        .metric-card::before { content: ''; position: absolute; top: 0; left: 0; width: 4px; height: 100%; background: var(--primary); }
        .metric-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
        .metric-title { font-size: 0.88rem; font-weight: 700; color: var(--text-sub); }
        .metric-value { font-size: 2rem; font-weight: 800; color: #0f172a; letter-spacing: -0.03em; }
        .metric-footer { font-size: 0.82rem; color: var(--success); font-weight: 600; margin-top: 8px; display: flex; align-items: center; gap: 4px; }

        /* 회원가입 및 서비스 신청 섹션 (하이엔드 폼) */
        .section-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: 20px; padding: 40px; box-shadow: var(--shadow-lg); }
        .section-header { margin-bottom: 32px; border-bottom: 1px solid var(--border-subtle); padding-bottom: 20px; }
        .section-header h3 { font-size: 1.4rem; font-weight: 800; color: #0f172a; margin-bottom: 6px; }
        .section-header p { font-size: 0.9rem; color: var(--text-sub); }

        .form-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px; }
        @media (max-width: 900px) { .form-grid { grid-template-columns: 1fr; } }
        
        .form-group { display: flex; flex-direction: column; gap: 8px; }
        .form-group.full { grid-column: span 2; }
        @media (max-width: 900px) { .form-group.full { grid-column: span 1; } }

        .form-label { font-size: 0.9rem; font-weight: 700; color: #334155; }
        .form-input, .form-select { width: 100%; padding: 14px 18px; border: 1px solid var(--border); border-radius: 12px; font-size: 0.98rem; background: #fafafa; outline: none; transition: all 0.2s; color: #0f172a; font-weight: 500; }
        .form-input:focus, .form-select:focus { border-color: var(--primary); background: white; box-shadow: 0 0 0 4px rgba(37,99,235,0.12); }
        
        .sub-option-box { background: var(--primary-light); border: 1px solid #bfdbfe; padding: 20px; border-radius: 14px; margin-top: 12px; display: none; animation: fadeIn 0.3s ease; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }

        .form-submit-wrap { margin-top: 36px; display: flex; justify-content: flex-end; border-top: 1px solid var(--border-subtle); padding-top: 24px; }
      </style>
      <script>
        function handleServiceChange(select) {
          const subBox = document.getElementById('coupang-sub-option');
          if (select.value === 'coupang') {
            subBox.style.display = 'block';
          } else {
            subBox.style.display = 'none';
          }
        }
      </script>
    </head>
    <body>

      <!-- 사이드바 -->
      <aside>
        <div>
          <div class="brand-area">
            <div class="brand-icon">H</div>
            <div class="brand-text">
              <h1>HUNSTER</h1>
              <p>Enterprise Traffic Hub</p>
            </div>
          </div>

          <div class="nav-section-title">Main Navigation</div>
          <div class="nav-menu">
            <a class="nav-item active">📊 대시보드 및 개요</a>
            <a class="nav-item">🚀 실시간 슬롯 관리</a>
            <a class="nav-item">💰 요금제 및 패키지</a>
            <a class="nav-item">🛡️ 서버 인프라 안정화</a>
            <a class="nav-item">⚙️ 시스템 설정</a>
          </div>
        </div>

        <div class="sidebar-footer">
          <div class="sidebar-avatar">A</div>
          <div class="sidebar-user-info">
            <div>시스템 관리자</div>
            <div>Master Operator</div>
          </div>
        </div>
      </aside>

      <!-- 메인 컨텐츠 영역 -->
      <main>
        <!-- 상단 고정 네비게이션 (로그인 / 회원가입 항상 유지) -->
        <header>
          <div class="header-title">
            <h2>대시보드 통합 센터</h2>
            <p>실시간 인프라 가동 상태 및 신규 파트너 가입 접수</p>
          </div>
          <div class="auth-actions">
            <button class="btn" onclick="alert('로그인 모달창이 열립니다.')">로그인</button>
            <button class="btn btn-primary" onclick="alert('회원가입 폼으로 이동합니다.')">회원가입</button>
          </div>
        </header>

        <div class="content-body">
          
          <!-- 실시간 지표 통계 카드 -->
          <div class="metrics-grid">
            <div class="metric-card">
              <div class="metric-header">
                <span class="metric-title">실시간 활성 슬롯</span>
                <span style="font-size: 1.2rem;">⚡</span>
              </div>
              <div class="metric-value">1,240 / 1,500</div>
              <div class="metric-footer">↑ 현재 수용 용량의 82.6% 가동 중</div>
            </div>

            <div class="metric-card" style="--primary: #059669;">
              <div class="metric-header">
                <span class="metric-title">서버 시스템 안정성</span>
                <span style="font-size: 1.2rem;">🛡️</span>
              </div>
              <div class="metric-value">99.98%</div>
              <div class="metric-footer">Stable (무중단 24시간 실시간 유지)</div>
            </div>

            <div class="metric-card" style="--primary: #7c3aed;">
              <div class="metric-header">
                <span class="metric-title">평균 트래픽 응답 속도</span>
                <span style="font-size: 1.2rem;">⚡</span>
              </div>
              <div class="metric-value">24ms</div>
              <div class="metric-footer">최적의 네트워크 컨디션 유지 중</div>
            </div>
          </div>

          <!-- 요구하신 세부 회원가입 폼 섹션 -->
          <div class="section-card">
            <div class="section-header">
              <h3>📝 파트너 회원가입 및 맞춤 서비스 신청</h3>
              <p>필수 정보를 정확하게 입력해 주시면 검토 후 즉시 전담 슬롯이 배정됩니다.</p>
            </div>

            <form onsubmit="event.preventDefault(); alert('신청이 성공적으로 접수되었습니다. 담당자가 확인 후 연락드립니다.');">
              <div class="form-grid">
                
                <div class="form-group">
                  <label class="form-label">대표자 성명</label>
                  <input type="text" class="form-input" placeholder="성함을 입력하세요" required>
                </div>

                <div class="form-group">
                  <label class="form-label">연락처 (전화번호)</label>
                  <input type="tel" class="form-input" placeholder="010-0000-0000" required>
                </div>

                <div class="form-group full">
                  <label class="form-label">사업장 또는 수령 주소</label>
                  <input type="text" class="form-input" placeholder="도로명 주소를 상세히 입력하세요" required>
                </div>

                <div class="form-group full">
                  <label class="form-label">이용 희망 서비스 구분</label>
                  <select id="service-type" class="form-select" onchange="handleServiceChange(this)" required>
                    <option value="">-- 서비스 종류를 선택해 주세요 --</option>
                    <option value="coupang">쿠팡 트래픽</option>
                    <option value="naver-reward">네이버 리워드</option>
                    <option value="naver-place">네이버 플레이스</option>
                  </select>

                  <!-- 쿠팡 트래픽 선택 시 펼쳐지는 세부 카테고리 -->
                  <div id="coupang-sub-option" class="sub-option-box">
                    <label class="form-label" style="color: #1e40af; margin-bottom: 6px; display: block;">🔍 [쿠팡 트래픽 상세 설정] 상품군 선택</label>
                    <select class="form-select" style="background: white;">
                      <option value="industrial">공산품</option>
                      <option value="agricultural">농산물</option>
                    </select>
                  </div>
                </div>

              </div>

              <div class="form-submit-wrap">
                <button type="submit" class="btn btn-primary" style="padding: 16px 36px; font-size: 1.05rem;">회원가입 및 서비스 신청 완료</button>
              </div>
            </form>
          </div>

        </div>
      </main>

    </body>
    </html>
  `);
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
