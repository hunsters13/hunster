const express = require('express');
const http = require('http');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- [메모리 데이터 베이스 및 로그 저장소] ---
let db = {
  users: [
    { id: 'admin', pw: '1234', role: 'admin', name: '총관리자' },
    { id: 'partner1', pw: '1234', role: 'partner', name: '쿠팡특공대(파트너)' },
    { id: 'partner2', pw: '1234', role: 'partner', name: '네이버플레이스랩(파트너)' }
  ],
  ledger: [
    { id: 1, date: '2026-06-07', partner: '쿠팡특공대(파트너)', type: '충전', amount: 500000, memo: '무통장 입금 확인 완료' },
    { id: 2, date: '2026-06-07', partner: '네이버플레이스랩(파트너)', type: '충전', amount: 1000000, memo: '세금계산서 발행 조건 입금' }
  ],
  deposits: [
    { id: 1, partner: '쿠팡특공대(파트너)', amount: 500000, depositor: '김쿠팡', status: '승인완료', date: '2026-06-07 10:12' },
    { id: 2, partner: '네이버플레이스랩(파트너)', amount: 300000, depositor: '이네이버', status: '대기중', date: '2026-06-07 11:45' }
  ],
  taxInvoices: [
    { partner: '쿠팡특공대(파트너)', month: '2026-05', issued: true },
    { partner: '네이버플레이ส랩(파트너)', month: '2026-05', issued: false }
  ],
  notices: [
    { id: 1, title: '[공지] 6월 쿠팡/네이버 트래픽 단가 변동 안내', date: '2026-06-01', content: '항상 협조해 주셔서 감사합니다. 6월부터 적용되는 신규 단가표를 확인해 주세요.' },
    { id: 2, title: '[필독] 입금 및 세금계산서 발행 마감 일정', date: '2026-06-05', content: '매월 말일 기준으로 세금계산서 발행이 마감되오니 누락 없으시길 바랍니다.' }
  ],
  ipLogs: []
};

// --- [IP 로깅 및 보안 미들웨어] ---
app.use((req, res, next) => {
  const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  if (!req.path.includes('/api/logs')) {
    db.ipLogs.unshift({
      ip: clientIp,
      path: req.path,
      time: new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })
    });
    if (db.ipLogs.length > 100) db.ipLogs.pop(); // 최대 100개 유지
  }
  next();
});

// --- [API 엔드포인트] ---
// 로그인
app.post('/api/login', (req, res) => {
  const { id, pw } = req.body;
  const user = db.users.find(u => u.id === id && u.pw === pw);
  if (user) {
    res.json({ success: true, user });
  } else {
    res.json({ success: false, message: '아이디 또는 비밀번호가 일치하지 않습니다.' });
  }
});

// 데이터 조회
app.get('/api/data', (req, res) => {
  res.json(db);
});

// 관리자: 장부 입력
app.post('/api/ledger/add', (req, res) => {
  const { date, partner, type, amount, memo } = req.body;
  db.ledger.unshift({ id: Date.now(), date, partner, type, amount: Number(amount), memo });
  res.json({ success: true });
});

// 파트너: 입금 신청
app.post('/api/deposit/request', (req, res) => {
  const { partner, amount, depositor } = req.body;
  db.deposits.unshift({
    id: Date.now(),
    partner,
    amount: Number(amount),
    depositor,
    status: '대기중',
    date: new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })
  });
  res.json({ success: true });
});

// 관리자: 입금 승인
app.post('/api/deposit/approve', (req, res) => {
  const { id } = req.body;
  const deposit = db.deposits.find(d => d.id === Number(id));
  if (deposit) {
    deposit.status = '승인완료';
    // 장부에도 자동 반영
    db.ledger.unshift({
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
      partner: deposit.partner,
      type: '충전(승인)',
      amount: deposit.amount,
      memo: `입금자: ${deposit.depositor}`
    });
  }
  res.json({ success: true });
});

// 관리자: 세금계산서 상태 토글
app.post('/api/tax/toggle', (req, res) => {
  const { partner, month } = req.body;
  let tax = db.taxInvoices.find(t => t.partner === partner && t.month === month);
  if (tax) {
    tax.issued = !tax.issued;
  } else {
    db.taxInvoices.push({ partner, month, issued: true });
  }
  res.json({ success: true });
});

// 관리자: 공지사항 등록
app.post('/api/notice/add', (req, res) => {
  const { title, content } = req.body;
  db.notices.unshift({
    id: Date.now(),
    title,
    content,
    date: new Date().toISOString().split('T')[0]
  });
  res.json({ success: true });
});

// 정적 파일 서빙
app.use(express.static(path.join(__dirname)));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// --- [14분 Keep-Alive 자동 핑 시스템] ---
const KEEP_ALIVE_INTERVAL = 14 * 60 * 1000; // 14분 (밀리초)
setInterval(() => {
  http.get(`http://localhost:${PORT}/api/data`, (res) => {
    console.log(`[Keep-Alive] 서버 자동 핑 전송 성공 (상태코드: ${res.statusCode}) - 슬립 방지 작동 중`);
  }).on('error', (err) => {
    console.error(`[Keep-Alive] 핑 전송 에러: ${err.message}`);
  });
}, KEEP_ALIVE_INTERVAL);

app.listen(PORT, () => {
  console.log(`🚀 HUNSTER 서버가 포트 ${PORT}번에서 완벽하게 실행 중입니다.`);
});
