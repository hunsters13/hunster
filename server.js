const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  
  res.end(`
    <!DOCTYPE html>
    <html lang="ko">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>HUNSTER TRAFFIC - 쿠팡 프리미엄 트래픽 솔루션</title>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
        body { background-color: #0f172a; color: #f8fafc; line-height: 1.6; }
        header { background: #1e293b; padding: 20px 40px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #334155; }
        .logo { font-size: 1.5rem; font-weight: bold; color: #38bdf8; }
        .auth-btns button { background: #3b82f6; color: white; border: none; padding: 8px 16px; margin-left: 10px; border-radius: 6px; cursor: pointer; font-weight: bold; transition: 0.2s; }
        .auth-btns button:hover { background: #2563eb; }
        .auth-btns .login-btn { background: transparent; border: 1px solid #64748b; color: #cbd5e1; }
        .auth-btns .login-btn:hover { background: #334155; color: white; }
        
        .container { max-width: 1200px; margin: 40px auto; padding: 0 20px; }
        .hero { text-align: center; margin-bottom: 50px; }
        .hero h1 { font-size: 2.5rem; margin-bottom: 15px; color: #f8fafc; }
        .hero p { color: #94a3b8; font-size: 1.1rem; }

        .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 25px; margin-bottom: 40px; }
        .card { background: #1e293b; border-radius: 12px; padding: 25px; border: 1px solid #334155; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
        .card h3 { margin-bottom: 15px; color: #38bdf8; font-size: 1.3rem; display: flex; align-items: center; gap: 10px; }
        
        /* 서버 안정화 상태 표시 */
        .status-badge { display: inline-block; width: 10px; height: 10px; background: #22c55e; border-radius: 50%; box-shadow: 0 0 8px #22c55e; }
        .status-text { color: #22c55e; font-weight: bold; }

        /* 슬롯 현황 */
        .slot-bar-bg { background: #334155; border-radius: 8px; height: 16px; width: 100%; margin-top: 15px; overflow: hidden; }
        .slot-bar-fill { background: linear-gradient(90deg, #38bdf8, #3b82f6); height: 100%; width: 78%; border-radius: 8px; }
        
        /* 가격 소개 */
        .price-table { width: 100%; border-collapse: collapse; margin-top: 15px; }
        .price-table th, .price-table td { padding: 12px; text-align: left; border-bottom: 1px solid #334155; }
        .price-table th { color: #94a3b8; font-size: 0.9rem; }
        .price-table td { font-size: 1rem; }
        .highlight { color: #38bdf8; font-weight: bold; }

        footer { text-align: center; padding: 30px; color: #64748b; border-top: 1px solid #334155; margin-top: 50px; }
      </style>
    </head>
    <body>

      <header>
        <div class="logo">⚡ HUNSTER TRAFFIC</div>
        <div class="auth-btns">
          <button class="login-btn" onclick="alert('로그인 기능 준비중입니다!')">로그인</button>
          <button onclick="alert('회원가입 페이지로 이동합니다!')">회원가입</button>
        </div>
      </header>

      <div class="container">
        <div class="hero">
          <h1>쿠팡 상위노출의 핵심, 압도적인 프리미엄 트래픽</h1>
          <p>실시간 슬롯 관리와 강력한 서버 안정성으로 고객님의 비즈니스를 지원합니다.</p>
        </div>

        <div class="grid">
          <!-- 서버 안정화 상태 -->
          <div class="card">
            <h3><span class="status-badge"></span> 서버 안정화 상태</h3>
            <p style="margin-top: 10px;">현재 모든 프록시 및 트래픽 서버가 <strong>정상 가동 중</strong>입니다.</p>
            <p style="margin-top: 15px; color: #94a3b8; font-size: 0.9rem;">가동률: <span class="status-text">99.9% Stable</span></p>
          </div>

          <!-- 슬롯 유치량 현황 -->
          <div class="card">
            <h3>📊 실시간 슬롯 유치 현황</h3>
            <p style="margin-top: 10px;">현재 가동 중인 총 슬롯 수</p>
            <h2 style="margin: 10px 0; color: #f8fafc;">1,240 / 1,500 슬롯</h2>
            <div class="slot-bar-bg">
              <div class="slot-bar-fill"></div>
            </div>
            <p style="margin-top: 10px; color: #94a3b8; font-size: 0.85rem;">잔여 슬롯: 260개 (실시간 변동)</p>
          </div>
        </div>

        <!-- 가격 소개란 -->
        <div class="card">
          <h3>💰 트래픽 이용 가격표</h3>
          <table class="price-table">
            <thead>
              <tr>
                <th>상품명 / 기간</th>
                <th>슬롯 제공량</th>
                <th>이용 요금</th>
                <th>비고</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>스타터 패키지 (7일)</td>
                <td>1개 슬롯</td>
                <td class="highlight">50,000원</td>
                <td>입문용 추천</td>
              </tr>
              <tr>
                <td>스탠다드 패키지 (30일)</td>
                <td>1개 슬롯</td>
                <td class="highlight">180,000원</td>
                <td>가장 인기 있는 상품</td>
              </tr>
              <tr>
                <td>프로페셔널 패키지 (30일)</td>
                <td>5개 슬롯 (패키지)</td>
                <td class="highlight">800,000원</td>
                <td>대형 셀러 전용</td>
              </tr>
            </tbody>
          </table>
        </div>

      </div>

      <footer>
        <p>&copy; 2026 HUNSTER TRAFFIC. All rights reserved.</p>
      </footer>

    </body>
    </html>
  `);
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
