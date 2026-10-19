const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  
  res.end(`
    <!DOCTYPE html>
    <html lang="ko">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>HUNSTER - Enterprise Traffic Management System</title>
      <style>
        :root {
          --bg-base: #09090b;
          --bg-sidebar: #121215;
          --bg-card: #18181b;
          --border: #27272a;
          --text-main: #f4f4f5;
          --text-sub: #a1a1aa;
          --accent: #3b82f6;
          --accent-glow: rgba(59, 130, 246, 0.15);
          --success: #10b981;
          --success-glow: rgba(16, 185, 129, 0.15);
        }

        * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
        body { background-color: var(--bg-base); color: var(--text-main); display: flex; height: 100vh; overflow: hidden; }

        /* 사이드바 */
        aside { width: 260px; background: var(--bg-sidebar); border-right: 1px solid var(--border); display: flex; flex-direction: column; justify-content: space-between; padding: 24px; }
        .brand { font-size: 1.1rem; font-weight: 700; color: var(--text-main); display: flex; align-items: center; gap: 10px; letter-spacing: -0.5px; }
        .brand span { color: var(--accent); }
        
        .nav-menu { margin-top: 40px; display: flex; flex-direction: column; gap: 6px; }
        .nav-item { padding: 12px 16px; border-radius: 8px; color: var(--text-sub); text-decoration: none; font-size: 0.9rem; font-weight: 500; display: flex; align-items: center; gap: 12px; transition: 0.2s; }
        .nav-item:hover, .nav-item.active { background: rgba(255, 255, 255, 0.05); color: var(--text-main); }
        .nav-item.active { border-left: 3px solid var(--accent); }

        .user-profile { padding-top: 20px; border-top: 1px solid var(--border); display: flex; align-items: center; gap: 12px; }
        .avatar { width: 36px; height: 36px; background: var(--accent); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; color: white; }
        .user-info div:first-child { font-size: 0.9rem; font-weight: 600; }
        .user-info div:last-child { font-size: 0.75rem; color: var(--text-sub); }

        /* 메인 컨텐츠 영역 */
        main { flex: 1; display: flex; flex-direction: column; overflow-y: auto; }
        header { height: 70px; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; padding: 0 40px; background: var(--bg-base); position: sticky; top: 0; z-index: 10; }
        .page-title { font-size: 1.25rem; font-weight: 600; letter-spacing: -0.5px; }
        .header-actions { display: flex; gap: 12px; }
        
        .btn { padding: 8px 16px; border-radius: 6px; font-size: 0.85rem; font-weight: 600; cursor: pointer; border: 1px solid var(--border); background: var(--bg-card); color: var(--text-main); transition: 0.2s; }
        .btn:hover { background: #27272a; }
        .btn-primary { background: var(--accent); border-color: var(--accent); color: white; }
        .btn-primary:hover { background: #2563eb; }

        .content-body { padding: 40px; max-width: 1400px; width: 100%; margin: 0 auto; }

        /* 통계 카드 그리드 */
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .stat-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: 12px; padding: 24px; position: relative; overflow: hidden; }
        .stat-card h4 { font-size: 0.85rem; color: var(--text-sub); font-weight: 500; margin-bottom: 8px; }
        .stat-card .value { font-size: 1.8rem; font-weight: 700; letter-spacing: -1px; }
        .stat-card .trend { font-size: 0.8rem; color: var(--success); margin-top: 8px; display: flex; align-items: center; gap: 4px; }

        /* 대시보드 섹션 */
        .dashboard-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 24px; margin-bottom: 30px; }
        @media (max-width: 1024px) { .dashboard-grid { grid-template-columns: 1fr; } }

        .panel { background: var(--bg-card); border: 1px solid var(--border); border-radius: 12px; padding: 24px; }
        .panel-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
        .panel-title { font-size: 1rem; font-weight: 600; }

        /* 데이터 테이블 */
        .data-table { width: 100%; border-collapse: collapse; text-align: left; }
        .data-table th, .data-table td { padding: 12px 16px; border-bottom: 1px solid var(--border); font-size: 0.9rem; }
        .data-table th { color: var(--text-sub); font-weight: 500; font-size: 0.8rem; text-transform: uppercase; }
        .data-table td { color: var(--text-main); }

        /* 서버 상태 리스트 */
        .server-item { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid var(--border); }
        .server-item:last-child { border-bottom: none; }
        .server-name { font-size: 0.9rem; font-weight: 500; }
        .badge { display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; border-radius: 20px; font-size: 0.75rem; font-weight: 600; }
        .badge-success { background: var(--success-glow); color: var(--success); }
      </style>
    </head>
    <body>

      <!-- 사이드바 -->
      <aside>
        <div>
          <div class="brand">
            <span>⚡</span> HUNSTER OPS
          </div>
          <div class="nav-menu">
            <a href="#" class="nav-item active">📊 대시보드 개요</a>
            <a href="#" class="nav-item">🚀 슬롯 실시간 현황</a>
            <a href="#" class="nav-item">💰 가격 및 패키지</a>
            <a href="#" class="nav-item">🛡️ 서버 안정화 모니터</a>
            <a href="#" class="nav-item">⚙️ 계정 및 설정</a>
          </div>
        </div>
        <div class="user-profile">
          <div class="avatar">H</div>
          <div class="user-info">
            <div>Hunster Admin</div>
            <div>Master Operator</div>
          </div>
        </div>
      </aside>

      <!-- 메인 화면 -->
      <main>
        <header>
          <div class="page-title">시스템 대시보드</div>
          <div class="header-actions">
            <button class="btn">시스템 로그</button>
            <button class="btn btn-primary" onclick="alert('슬롯 추가 기능 준비 중')">+ 슬롯 할당</button>
          </div>
        </header>

        <div class="content-body">
          
          <!-- 통계 카드 -->
          <div class="stats-grid">
            <div class="stat-card">
              <h4>총 활성 슬롯</h4>
              <div class="value">1,240 / 1,500</div>
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
            <div class="stat-card">
              <h4>신규 등록 대기</h4>
              <div class="value">14 건</div>
              <div class="trend">실시간 처리 대기 중</div>
            </div>
          </div>

          <!-- 대시보드 상세 패널 -->
          <div class="dashboard-grid">
            
            <!-- 왼쪽: 최근 활성 슬롯 현황 테이블 -->
            <div class="panel">
              <div class="panel-header">
                <div class="panel-title">최근 활성 슬롯 현황</div>
                <button class="btn" style="font-size: 0.75rem; padding: 4px 8px;">전체 보기</button>
              </div>
              <table class="data-table">
                <thead>
                  <tr>
                    <th>ID / 키워드</th>
                    <th>플랜</th>
                    <th>상태</th>
                    <th>트래픽 유입량</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>#KOU-9021 (쿠팡 가구류)</td>
                    <td>프로페셔널 (30일)</td>
                    <td><span class="badge badge-success">● 정상 가동</span></td>
                    <td>14,280 / h</td>
                  </tr>
                  <tr>
                    <td>#KOU-8842 (식품 카테고리)</td>
                    <td>스탠다드 (30일)</td>
                    <td><span class="badge badge-success">● 정상 가동</span></td>
                    <td>8,940 / h</td>
                  </tr>
                  <tr>
                    <td>#KOU-7710 (디지털 가전)</td>
                    <td>프로페셔널 (30일)</td>
                    <td><span class="badge badge-success">● 정상 가동</span></td>
                    <td>19,100 / h</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- 오른쪽: 서버 인프라 상태 모니터 -->
            <div class="panel">
              <div class="panel-header">
                <div class="panel-title">서버 인프라 노드</div>
                <span class="badge badge-success">ALL SYSTEMS GO</span>
              </div>
              <div class="server-list">
                <div class="server-item">
                  <span class="server-name">Proxy Node #01 (Seoul)</span>
                  <span class="badge badge-success">Online</span>
                </div>
                <div class="server-item">
                  <span class="server-name">Proxy Node #02 (Tokyo)</span>
                  <span class="badge badge-success">Online</span>
                </div>
                <div class="server-item">
                  <span class="server-name">Traffic Engine API</span>
                  <span class="badge badge-success">Online</span>
                </div>
                <div class="server-item">
                  <span class="server-name">Database Cluster</span>
                  <span class="badge badge-success">Online</span>
                </div>
              </div>
            </div>

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
