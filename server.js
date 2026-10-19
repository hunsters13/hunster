const http = require('http');
const fs = require('fs');
const path = require('path');

let serverUsers = [
  { name: '김철수', id: 'kim123', pw: '1234', phone: '010-9876-5432', address: '서울시 강남구 테헤란로 456', service: '쿠팡 트래픽 (공산품)', slots: 5, depositStatus: '입금완료', taxStatus: '발행완료' }
];

let serverInquiries = [
  { id: 1, author: '김철수 (kim123)', title: '슬롯 추가 문의드립니다.', content: '슬롯 5개 추가 연장하고 싶어요.', reply: '확인 후 처리해드리겠습니다.', status: '답변완료', date: '2026-10-19' }
];

let serverIpLogs = [];

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  
  if (req.method === 'POST' && url.pathname === '/api/register') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      const data = JSON.parse(body);
      if (serverUsers.some(u => u.id === data.id)) {
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ success: false, message: '이미 존재하는 아이디입니다.' }));
        return;
      }
      serverUsers.push({
        name: data.name,
        id: data.id,
        pw: data.pw,
        phone: data.phone,
        address: data.address,
        service: '쿠팡 트래픽 (' + (data.coupangSub === 'industrial' ? '공산품' : '농산물') + ')',
        slots: data.slots,
        depositStatus: '입금대기',
        taxStatus: '발행대기'
      });
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ success: true }));
    });
    return;
  }

  if (req.method === 'POST' && url.pathname === '/api/login') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      const { id, pw } = JSON.parse(body);
      const found = serverUsers.find(u => u.id === id && u.pw === pw);
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      if (found) {
        res.end(JSON.stringify({ success: true, user: found }));
      } else {
        res.end(JSON.stringify({ success: false }));
      }
    });
    return;
  }

  if (req.method === 'POST' && url.pathname === '/api/log') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      serverIpLogs.unshift(JSON.parse(body));
      if (serverIpLogs.length > 50) serverIpLogs.pop();
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ success: true }));
    });
    return;
  }

  if (req.method === 'GET' && url.pathname === '/api/admin/data') {
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ users: serverUsers, inquiries: serverInquiries, ipLogs: serverIpLogs }));
    return;
  }

  if (req.method === 'POST' && url.pathname === '/api/admin/status') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      const { index, type } = JSON.parse(body);
      if (type === 'deposit') {
        serverUsers[index].depositStatus = serverUsers[index].depositStatus === '입금완료' ? '입금대기' : '입금완료';
      } else {
        serverUsers[index].taxStatus = serverUsers[index].taxStatus === '발행완료' ? '발행대기' : '발행완료';
      }
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ success: true }));
    });
    return;
  }

  if (req.method === 'POST' && url.pathname === '/api/inquiry') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      const data = JSON.parse(body);
      serverInquiries.unshift({
        id: Date.now(),
        author: data.author,
        userId: data.userId,
        title: data.title,
        content: data.content,
        reply: '',
        status: '답변대기',
        date: new Date().toLocaleDateString()
      });
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ success: true }));
    });
    return;
  }

  if (req.method === 'GET' && url.pathname === '/api/inquiries') {
    const userId = url.searchParams.get('id');
    const myInq = serverInquiries.filter(i => i.author.includes(userId));
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify(myInq));
    return;
  }

  if (req.method === 'POST' && url.pathname === '/api/admin/reply') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      const { id, reply } = JSON.parse(body);
      const target = serverInquiries.find(i => i.id == id);
      if (target) {
        target.reply = reply;
        target.status = '답변완료';
      }
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ success: true }));
    });
    return;
  }

  const filePath = path.join(__dirname, 'index.html');
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Internal Server Error');
      return;
    }
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(data);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
