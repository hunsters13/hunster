const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto'); // 내장 암호화 모듈

// 1. 데이터 저장소 및 보안/페이징 상태 관리
let users = [
  { 
    idNum: '1', 
    name: '김철수', 
    id: 'kim123', 
    pw: crypto.createHash('sha256').update('1234').digest('hex'), // 비밀번호 암호화 저장
    phone: '010-9876-5432', 
    address: '서울시 강남구', 
    service: '쿠팡 트래픽 (공산품)', 
    slots: 5, 
    depositStatus: '입금완료', 
    taxStatus: '발행완료',
    createdAt: new Date().toISOString()
  }
];

let inquiries = [
  { id: 1, author: '김철수 (kim123)', userId: 'kim123', title: '슬롯 추가 문의', content: '슬롯 연장하고 싶어요.', reply: '확인했습니다.', status: '답변완료', date: '2026-10-19' }
];

let ipLogs = [];
let sessions = {}; // 로그인 세션 토큰 관리 (JWT 대체)

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  let body = '';
  
  req.on('data', chunk => body += chunk);
  req.on('end', () => {
    const data = body ? JSON.parse(body) : {};

    // 공통 응답 헬퍼 함수
    const sendJson = (statusCode, payload) => {
      res.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify(payload));
    };

    // --- [1, 2] 회원가입 (비밀번호 SHA-256 암호화 적용) ---
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
        taxStatus: '발행대기',
        createdAt: new Date().toISOString()
      });
      return sendJson(200, { success: true });
    }

    // --- [3] 로그인 (세션 토큰 발급) ---
    if (req.method === 'POST' && url.pathname === '/api/login') {
      const hashedPw = crypto.createHash('sha256').update(data.pw).digest('hex');
      const found = users.find(u => u.id === data.id && u.pw === hashedPw);
      
      if (found) {
        const token = crypto.randomBytes(16).toString('hex'); // 간이 세션 토큰 생성
        sessions[token] = found.id;
        
        const userSafe = { ...found };
        delete userSafe.pw; // 비밀번호 제외하고 전달
        return sendJson(200, { success: true, token, user: userSafe });
      } else {
        return sendJson(200, { success: false, message: '아이디 또는 비밀번호가 틀렸습니다.' });
      }
    }

    // --- [4] 접속 로그 수집 (최대 50개 유지) ---
    if (req.method === 'POST' && url.pathname === '/api/log') {
      ipLogs.unshift(data);
      if (ipLogs.length > 50) ipLogs.pop();
      return sendJson(200, { success: true });
    }

    // --- [5] 관리자 데이터 조회 (검색 및 페이징 기능 포함) ---
    if (req.method === 'GET' && url.pathname === '/api/admin/data') {
      const search = url.searchParams.get('search') || '';
      const page = parseInt(url.searchParams.get('page') || '1');
      const limit = parseInt(url.searchParams.get('limit') || '10');

      // 검색어 필터링 (아이디 또는 이름 기준)
      const filteredUsers = users.filter(u => 
        u.id.includes(search) || u.name.includes(search)
      );

      // 페이징 처리
      const startIndex = (page - 1) * limit;
      const paginatedUsers = filteredUsers.slice(startIndex, startIndex + limit);

      return sendJson(200, {
        users: paginatedUsers,
        totalUsers: filteredUsers.length,
        inquiries,
        ipLogs
      });
    }

    // 관리자: 입금 / 세금계산서 상태 변경 토글
    if (req.method === 'POST' && url.pathname === '/api/admin/status') {
      const targetUser = users.find(u => u.idNum === data.userId || u.id === data.userId);
      if (targetUser) {
        if (data.type === 'deposit') {
          targetUser.depositStatus = targetUser.depositStatus === '입금완료' ? '입금대기' : '입금완료';
        } else {
          targetUser.taxStatus = targetUser.taxStatus === '발행완료' ? '발행대기' : '발행완료';
        }
        return sendJson(200, { success: true });
      }
      return sendJson(200, { success: false, message: '대상을 찾을 수 없습니다.' });
    }

    // 관리자: 회원 삭제
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

    // 관리자: 문의 답변
    if (req.method === 'POST' && url.pathname === '/api/admin/reply') {
      const target = inquiries.find(i => i.id == data.id);
      if (target) {
        target.reply = data.reply;
        target.status = '답변완료';
      }
      return sendJson(200, { success: true });
    }

    // 관리자: 문의 삭제
    if (req.method === 'POST' && url.pathname === '/api/admin/delete-inquiry') {
      inquiries = inquiries.filter(i => i.id != data.id);
      return sendJson(200, { success: true });
    }

    // 정적 파일(index.html) 서빙
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
