const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  
  res.end(`
    <!DOCTYPE html>
    <html lang="ko">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>HUNSTER - 프리미엄 트래픽 솔루션</title>
      <style>
        :root {
          --bg-base: #f8fafc;
          --bg-sidebar: #ffffff;
          --bg-card: #ffffff;
          --border: #e2e8f0;
          --text-main: #0f172a;
          --text-sub: #64748b;
          --primary: #2563eb;
          --primary-hover: #1d4ed8;
          --success: #10b981;
        }

        * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
        body { background-color: var(--bg-base); color: var(--text-main); display: flex; height: 100vh; overflow: hidden; }

        /* 사이드바 */
        aside { width: 260px; background: var(--bg-sidebar); border-right: 1px solid var(--border); display: flex; flex-direction: column; justify-content: space-between; padding: 24px; }
        .brand { font-size: 1.2rem; font-weight: 800; color: var(--primary); display: flex; align-items: center; gap: 8px; letter-spacing: -0.5px; }
        
        .nav-menu { margin-top: 40px; display: flex; flex-direction: column; gap: 6px; }
        .nav-item { padding: 12px 16px; border-radius: 8px; color: var(--text-sub); text-decoration: none; font-size: 0.92rem; font-weight: 500; display: flex; align-items: center; gap: 12px; transition: 0.2s; cursor: pointer; }
        .nav-item:hover, .nav-item.active { background: #eff6ff; color: var(--primary); }

        /* 메인 컨텐츠 영역 */
        main { flex: 1; display: flex; flex-direction: column; overflow-y: auto; }
        
        /* 상단 네비게이션 (로그인/회원가입 고정) */
        header { height: 70px; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; padding: 0 40px; background: var(--bg-sidebar); position: sticky; top: 0; z-index: 10; }
        .page-title { font-size: 1.25rem; font-weight: 700; color: #1e293b; }
        .auth-actions { display: flex; gap: 12px; align-items: center; }
        
        .btn { padding: 8px 18px; border-radius: 8px; font-size: 0.9rem; font-weight: 600; cursor: pointer; border: 1px solid var(--border); background: white; color: var(--text-main); transition: 0.2s; }
        .btn:hover { background: #f1f5f9; }
        .btn-primary { background: var(--primary); border-color: var(--primary); color: white; }
        .btn-primary:hover { background: var(--primary-hover); }

        .content-body { padding: 40px; max-width: 1400px; width: 100%; margin: 0 auto; }

        /* 통계 카드 그리드 */
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .stat-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: 12px; padding: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.02); }
        .stat-card h4 { font-size: 0.85rem; color: var(--text-sub); font-weight: 600; margin-bottom: 8px; }
        .stat-card .value { font-size: 1.8rem; font-weight: 800; color: #0f172a; }
        .stat-card .trend { font-size: 0.8rem; color: var(--success); margin-top: 8px; font-weight: 600; }

        /* 회원가입 폼 섹션 스타일 */
        .form-section { background: var(--bg-card); border: 1px solid var(--border); border-radius: 16px; padding: 32px; margin-bottom: 30px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02); }
        .form-section h3 { font-size: 1.2rem; font-weight: 700; margin-bottom: 20px; color: #1e293b; }
        
        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        @media (max-width: 768px) { .form-grid { grid-template-columns: 1fr; } }
        
        .form-group { margin-bottom: 16px; }
        .form-group label { display: block; font-size: 0.88rem; font-weight: 600; margin-bottom: 6px; color: #334155; }
        .form-group input, .form-group select { width: 100%; padding: 10px 14px; border: 1px solid var(--border); border-radius: 8px; font-size: 0.95rem; background: #f8fafc; outline: none; transition: 0.2s; }
        .form-group input:focus, .form-group select:focus { border-color: var(--primary); background: white; box-shadow: 0 0 0 3px rgba(37,99,235,0.1); }
        
        .sub-option-box { background: #f1f5f9; padding: 12px; border-radius: 8px; margin-top: 8px; display: none; }
      </style>
      <script>
        function handleServiceChange(selectElement) {
          const subBox = document.getElementById('coupang-sub-option');
          if (selectElement.value === 'coupang') {
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
          <div class="brand">
            ⚡ HUNSTER TRAFFIC
          </div>
          <div class="nav-menu">
            <a class="nav-item active">📊 대시보드 개요</a>
            <a class="nav-item">🚀 슬롯 실시간 현황</a>
            <a class="nav-item">💰 가격 및 패키지</a>
            <a class="nav-item">🛡️ 서버 안정화 모니터</a>
          </div>
        </div>
        <div style="font-size: 0.8rem; color: var(--text-sub); text-align: center;">
          v4.0 Bright Enterprise
        </div>
      </aside>

      <!-- 메인 화면 -->
      <main>
        <!-- 상단 고정 바 (로그인/회원가입 항상 유지) -->
        <header>
          <div class="page-title">플랫폼 대시보드</div>
          <div class="auth-actions">
            <button class="btn" onclick="alert('로그인 모달창이 열립니다.')">로그인</button>
            <button class="btn btn-primary" onclick="alert('회원가입 섹션으로 이동합니다.')">회원가입</button>
          </div>
        </header>

        <div class="content-body">
          
          <!-- 통계 카드 -->
          <div class="stats-grid">
            <div class="stat-card">
              <h4>총 활성 슬롯</h4>
              <div class="value">1,240 개</div>
              <div class="trend">↑ 실시간 82.6% 가동 중</div>
            </div>
            <div class="stat-card">
              <h4>서버 시스템 안정성</h4>
              <div class="value">99.98%</div>
              <div class="trend">Stable (무중단 운영)</div>
            </div>
            <div class="stat-card">
              <h4>평균 트래픽 응답 속도</h4>
              <div class="value">24ms</div>
              <div class="trend">최적 컨디션 유지</div>
            </div>
          </div>

          <!-- 요구하신 세부 회원가입 등록 폼 섹션 -->
          <div class="form-section">
            <h3>📝 신규 파트너 회원가입 및 서비스 신청</h3>
            <form onsubmit="event.preventDefault(); alert('회원가입 신청이 정상적으로 접수되었습니다!');">
              <div class="form-grid">
                
                <div class="form-group">
                  <label>이름 (대표자명)</label>
                  <input type="text" placeholder="성함을 입력하세요" required>
                </div>

                <div class="form-group">
                  <label>전화번호</label>
                  <input type="tel" placeholder="010-0000-0000" required>
                </div>

                <div class="form-group" style="grid-column: span 2;">
                  <label>주소</label>
                  <input type="text" placeholder="사업장 또는 자택 주소를 입력하세요" required>
                </div>

                <div class="form-group" style="grid-column: span 2;">
                  <label>이용 희망 서비스 구분</label>
                  <select id="service-type" onchange="handleServiceChange(this)" required>
                    <option value="">-- 서비스를 선택해 주세요 --</option>
                    <option value="coupang">쿠팡 트래픽</option>
                    <option value="naver-reward">네이버 리워드</option>
                    <option value="naver-place">네이버 플레이스</option>
                  </select>
                  
                  <!-- 쿠팡 트래픽 선택 시 나타나는 세부 분류 -->
                  <div id="coupang-sub-option" class="sub-option-box">
                    <label style="font-size: 0.85rem; margin-bottom: 4px; display:block;">[쿠팡 트래픽 상세] 상품군 선택</label>
                    <select style="background: white;">
                      <option value="industrial">공산품</option>
                      <option value="agricultural">농산물</option>
                    </select>
                  </div>
                </div>

              </div>

              <div style="margin-top: 20px; text-align: right;">
                <button type="submit" class="btn btn-primary" style="padding: 12px 24px; font-size: 1rem;">가입 및 서비스 신청 완료</button>
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
