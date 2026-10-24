const express = require('express');
const app = express();
const fs = require('fs');
const https = require('https');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

const DB_FILE = './database.json';

let db = {
  users: [],
  inquiries: [],
  ipLogs: [],
  statusLogs: []
};

// 🛡️ [데이터 보존 안전장치] 서버 재시작 시 기존 회원 데이터 유실 절대 방지
if (fs.existsSync(DB_FILE)) {
  try {
    const data = fs.readFileSync(DB_FILE, 'utf8');
    const parsed = JSON.parse(data);
    db.users = parsed.users || [];
    db.inquiries = parsed.inquiries || [];
    db.ipLogs = parsed.ipLogs || [];
    db.statusLogs = parsed.statusLogs || [];
  } catch (err) {
    console.error('DB 로드 에러:', err);
  }
} else {
  saveDatabase();
}

function saveDatabase() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf8');
  } catch (err) {
    console.error('DB 저장 에러:', err);
  }
}

// 방문 및 접속 IP 로그 기록
app.post('/api/log', (req, res) => {
  const { ip, name, id, time, device } = req.body;
  db.ipLogs.unshift({ ip, name, id, time, device });
  if (db.ipLogs.length > 50) db.ipLogs.pop();
  saveDatabase();
  res.json({ success: true });
});

// 회원가입 (플랫폼별 상세 세팅 수용)
app.post('/api/register', (req, res) => {
  const { name, id, pw, phone, address, businessNumber, email, service, reason, slots, storeName, targetKeyword, targetUrl, actionType, gpsSetting, rankStatus } = req.body;
  
  const existing = db.users.find(u => u.id === id);
  if (existing) {
    return res.json({ success: false, message: '이미 존재하는 아이디입니다.' });
  }

  const newUser = {
    name,
    id,
    pw,
    phone,
    address,
    businessNumber,
    email,
    service: service || '쿠팡 트래픽',
    reason,
    slots: slots || 5,
    storeName: storeName || '-',
    targetKeyword: targetKeyword || '-',
    targetUrl: targetUrl || '-',
    actionType: actionType || '단순유입',
    gpsSetting: gpsSetting || '서울 강남구 (기본)',
    rankStatus: rankStatus || '진입 대기중 (권장)',
    depositStatus: '입금대기',
    taxStatus: '발행대기',
    spamFilter: '정상 (Clean)'
  };

  db.users.push(newUser);
  saveDatabase();

  res.json({ success: true, message: '회원가입이 완료되었습니다.' });
});

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

// 관리자 데이터 조회
app.get('/api/admin/data', (req, res) => {
  res.json({ 
    users: db.users, 
    inquiries: db.inquiries, 
    ipLogs: db.ipLogs,
    statusLogs: db.statusLogs 
  });
});

// 입금 / 세금계산서 상태 토글 및 이력 기록
app.post('/api/admin/status', (req, res) => {
  const { userId, type } = req.body;
  const user = db.users.find(u => u.id === userId);
  if (user) {
    let statusText = '';
    let typeName = '';
    if (type === 'deposit') {
      user.depositStatus = user.depositStatus === '입금대기' ? '입금완료' : '입금대기';
      typeName = '입금 상태';
      statusText = user.depositStatus;
    } else if (type === 'tax') {
      user.taxStatus = user.taxStatus === '발행대기' ? '발행완료' : '발행대기';
      typeName = '세금계산서';
      statusText = user.taxStatus;
    }
    
    db.statusLogs.unshift({
      name: user.name,
      userId: user.id,
      type: typeName,
      status: statusText,
      time: new Date().toLocaleString()
    });
    if (db.statusLogs.length > 50) db.statusLogs.pop();

    saveDatabase();
    res.json({ success: true, user });
  } else {
    res.json({ success: false });
  }
});

// 파트너 슬롯 수량 수정 및 승인 (관리자용)
app.post('/api/admin/update-slots', (req, res) => {
  const { userId, slots } = req.body;
  const user = db.users.find(u => u.id === userId);
  if (user) {
    user.slots = parseInt(slots) || user.slots;
    
    db.statusLogs.unshift({
      name: user.name,
      userId: user.id,
      type: '슬롯 수량 변경',
      status: `${user.slots} 슬롯으로 확정`,
      time: new Date().toLocaleString()
    });
    if (db.statusLogs.length > 50) db.statusLogs.pop();

    saveDatabase();
    res.json({ success: true, user });
  } else {
    res.json({ success: false, message: '사용자를 찾을 수 없습니다.' });
  }
});

// 회원 삭제
app.post('/api/admin/delete-user', (req, res) => {
  const { userId } = req.body;
  db.users = db.users.filter(u => u.id !== userId);
  saveDatabase();
  res.json({ success: true });
});

// 1:1 문의 등록
app.post('/api/inquiry', (req, res) => {
  const { author, userId, title, content } = req.body;
  const newInq = {
    id: Date.now(),
    author,
    userId,
    title,
    content,
    status: '답변대기',
    reply: '',
    date: new Date().toLocaleDateString()
  };
  db.inquiries.push(newInq);
  saveDatabase();
  res.json({ success: true });
});

// 문의 내역 조회
app.get('/api/inquiries', (req, res) => {
  const { id } = req.query;
  const myInqs = db.inquiries.filter(inq => inq.userId === id);
  res.json(myInqs);
});

// 관리자 답변 등록
app.post('/api/admin/reply', (req, res) => {
  const { id, reply } = req.body;
  const inq = db.inquiries.find(item => item.id == id);
  if (inq) {
    inq.reply = reply;
    inq.status = '답변완료';
    saveDatabase();
  }
  res.json({ success: true });
});

// 문의 삭제
app.post('/api/admin/delete-inquiry', (req, res) => {
  const { id } = req.body;
  db.inquiries = db.inquiries.filter(item => item.id != id);
  saveDatabase();
  res.json({ success: true });
});

// 서버 실행 및 Self-Ping (14분 간격)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`HUNSTER Server running on port ${PORT}`);

  setInterval(() => {
    const renderUrl = process.env.RENDER_EXTERNAL_URL;
    if (renderUrl) {
      https.get(renderUrl, (res) => {}).on('error', () => {});
    }
  }, 14 * 60 * 1000);
});
