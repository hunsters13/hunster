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

        /* 상단 고정 네비게이션바 */
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

        /* 화면 뷰 컨트롤 */
        .page-view { display: none; }
        .page-view.active { display: block; }

        /* 메인 컨테이너 */
        .wrapper { max-width: 1200px; margin: 0 auto; padding: 60px 20px; display: flex; flex-direction: column; gap: 80px; }

        /* 1. 히어로 섹션 */
        .hero { text-align: center; padding: 60px 0; }
        .hero-badge { display: inline-block; background: var(--primary-light); color: var(--primary); padding: 6px 16px; border-radius: 20px; font-size: 0.88rem; font-weight: 700; margin-bottom: 20px; }
        .hero h1 { font-size: 3.2rem; font-weight: 800; color: #0f172a; line-height: 1.25; margin-bottom: 20px; letter-spacing: -0.03em; }
        .hero p { font-size: 1.2rem; color: var(--text-sub); max-width: 700px; margin: 0 auto 36px auto; }

        /* 통계 및 상태 그리드 */
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

        /* 요금제 섹션 (슬롯 선택 계산기 포함) */
        .pricing-section { background: var(--bg-card); border: 1px solid var(--border); border-radius: 24px; padding: 48px; box-shadow: var(--shadow-lg); }
        .pricing-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-top: 30px; }
        @media(max-width: 768px) { .pricing-grid { grid-template-columns: 1fr; } }
        
        .price-card { background: var(--bg-body); border: 1px solid var(--border); border-radius: 16px; padding: 32px; display: flex; flex-direction: column; justify-content: space-between; }
        .price-card.featured { border-color: var(--primary); background: var(--primary-light); }
        .price-title { font-size: 1.2rem; font-weight: 800; margin-bottom: 8px; }
        .price-desc { font-size: 0.9rem; color: var(--text-sub); margin-bottom: 20px; }
        .price-tag { font-size: 1.8rem; font-weight: 800; color: var(--primary); margin-bottom: 20px; }
        .price-tag span { font-size: 0.9rem; color: var(--text-sub); font-weight: 500; text-decoration: line-through; margin-left: 8px; }

        /* 독립된 로그인 및 회원가입 모달/페이지 박스 */
        .auth-container { max-width: 500px; margin: 60px auto; background: var(--bg-card); border: 1px solid var(--border); border-radius: 24px; padding: 48px; box-shadow: var(--shadow-lg); }
        .auth-container h2 { font-size: 1.8rem; font-weight: 800; margin-bottom: 8px; color: #0f172a; }
        .auth-container p { color: var(--text-sub); font-size: 0.95rem; margin-bottom: 32px; }

        .form-grid { display: grid; grid-template-columns: 1fr; gap: 20px; }
        .form-group { display: flex; flex-direction: column; gap: 8px; }
        .form-label { font-size: 0.92rem; font-weight: 700; color: #334155; }
        .form-input, .form-select { width: 100%; padding: 14px 18px; border: 1px solid var(--border); border-radius: 12px; font-size: 1rem; background: #fafafa; outline: none; transition: all 0.2s; color: #0f172a; font-weight: 500; }
        .form-input:focus, .form-select:focus { border-color: var(--primary); background: white; box-shadow: 0 0 0 4px rgba(37,99,235,0.12); }
        
        .sub-option-box { background: var(--primary-light); border: 1px solid #bfdbfe; padding: 20px; border-radius: 14px; margin-top: 10px; display: none; }
        
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

        // 실시간 요금 계산기 함수
        function calculatePrice(input) {
          let count = parseInt(input.value) || 1;
          if (count < 1) count = 1;
          const total = count * 55000;
          document.getElementById('total-price-text').innerText = total.toLocaleString() + '원';
        }
      </script>
    </head>
    <body>

      <!-- 상단 고정 네비게이션 바 -->
      <header>
        <a class="logo-area" onclick="switchView('view-main')">
          <div class="logo-icon">H</div>
          <span>HUNSTER TRAFFIC</span>
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

      <!-- ==================== [1] 메인 랜딩 페이지 뷰 ==================== -->
      <div id="view-main" class="page-view active">
        <div class="wrapper">
          
          <section class="hero">
            <span class="hero-badge">⚡ PREMIUM TRAFFIC & SLOT SOLUTION</span>
            <h1>쿠팡 상위노출을 위한<br>압도적인 실시간 트래픽 솔루션</h1>
            <p>안정적인 프록시 분산 서버와 지능형 슬롯 관리 시스템으로 비즈니스의 한계를 뛰어넘으세요.</p>
            <button class="btn btn-primary" style="padding: 16px 36px; font-size: 1.05rem;" onclick="switchView('view-register')">지금 바로 서비스 신청하기</button>
          </section>

          <!-- 통계 카드 (슬롯 한계점 제거, 유치량만 표시) -->
          <section class="metrics-grid">
            <div class="metric-card">
              <div class="metric-title">현재 실시간 활성 슬롯 유치량</div>
              <div class="metric-value">1,240 슬롯 가동중</div>
              <div class="metric-footer">↑ 안정적인 프록시 실시간 트래픽 유입 중</div>
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

          <!-- 서버 상태 & 서비스 준비중 섹션 -->
          <section id="status" class="status-section-grid">
            <div class="card-box">
              <h3>📊 실시간 슬롯 유치 현황</h3>
              <p style="color: var(--text-sub); font-size: 0.92rem; margin-top: 6px;">현재 전 세계 인프라 노드에서 구동 중인 실시간 트래픽 점유 현황입니다.</p>
              <div style="margin-top: 24px; padding: 20px; background: var(--bg-body); border-radius: 12px; border: 1px solid var(--border);">
                <span style="font-size: 0.88rem; color: var(--text-sub); font-weight: 700; display: block; margin-bottom: 6px;">활성 슬롯 합계</span>
                <span style="font-size: 1.8rem; font-weight: 800; color: var(--primary);">1,240 SLOT RUNNING</span>
              </div>
            </div>

            <div class="card-box">
              <h3>🛡️ 서비스 포트폴리오 및 인프라 모니터</h3>
              <p style="color: var(--text-sub); font-size: 0.92rem; margin-top: 6px;">쿠팡 트래픽 서비스 정상 가동 및 확장 예정 서비스 상태입니다.</p>
              <div style="margin-top: 20px;">
                <div class="server-status-item">
                  <span style="font-weight: 600;">쿠팡 트래픽 솔루션</span>
                  <span class="badge-online">● 정상 가동중</span>
                </div>
                <div class="server-status-item">
                  <span style="font-weight: 600;">네이버 리워드 서비스</span>
                  <span class="badge-preparing">준비 중</span>
                </div>
                <div class="server-status-item">
                  <span style="font-weight: 600;">네이버 플레이스 솔루션</span>
                  <span class="badge-preparing">준비 중</span>
                </div>
              </div>
            </div>
          </section>

          <!-- 요금제 및 가격 소개 섹션 (패키지 없음, 1슬롯 기준 5.5만 첫고객 특가, 수량 선택란) -->
          <section id="pricing" class="pricing-section">
            <div class="section-header" style="margin-bottom: 24px;">
              <h2>💰 투명하고 합리적인 요금제 안내</h2>
              <p>복잡한 패키지 상품은 없습니다. 필요한 슬롯 수량만큼 자유롭게 이용하세요.</p>
            </div>
            
            <div class="pricing-grid">
              <div class="price-card">
                <div>
                  <div class="price-title">쿠팡 트래픽 1슬롯 이용권</div>
                  <div class="price-desc">공산품 및 농산물 전용 고속 프록시 트래픽 할당</div>
                  <div class="price-tag">55,000원 <span>정가 60,000원</span></div>
                  <p style="font-size: 0.85rem; color: var(--success); font-weight: 700; margin-bottom: 16px;">✨ 훈스터 첫 고객 특별 할인가 적용 중</p>
                </div>
                <button class="btn btn-primary" style="width: 100%;" onclick="switchView('view-register')">지금 슬롯 신청하기</button>
              </div>

              <div class="price-card featured">
                <div>
                  <div class="price-title">🧮 실시간 슬롯 수량 계산기</div>
                  <div class="price-desc">원하시는 슬롯 개수를 입력하여 총 이용 요금을 확인하세요.</div>
                  <div style="margin: 20px 0;">
                    <label class="form-label" style="margin-bottom: 6px; display: block;">신청할 슬롯 개수 입력</label>
                    <input type="number" id="slot-calc-input" class="form-input" value="1" min="1" oninput="calculatePrice(this)" style="background: white;">
                  </div>
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 15px; font-weight: 700;">
                    <span>총 결제 예상 금액:</span>
                    <span id="total-price-text" style="font-size: 1.4rem; color: var(--primary);">55,000원</span>
                  </div>
                </div>
                <button class="btn btn-primary" style="width: 100%; margin-top: 20px;" onclick="switchView('view-register')">선택 수량으로 신청하기</button>
              </div>
            </div>
          </section>

        </div>
      </div>

      <!-- ==================== [2] 로그인 페이지 뷰 ==================== -->
      <div id="view-login" class="page-view">
        <div class="auth-container">
          <h2>로그인</h2>
          <p>HUNSTER 계정으로 로그인하여 슬롯을 관리하세요.</p>
          <form onsubmit="event.preventDefault(); alert('로그인 기능은 준비 중입니다.');">
            <div class="form-grid">
              <div class="form-group">
                <label class="form-label">아이디 (이메일)</label>
                <input type="text" class="form-input" placeholder="아이디를 입력하세요" required>
              </div>
              <div class="form-group">
                <label class="form-label">비밀번호</label>
                <input type="password" class="form-input" placeholder="비밀번호를 입력하세요" required>
              </div>
            </div>
            <div style="margin-top: 30px;">
              <button type="submit" class="btn btn-primary" style="width: 100%; padding: 14px; font-size: 1rem;">로그인</button>
            </div>
            <div style="margin-top: 20px; text-align: center; font-size: 0.9rem; color: var(--text-sub);">
              아직 계정이 없으신가요? <a style="color: var(--primary); font-weight: 700; cursor: pointer;" onclick="switchView('view-register')">회원가입하기</a>
            </div>
          </form>
        </div>
      </div>

      <!-- ==================== [3] 회원가입 페이지 뷰 (요청하신 상세 폼) ==================== -->
      <div id="view-register" class="page-view">
        <div class="auth-container" style="max-width: 650px;">
          <h2>파트너 회원가입</h2>
          <p>서비스 이용을 위한 필수 정보를 정확하게 입력해 주세요.</p>
          
          <form onsubmit="event.preventDefault(); alert('회원가입 및 서비스 신청이 성공적으로 접수되었습니다!'); switchView('view-main');">
            <div class="form-grid" style="gap: 16px;">
              
              <div class="form-group">
                <label class="form-label">대표자 성명</label>
                <input type="text" class="form-input" placeholder="성함을 입력하세요" required>
              </div>

              <div class="form-group">
                <label class="form-label">연락처 (전화번호)</label>
                <input type="tel" class="form-input" placeholder="010-0000-0000" required>
              </div>

              <div class="form-group">
                <label class="form-label">사업장 또는 수령 주소</label>
                <input type="text" class="form-input" placeholder="도로명 주소를 상세히 입력하세요" required>
              </div>

              <div class="form-group">
                <label class="form-label">이용 희망 서비스 구분</label>
                <select id="service-type" class="form-select" onchange="handleServiceChange(this)" required>
                  <option value="">-- 서비스 종류를 선택해 주세요 --</option>
                  <option value="coupang">쿠팡 트래픽</option>
                  <option value="naver-reward" disabled>네이버 리워드 (준비 중)</option>
                  <option value="naver-place" disabled>네이버 플레이스 (준비 중)</option>
                </select>

                <!-- 쿠팡 트래픽 선택 시 세부 카테고리 -->
                <div id="coupang-sub-option" class="sub-option-box">
                  <label class="form-label" style="color: #1e40af; margin-bottom: 6px; display: block;">🔍 [쿠팡 트래픽 상세 설정] 상품군 선택</label>
                  <select class="form-select" style="background: white;">
                    <option value="industrial">공산품</option>
                    <option value="agricultural">농산물</option>
                  </select>
                </div>
              </div>

            </div>

            <div style="margin-top: 36px; display: flex; gap: 12px;">
              <button type="button" class="btn" style="flex: 1; padding: 14px;" onclick="switchView('view-main')">취소</button>
              <button type="submit" class="btn btn-primary" style="flex: 2; padding: 14px; font-size: 1rem;">가입 및 서비스 신청 완료</button>
            </div>
          </form>
        </div>
      </div>

      <footer>
        <p>&copy; 2026 HUNSTER TRAFFIC Inc. All rights reserved. | Enterprise Infrastructure Division</p>
      </footer>

    </body>
    </html>
  `);
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
