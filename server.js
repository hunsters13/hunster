const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(`<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>HUNSTER - Enterprise Traffic</title>
  <link href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Pretendard', sans-serif; }
    body { background-color: #f8fafc; color: #0f172a; display: flex; justify-content: center; align-items: center; height: 100vh; text-align: center; }
    .card { background: white; padding: 40px; border-radius: 20px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; max-width: 500px; width: 100%; }
    h1 { font-size: 1.8rem; font-weight: 900; color: #2563eb; margin-bottom: 12px; }
    p { color: #64748b; font-size: 0.95rem; line-height: 1.5; }
  </style>
</head>
<body>
  <div class="card">
    <h1>HUNSTER TRAFFIC</h1>
    <p>서버가 성공적으로 정상 가동되었습니다.<br>고성능 프록시 트래픽 관제 시스템이 준비 중입니다.</p>
  </div>
</body>
</html>`);
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
