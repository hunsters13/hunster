const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DATA_FILE = path.join(__dirname, 'data.json');

let db = {
  users: [
    { 
      idNum: '1', 
      name: '김철수', 
      id: 'kim123', 
      pw: crypto.createHash('sha256').update('1234').digest('hex'), 
      phone: '010-9876-5432', 
      address: '서울시 강남구', 
      service: '쿠팡 트래픽 (공산품)', 
      slots: 5, 
      depositStatus: '입금대기', 
      depositTime: '',
      taxStatus: '발행대기',
      taxTime: '',
      createdAt: new Date().toISOString()
    }
  ],
  inquiries: [],
  ipLogs: [],
  statusLogs: [],
  withdrawnPhones: [] // 탈퇴된 회원의 전화번호 블랙리스트 저장소
};

function loadData() {
  if (fs.existsSync(DATA_FILE)) {
    try {
      db = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
      if(!db.withdrawnPhones) db.withdrawnPhones = [];
    } catch (e) {}
  } else {
    saveData();
  }
}

function saveData() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2), 'utf8');
  } catch (e) {}
}

loadData();

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  let body = '';
  
  req.on('data', chunk => body += chunk);
  req.on('end', () => {
    const data = body ? JSON.parse(body) : {};

    const sendJson = (statusCode, payload) => {
      res.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify(payload));
    };

    // 회원가입 (탈퇴된 전화번호/아이디 재가입 차단 로직 포함)
    if (req.method === 'POST' && url.pathname === '/api/register') {
      if (db.withdrawnPhones.includes(data.phone)) {
        return sendJson(200, { success: false, message: '탈퇴 처리된 이력 이 있는 전화번호입니다. 재가입이 제한됩니다.' });
      }
      if (db.users.some(u => u.id === data.id)) {
        return sendJson(200, { success: false, message: '이미 존재하는 아이디입니다.' });
      }
      if (db.users.some(u => u.phone === data.phone)) {
        return sendJson(200, { success: false, message: '이미 등록된 연락처입니다.' });
      }
      
      const hashedPw = crypto.createHash('sha256').update(data.pw).digest('hex');
      db.users.push({
        idNum: Date.now().toString(),
        name: data.name,
        id: data.id,
        pw: hashedPw,
        phone: data.phone,
        address: data.address,
        service: '쿠팡 트래픽 (' + (data.coupangSub === 'industrial' ? '공산품' : '농산물') + ')',
        slots: data.slots || 5,
        depositStatus: '입금대기',
        depositTime: '',
        taxStatus: '발행대기',
        taxTime: '',
        createdAt: new Date().toISOString()
      });
      saveData();
      return sendJson(200, { success: true });
    }

    // 로그인 (탈퇴된 계정인지 한 번 더 체크)
    if (req.method === 'POST' && url.pathname === '/api/login') {
      const hashedPw = crypto.createHash('sha256').update(data.pw).digest('hex');
      const found = db.users.find(u => u.id === data.id && u.pw === hashedPw);
      
      if (found) {
        if (db.withdrawnPhones.includes(found.phone)) {
          return sendJson(200, { success: false, message: '관리자에 의해 탈퇴 처리된 계정입니다.' });
        }
        const userSafe = { ...found };
        delete userSafe.pw;
        return sendJson(200, { success: true, user: userSafe });
      } else {
        return sendJson(200, { success: false, message: '아이디 또는 비밀번호가 틀렸습니다.' });
      }
    }

    // 방문자 로그
    if (req.method === 'POST' && url.pathname === '/api/log') {
      db.ipLogs.unshift(data);
      if (db.ipLogs.length > 50) db.ipLogs.pop();
      saveData();
      return sendJson(200, { success: true });
    }

    // 관리자 데이터 조회
    if (req.method === 'GET' && url.pathname === '/api/admin/data') {
      return sendJson(200, {
        users: db.users,
        totalUsers: db.users.length,
        inquiries: db.inquiries,
        ipLogs: db.ipLogs,
        statusLogs: db.statusLogs
      });
    }

    // 상태 토글
    if (req.method === 'POST' && url.pathname === '/api/admin/status') {
      const targetUser = db.users.find(u => u.idNum === String(data.userId) || u.id === data.userId);
      if (targetUser) {
        const nowTime = new Date().toLocaleString();
        let actionDescription = '';

        if (data.type === 'deposit') {
          targetUser.depositStatus = targetUser.depositStatus === '입금완료' ? '입금대기' : '입금완료';
          targetUser.depositTime = targetUser.depositStatus === '입금완료' ? nowTime : '';
          actionDescription = `입금 상태가 [${targetUser.depositStatus}] (으)로 변경됨`;
        } else {
          targetUser.taxStatus = targetUser.taxStatus === '발행완료' ? '발행대기' : '발행완료';
          targetUser.taxTime = targetUser.taxStatus === '발행완료' ? nowTime : '';
          actionDescription = `세금계산서 상태가 [${targetUser.taxStatus}] (으)로 변경됨`;
        }

        db.statusLogs.unshift({
          id: Date.now(),
          name: targetUser.name,
          userId: targetUser.id,
          type: data.type === 'deposit' ? '입금 관리' : '세금계산서 관리',
          status: actionDescription,
          time: nowTime
        });
        if (db.statusLogs.length > 50) db.statusLogs.pop();

        saveData();
        return sendJson(200, { success: true });
      }
      return sendJson(200, { success: false });
    }

    // 회원 삭제 (탈퇴 처리 및 전화번호 블랙리스트 등록)
    if (req.method === 'POST' && url.pathname === '/api/admin/delete-user') {
      const targetUser = db.users.find(u => u.idNum === String(data.userId) || u.id === data.userId);
      if (targetUser) {
        if (targetUser.phone && !db.withdrawnPhones.includes(targetUser.phone)) {
          db.withdrawnPhones.push(targetUser.phone);
        }
      }
      db.users = db.users.filter(u => u.idNum !== String(data.userId) && u.id !== data.userId);
      saveData();
      return sendJson(200, { success: true });
    }

    // 문의 등록
    if (req.method === 'POST' && url.pathname === '/api/inquiry') {
      db.inquiries.unshift({
        id: Date.now(),
        author: data.author,
        userId: data.userId,
        title: data.title,
        content: data.content,
        reply: '',
        status: '답변대기',
        date: new Date().toLocaleDateString()
      });
      saveData();
      return sendJson(200, { success: true });
    }

    if (req.method === 'GET' && url.pathname === '/api/inquiries') {
      const userId = url.searchParams.get('id');
      const userInquiries = userId ? db.inquiries.filter(i => i.author.includes(userId) || i.userId === userId) : db.inquiries;
      return sendJson(200, userInquiries);
    }

    if (req.method === 'POST' && url.pathname === '/api/admin/reply') {
      const target = db.inquiries.find(i => i.id == data.id);
      if (target) {
        target.reply = data.reply;
        target.status = '답변완료';
        saveData();
      }
      return sendJson(200, { success: true });
    }

    if (req.method === 'POST' && url.pathname === '/api/admin/delete-inquiry') {
      db.inquiries = db.inquiries.filter(i => i.id != data.id);
      saveData();
      return sendJson(200, { success: true });
    }

    fs.readFile(path.join(__dirname, 'index.html'), (err, content) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
        return res.end('Error loading index.html');
      }
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(content);
    });
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
// 예시: 솔라피(Solapi) SDK를 사용한 문자/알림톡 전송 로직 (Node.js 백엔드)
const { SolapiMessageService } = require('solapi');
const messageService = new SolapiMessageService('API_KEY', 'API_SECRET');

// 회원가입 완료 시 호출되는 API 내부
app.post('/api/register', async (req, res) => {
  const { name, id, pw, phone, address, coupangSub, slots } = req.body;
  
  // 1. 회원 정보 DB 저장 로직 ...

  // 2. 가입 완료 카카오톡(또는 문자) 자동 전송
  try {
    await messageService.send({
      to: phone, // 사용자가 입력한 전화번호
      from: '발신번호등록된번호',
      text: `[훈스터] ${name} 파트너님, 회원가입이 완료되었습니다. 5슬롯 이상 가동을 위해 안내된 계좌로 입금을 진행해주세요.`
    });
  } catch (error) {
    console.error('알림 발송 실패:', error);
  }

  res.json({ success: true, message: '회원가입 및 알림 전송 완료' });
});
