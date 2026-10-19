const http = require('http');
const fs = require('fs');
const path = require('path');

let users = [{ name: '김철수', id: 'kim123', pw: '1234', phone: '010-9876-5432', address: '서울시 강남구', service: '쿠팡 트래픽 (공산품)', slots: 5, depositStatus: '입금완료', taxStatus: '발행완료' }];
let inquiries = [{ id: 1, author: '김철수 (kim123)', title: '슬롯 추가 문의', content: '슬롯 연장하고 싶어요.', reply: '확인했습니다.', status: '답변완료', date: '2026-10-19' }];
let ipLogs = [];

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  let body = '';
  req.on('data', chunk => body += chunk);
  req.on('end', () => {
    const data = body ? JSON.parse(body) : {};

    if (req.method === 'POST' && url.pathname === '/api/register') {
      if (users.some(u => u.id === data.id)) {
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        return res.end(JSON.stringify({ success: false, message: '이미 존재하는 아이디입니다.' }));
      }
      users.push({ ...data, service: '쿠팡 트래픽 (' + (data.coupangSub === 'industrial' ? '공산품' : '농산물') + ')', depositStatus: '입금대기', taxStatus: '발행대기' });
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      return res.end(JSON.stringify({ success: true }));
    }

    if (req.method === 'POST' && url.pathname === '/api/login') {
      const found = users.find(u => u.id === data.id && u.pw === data.pw);
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      return res.end(JSON.stringify(found ? { success: true, user: found } : { success: false }));
    }

    if (req.method === 'POST' && url.pathname === '/api/log') {
      ipLogs.unshift(data);
      if (ipLogs.length > 50) ipLogs.pop();
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      return res.end(JSON.stringify({ success: true }));
    }

    if (req.method === 'GET' && url.pathname === '/api/admin/data') {
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      return res.end(JSON.stringify({ users, inquiries, ipLogs }));
    }

    if (req.method === 'POST' && url.pathname === '/api/admin/status') {
      if (data.type === 'deposit') {
        users[data.index].depositStatus = users[data.index].depositStatus === '입금완료' ? '입금대기' : '입금완료';
      } else {
        users[data.index].taxStatus = users[data.index].taxStatus === '발행완료' ? '발행대기' : '발행완료';
      }
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      return res.end(JSON.stringify({ success: true }));
    }

    if (req.method === 'POST' && url.pathname === '/api/admin/delete-user') {
      users.splice(data.index, 1);
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      return res.end(JSON.stringify({ success: true }));
    }

    if (req.method === 'POST' && url.pathname === '/api/inquiry') {
      inquiries.unshift({ id: Date.now(), author: data.author, userId: data.userId, title: data.title, content: data.content, reply: '', status: '답변대기', date: new Date().toLocaleDateString() });
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      return res.end(JSON.stringify({ success: true }));
    }

    if (req.method === 'GET' && url.pathname === '/api/inquiries') {
      const userId = url.searchParams.get('id');
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      return res.end(JSON.stringify(inquiries.filter(i => i.author.includes(userId))));
    }

    if (req.method === 'POST' && url.pathname === '/api/admin/reply') {
      const target = inquiries.find(i => i.id == data.id);
      if (target) { target.reply = data.reply; target.status = '답변완료'; }
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      return res.end(JSON.stringify({ success: true }));
    }

    if (req.method === 'POST' && url.pathname === '/api/admin/delete-inquiry') {
      inquiries = inquiries.filter(i => i.id != data.id);
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      return res.end(JSON.stringify({ success: true }));
    }

    fs.readFile(path.join(__dirname, 'index.html'), (err, content) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
        return res.end('Error');
      }
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(content);
    });
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
