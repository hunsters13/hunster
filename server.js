const express = require('express');
const app = express();
const fs = require('fs');
const { SolapiMessageService } = require('solapi');

// 미들웨어 설정
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 루트 경로 접속 시 index.html 파일 렌더링
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// 데이터 파일(JSON) 불러오기 및 저장 함수
const DB_FILE = './database.json';

let db = {
  users: [],
  inquiries: [],
  ipLogs: [],
  statusLogs: []
};

// 서버가 켜질 때 기존 데이터 불러오기
if (fs.existsSync(DB_FILE)) {
  try {
    const data = fs.readFileSync(DB_FILE, 'utf8');
    db = JSON.parse(data);
  } catch (err) {
    console.error('데이터 파일을 읽는 중 오류 발생:', err);
  }
}

// 데이터를 파일에 저장하는 함수
function saveDatabase() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf8');
  } catch (err) {
    console.error('데이터를 저장하는 중 오류 발생:', err);
  }
}

// 방문자 로그 기록
app.post('/api/log', (req, res) => {
  const { ip, name, id, time, device } = req.body;
  db.ipLogs.unshift({ ip, name, id, time, device });
  if (db.ipLogs.length > 50) db.ipLogs.pop();
  saveDatabase();
  res.json({ success: true });
});

// 회원가입 API
app.post('/api/register', async (req, res) => {
  const { name, id, pw, phone, address, coupangSub, slots } = req.body;
  
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
    service: coupangSub === 'agricultural' ? '쿠팡 농산물 트래픽' : '쿠팡 공산품 트래픽',
    slots: slots || 5,
    depositStatus: '입금대기',
    taxStatus: '발행대기'
  };

  db.users.push(newUser);
  saveDatabase(); // 파일에 즉시 저장!

  try {
    /*
    const messageService = new SolapiMessageService('API_KEY', 'API_SECRET');
    await messageService.send({
      to: phone,
      from: '발신번호',
      text: `[훈스터] ${name} 파트너님, 회원가입이 완료되었습니다.`
    });
    */
  } catch (err) {
    console.error('알림 발송 실패:', err);
  }

  res.json({ success: true, message: '회원가입이 완료되었습니다.' });
});

// 로그인 API
app.post('/api/login', (req, res) => {
  const { id, pw } = req.body;
  const user = db.users.find(u => u.id === id && u.pw === pw);
  if (user) {
    res.json({ success: true, user });
  } else {
    res.json({ success: false, message: '아이디 또는 비밀번호가 일치하지 않습니다.' });
  }
});

// 관리자 데이터 조회 API
app.get('/api/admin/data', (req, res) => {
  res.json({ 
    users: db.users, 
    inquiries: db.inquiries, 
    ipLogs: db.ipLogs, 
    statusLogs: db.statusLogs 
  });
});

// 입금 / 세금계산서 상태 토글 API
app.post('/api/admin/status', (req, res) => {
  const { userId, type } = req.body;
  const user = db.users.find(u => u.id === userId);
  if (user) {
    let changedStatus = '';
    if (type === 'deposit') {
      user.depositStatus = user.depositStatus === '입금대기' ? '입금완료' : '입금대기';
      changedStatus = user.depositStatus;
    } else if (type === 'tax') {
      user.taxStatus = user.taxStatus === '발행대기' ? '발행완료' : '발행대기';
      changedStatus = user.taxStatus;
    }

    db.statusLogs.unshift({
      name: user.name,
      userId: user.id,
      type: type === 'deposit' ? '입금 상태' : '세금계산서',
      status: changedStatus,
      time: new Date().toLocaleString()
    });

    saveDatabase();
    res.json({ success: true, user });
  } else {
    res.json({ success: false });
  }
});

// 회원 삭제 API
app.post('/api/admin/delete-user', (req, res) => {
  const { userId } = req.body;
  db.users = db.users.filter(u => u.id !== userId);
  saveDatabase();
  res.json({ success: true });
});

// 1:1 문의 등록 API
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

// 사용자별 문의 내역 조회 API
app.get('/api/inquiries', (req, res) => {
  const { id } = req.query;
  const myInqs = db.inquiries.filter(inq => inq.userId === id);
  res.json(myInqs);
});

// 관리자 답변 등록 API
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

// 1:1 문의 삭제 API
app.post('/api/admin/delete-inquiry', (req, res) => {
  const { id } = req.body;
  db.inquiries = db.inquiries.filter(item => item.id != id);
  saveDatabase();
  res.json({ success: true });
});

// 서버 실행
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`HUNSTER Server running on port ${PORT}`);
});
