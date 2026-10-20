const express = require('express');
const app = express();
const { SolapiMessageService } = require('solapi');

// 미들웨어 설정
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// 인메모리 데이터 저장소
let users = [];
let inquiries = [];
let ipLogs = [];
let statusLogs = [];

// 방문자 로그 기록
app.post('/api/log', (req, res) => {
  const { ip, name, id, time, device } = req.body;
  ipLogs.unshift({ ip, name, id, time, device });
  if (ipLogs.length > 50) ipLogs.pop();
  res.json({ success: true });
});

// 회원가입 API
app.post('/api/register', async (req, res) => {
  const { name, id, pw, phone, address, coupangSub, slots } = req.body;
  
  const existing = users.find(u => u.id === id);
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

  users.push(newUser);

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
  const user = users.find(u => u.id === id && u.pw === pw);
  if (user) {
    res.json({ success: true, user });
  } else {
    res.json({ success: false, message: '아이디 또는 비밀번호가 일치하지 않습니다.' });
  }
});

// 관리자 데이터 조회 API
app.get('/api/admin/data', (req, res) => {
  res.json({ users, inquiries, ipLogs, statusLogs });
});

// 입금 / 세금계산서 상태 토글 API
app.post('/api/admin/status', (req, res) => {
  const { userId, type } = req.body;
  const user = users.find(u => u.id === userId);
  if (user) {
    let changedStatus = '';
    if (type === 'deposit') {
      user.depositStatus = user.depositStatus === '입금대기' ? '입금완료' : '입금대기';
      changedStatus = user.depositStatus;
    } else if (type === 'tax') {
      user.taxStatus = user.taxStatus === '발행대기' ? '발행완료' : '발행대기';
      changedStatus = user.taxStatus;
    }

    statusLogs.unshift({
      name: user.name,
      userId: user.id,
      type: type === 'deposit' ? '입금 상태' : '세금계산서',
      status: changedStatus,
      time: new Date().toLocaleString()
    });

    res.json({ success: true, user });
  } else {
    res.json({ success: false });
  }
});

// 회원 삭제 API
app.post('/api/admin/delete-user', (req, res) => {
  const { userId } = req.body;
  users = users.filter(u => u.id !== userId);
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
  inquiries.push(newInq);
  res.json({ success: true });
});

// 사용자별 문의 내역 조회 API
app.get('/api/inquiries', (req, res) => {
  const { id } = req.query;
  const myInqs = inquiries.filter(inq => inq.userId === id);
  res.json(myInqs);
});

// 관리자 답변 등록 API
app.post('/api/admin/reply', (req, res) => {
  const { id, reply } = req.body;
  const inq = inquiries.find(item => item.id == id);
  if (inq) {
    inq.reply = reply;
    inq.status = '답변완료';
  }
  res.json({ success: true });
});

// 1:1 문의 삭제 API
app.post('/api/admin/delete-inquiry', (req, res) => {
  const { id } = req.body;
  inquiries = inquiries.filter(item => item.id != id);
  res.json({ success: true });
});

// 서버 실행
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`HUNSTER Server running on port ${PORT}`);
});
