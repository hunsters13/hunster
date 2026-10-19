const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  
  res.end(`
    <!DOCTYPE html>
    <html lang="ko">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>HUNSTER - 쿠팡 스마트 트래픽 솔루션</title>
      <style>
        :root {
          --primary: #E60012; /* 쿠팡 레드 포인트 */
          --primary-hover: #c5000f;
          --bg: #f8f9fa;
          --surface: #ffffff;
          --text-main: #191f28;
          --text-sub: #6b7684;
          --border: #e5e8eb;
        }

        * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; }
        body { background-color: var(--bg); color: var(--text-main); line-height: 1.6; }

        /* 네비게이션 바 */
        header { background: var(--surface); padding: 16px 40px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border); position: sticky; top: 0; z-index: 100; }
        .logo { font-size: 1.25rem; font-weight: 800; color: var(--primary); letter-spacing: -0.5px; }
        .nav-links { display: flex; gap: 24px; align-items: center; }
        .nav-links a { text-decoration: none; color: var(--text-sub); font-size: 0.95rem; font-weight: 500; transition: color 0.2s; }
        .nav-links a:hover { color: var(--text-main); }
        
        .auth-btns { display: flex; gap: 10px; }
        .btn { padding: 8px 16px; border-radius: 8px; font-weight: 600; font-size: 0.9rem; cursor: pointer; transition: 0.2s; border: none; }
        .btn-primary { background: var(--primary); color: white; }
        .btn-primary:hover { background: var(--primary-hover); }
        .btn-outline { background: transparent; border: 1px solid var(--border); color: var(--text-main); }
        .btn-outline:hover { background: #f2f4f6; }

        /* 컨테이너 */
        .container { max-width: 1100px; margin: 40px auto; padding: 0 20px; }

        /* 히어로 섹션 */
        .hero { text-align: center; margin-bottom: 60px; padding: 40px 0; }
        .hero-badge { display: inline-block; background: #fee5e8; color: var(--primary); padding: 6px 12px; border-radius: 20px; font-size: 0.85rem; font-weight: 700; margin-bottom: 16px; }
        .hero h1 { font-size: 2.5rem; margin-bottom: 16px; font-weight: 800; letter-spacing: -1px; color: #111; }
        .hero p { color: var(--text-sub); font-size: 1.15rem; max-width: 600px; margin: 0 auto; }

        /* 그리드 카드 레이아웃 */
        .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 24px; margin-bottom: 40px; }
        .card { background: var(--surface); border-radius: 16px; padding: 32px; border: 1px solid var(--border); box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
        .card h3 { font-size: 1.1rem; font-weight: 700; margin-bottom: 16px; display: flex; align-items: center; gap: 8px; color: #333; }

        /* 서버 상태 인디케이터 */
        .status-box { display: flex; align-items: center; gap: 10px; background: #f4f6f8; padding: 14px 18px; border-radius: 12px; margin-top: 12px; }
        .status-dot { width: 10px; height: 10px; background: #00c853; border-radius: 50%; box-shadow: 0 0 0 4px rgba(0,200,83,0.15); }
        .status-text { font-weight: 600; font-size: 0.95rem; color: #111; }

        /* 슬롯 그래프 */
        .slot-info { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 0.95rem; font-weight: 600; }
        .slot-bar-bg { background: #f2f4f6; border-radius: 8px; height: 12px; width: 100%; overflow: hidden; margin-top: 10px; }
        .slot-bar-fill { background: var(--primary); height: 100%; width: 82%; border-radius: 8px; }

        /* 가격 테이블 섹션 */
        .pricing-card { background: var(--surface); border-radius: 16px; padding: 32px; border: 1px solid var(--border); box-shadow: 0 2px 8px rgba(0,0,0,0.04); margin-bottom: 40px; }
        .pricing-card h3 { font-size: 1.25rem; font-weight: 700; margin-bottom: 20px; }
        .price-table { width: 100%; border-collapse: collapse; }
        .price-table th, .price-table td { padding: 16px; text-align: left; border-bottom: 1px solid var(--border); }
        .price-table th { color: var(--text-sub); font-size: 0.85rem; font-weight: 600; text-transform: uppercase; }
        .price-table td { font-size: 0.95rem; }
        .price-highlight { color: var(--primary); font-weight: 700; font-size: 1.1rem; }
        
        footer { text-align: center; padding: 40px; color: var(--text-sub); font-size: 0.85rem; border-top: 1px solid var(--border); background: var(--surface); margin-top: 60px; }
      </style>
    </head>
    <body>

      <header>
        <div class="logo">HUNSTER.</div>
        <div class="nav-links">
          <a href="#">서비스 소개</a>
          <a href="#">가격 안내</a>
          <a href="#">슬롯 현황</a>
          <a href="#">고객센터</a>
        </div>
        <div class="auth-btns">
          <button class="btn btn-outline" onclick="alert('로그인 모달창이 열립니다.')">로그인</button>
          <button class="btn btn-primary" onclick="alert('회원가입 페이지로 이동합니다.')">회원가입</button>
        </div>
      </header>

      <div class="container">
        
        <div class="hero">
          <span class="hero-badge">PREMIUM TRAFFIC SOLUTION</span>
          <h1>스마트한 셀러를 위한<br>압도적인 쿠팡 트래픽 솔루션</h1>
          <p>안정적인 프록시 분산 시스템과 실시간 슬롯 제어로 비즈니스의 성장을 가속화하세요.</p>
        </div>

        <div class="grid">
          <!-- 서버 안정화 상태 -->
          <div class="card">
            <h3>🛡️ 서버 인프라 안정성</h3>
            <p style="color: var(--text-sub); font-size: 0.9rem;">24시간 무중단 실시간 모니터링 시스템 가동 중</p>
            <div class="status-box">
              <div class="status-dot"></div>
              <div class="status-text">모든 트래픽 서버 정상 가동중 (99.9%)</div>
            </div>
          </div>

          <!-- 슬롯 유치량 현황 -->
          <div class="card">
            <h3>📊 실시간 슬롯 유치 현황</h3>
            <div class="slot-info" style="margin-top: 10px;">
              <span>사용 중인 슬롯</span>
              <span style="color: var(--primary);">1,230 / 1,500 슬롯</span>
            </div>
            <div class="slot-bar-bg">
              <div class="slot-bar-fill"></div>
            </div>
            <p style="color: var(--text-sub); font-size: 0.85rem; margin-top: 12px;">잔여 슬롯 270개 (실시간 자동 갱신)</p>
          </div>
        </div>

        <!-- 가격 소개란 -->
        <div class="pricing-card">
          <h3>💰 요금제 안내</h3>
          <table class="price-table">
            <thead>
              <tr>
                <th>패키지 상품</th>
                <th>슬롯 구성</th>
                <th>이용 요금</th>
                <th>추천 대상</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>스타터 패키지 (7일)</strong></td>
                <td>1개 슬롯</td>
                <td class="price-highlight">50,000원</td>
                <td>테스트 및 입문용 셀러</td>
              </tr>
              <tr>
                <td><strong>스탠다드 패키지 (30일)</strong></td>
                <td>1개 슬롯</td>
                <td class="price-highlight">180,000원</td>
                <td>가장 인기 있는 기본형</td>
              </tr>
              <tr>
                <td><strong>프로페셔널 패키지 (30일)</strong></td>
                <td>5개 슬롯 (묶음 할인)</td>
                <td class="price-highlight">800,000원</td>
                <td>대형 브랜드 및 전문 셀러</td>
              </tr>
            </tbody>
          </table>
        </div>

      </div>

      <footer>
        <p>&copy; 2026 HUNSTER Inc. All rights reserved. | 쿠팡 트래픽 전문 파트너</p>
      </footer>

    </body>
    </html>
  `);
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
