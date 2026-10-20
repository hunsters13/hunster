const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

let users = [
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
];

let inquiries = [
  { id: 1, author: '김철수 (kim123)', userId: 'kim123', title: '슬롯 추가 문의', content: '슬롯 연장하고 싶어요.', reply: '확인했습니다.', status: '답변완료', date: '2026-10-19' }
];

let ipLogs = [];
let statusLogs = []; // 파트너들이 입금/세금계산서 변경 내역을 명확히 확인할 수 있는 로그 저장소
let sessions = {};

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

    // 회원가입
    if (req.method === 'POST' && url.pathname === '/api/register') {
      if (users.some(u => u.id === data.id)) {
        return sendJson(200, { success: false, message: '이미 존재하는 아이디입니다.' });
      }
      
      const hashedPw = crypto.createHash('sha256').update(data.pw).digest('hex');
      users.push({
        idNum: Date.now().toString(),
        name: data.name,
        id: data.id,
        pw: hashedPw,
        phone: data.phone,
        address: data.address,
        service: '쿠팡 트래픽 (' + (data.coupangSub === 'industrial' ? '공산품' : '농산물') + ')',
        slots: 5,
        depositStatus: '입금대기',
        depositTime: '',
        taxStatus: '발행대기',
        taxTime: '',
        createdAt: new Date().toISOString()
      });
      return sendJson(200, { success: true });
    }

    // 로그인
    if (req.method === 'POST' && url.pathname === '/api/login') {
      const hashedPw = crypto.createHash('sha256').update(data.pw).digest('hex');
      const found = users.find(u => u.id === data.id && u.pw === hashedPw);
      
      if (found) {
        const token = crypto.randomBytes(16).toString('hex');
        sessions[token] = found.id;
        const userSafe = { ...found };
        delete userSafe.pw;
        return sendJson(200, { success: true, token, user: userSafe });
      } else {
        return sendJson(200, { success: false, message: '아이디 또는 비밀번호가 틀렸습니다.' });
      }
    }

    // 접속 로그 수집
    if (req.method === 'POST' && url.pathname === '/api/log') {
      ipLogs.unshift(data);
      if (ipLogs.length > 50) ipLogs.pop();
      return sendJson(200, { success: true });
    }

    // 관리자 데이터 조회 (상태 변경 로그 목록도 함께 전달하여 파트너들이 확인 가능하게 함)
    if (req.method === 'GET' && url.pathname === '/api/admin/data') {
      const search = url.searchParams.get('search') || '';
      const page = parseInt(url.searchParams.get('page') || '1');
      const limit = parseInt(url.searchParams.get('limit') || '10');

      const filteredUsers = users.filter(u => 
        u.id.includes(search) || u.name.includes(search)
      );

      const startIndex = (page - 1) * limit;
      const paginatedUsers = filteredUsers.slice(startIndex, startIndex + limit);

      return sendJson(200, {
        users: paginatedUsers,
        totalUsers: filteredUsers.length,
        inquiries,
        ipLogs,
        statusLogs // 파트너 확인용 상태 변경 이력 전달
      });
    }

    // ⭐ [핵심 수정] 입금 / 세금계산서 상태 토글 (버그 해결 및 상세 로그 기록)
    if (req.method === 'POST' && url.pathname === '/api/admin/status') {
      // index, userId, 또는 id 중 어떤 값으로 넘어와도 정확히 매칭되도록 보완
      const targetUser = users.find(u => 
        u.idNum === String(data.userId) || 
        u.id === data.userId || 
        users.indexOf(u) === Number(data.index)
      );

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

        // 파트너들이 명확히 볼 수 있도록 상태 변경 로그에 추가
        statusLogs.unshift({
          id: Date.now(),
          name: targetUser.name,
          userId: targetUser.id,
          type: data.type === 'deposit' ? '입금 관리' : '세금계산서 관리',
          status: actionDescription,
          time: nowTime
        });
        if (statusLogs.length > 50) statusLogs.pop();

        return sendJson(200, { success: true });
      }
      return sendJson(200, { success: false, message: '대상을 찾을 수 없습니다.' });
    }

    // 회원 삭제
    if (req.method === 'POST' && url.pathname === '/api/admin/delete-user') {
      users = users.filter(u => u.idNum !== data.userId && u.id !== data.userId);
      return sendJson(200, { success: true });
    }

    // 문의 등록
    if (req.method === 'POST' && url.pathname === '/api/inquiry') {
      inquiries.unshift({
        id: Date.now(),
        author: data.author,
        userId: data.userId,
        title: data.title,
        content: data.content,
        reply: '',
        status: '답변대기',
        date: new Date().toLocaleDateString()
      });
      return sendJson(200, { success: true });
    }

    // 문의 조회
    if (req.method === 'GET' && url.pathname === '/api/inquiries') {
      const userId = url.searchParams.get('id');
      const userInquiries = userId ? inquiries.filter(i => i.author.includes(userId) || i.userId === userId) : inquiries;
      return sendJson(200, userInquiries);
    }

    // 관리자 문의 답변
    if (req.method === 'POST' && url.pathname === '/api/admin/reply') {
      const target = inquiries.find(i => i.id == data.id);
      if (target) {
        target.reply = data.reply;
        target.status = '답변완료';
      }
      return sendJson(200, { success: true });
    }

    // 관리자 문의 삭제
    if (req.method === 'POST' && url.pathname === '/api/admin/delete-inquiry') {
      inquiries = inquiries.filter(i => i.id != data.id);
      return sendJson(200, { success: true });
    }

    // 정적 파일 서빙
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
server.listen(PORT, () => console.log(`Server running smoothly on port ${PORT}`));
