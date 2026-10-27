const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 🌟 [핵심 추가] index.html 파일을 브라우저에 띄워주기 위한 정적 파일 및 루트 라우트 설정
app.use(express.static(path.join(__dirname)));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

const DATA_FILE = path.join(__dirname, 'database.json');

// 초기 데이터 파일 생성 함수
function initDatabase() {
    if (!fs.existsSync(DATA_FILE)) {
        const initialData = {
            users: [],
            inquiries: [],
            ipLogs: [],
            statusLogs: [],
            deposits: [],
            notices: []
        };
        fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2), 'utf8');
    }
}

function readData() {
    initDatabase();
    try {
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        const parsed = JSON.parse(data);
        if (!parsed.deposits) parsed.deposits = [];
        if (!parsed.notices) parsed.notices = [];
        return parsed;
    } catch (e) {
        return { users: [], inquiries: [], ipLogs: [], statusLogs: [], deposits: [], notices: [] };
    }
}

function writeData(data) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
}

initDatabase();

// 1. 회원가입 API
app.post('/api/register', (req, res) => {
    const db = readData();
    const { name, id, pw, phone, address, businessNumber, email, service, reason, slots, storeName, targetKeyword, targetUrl, actionType } = req.body;
    
    if (db.users.some(u => u.id === id)) {
        return res.json({ success: false, message: '이미 사용 중인 아이디입니다.' });
    }

    const newUser = {
        name, id, pw, phone, address, businessNumber, email, service, reason,
        slots: parseInt(slots) || 5,
        storeName: storeName || '-',
        targetKeyword: targetKeyword || '-',
        targetUrl: targetUrl || '-',
        actionType: actionType || '단순유입',
        depositStatus: '입금대기',
        taxStatus: '발행대기',
        createdAt: new Date().toLocaleString()
    };

    db.users.push(newUser);
    
    db.deposits.unshift({
        id: Date.now(),
        name,
        phone,
        businessNumber: businessNumber || '-',
        email: email || '-',
        amount: (parseInt(slots) || 5) * 10000,
        taxIncluded: '포함',
        status: '활성',
        date: new Date().toLocaleDateString()
    });

    writeData(db);
    res.json({ success: true, message: '회원가입 완료' });
});

// 2. 로그인 API
app.post('/api/login', (req, res) => {
    const db = readData();
    const { id, pw } = req.body;
    const user = db.users.find(u => u.id === id && u.pw === pw);
    if (user) {
        res.json({ success: true, user });
    } else {
        res.json({ success: false, message: '아이디 또는 비밀번호가 일치하지 않습니다.' });
    }
});

// 3. 접속 IP 로그 기록 API
app.post('/api/log', (req, res) => {
    const db = readData();
    const { ip, name, id, time, device } = req.body;
    db.ipLogs.unshift({ ip, name, id, time, device });
    if (db.ipLogs.length > 100) db.ipLogs.pop();
    writeData(db);
    res.json({ success: true });
});

// 4. 관리자 데이터 조회 API
app.get('/api/admin/data', (req, res) => {
    const db = readData();
    res.json(db);
});

// 5. 입금 / 세금계산서 상태 토글 API
app.post('/api/admin/status', (req, res) => {
    const db = readData();
    const { userId, type } = req.body;
    const user = db.users.find(u => u.id === userId);
    if (user) {
        if (type === 'deposit') {
            user.depositStatus = user.depositStatus === '입금완료' ? '입금대기' : '입금완료';
        } else if (type === 'tax') {
            user.taxStatus = user.taxStatus === '발행완료' ? '발행대기' : '발행완료';
        }
        db.statusLogs.unshift({
            name: user.name,
            userId: user.id,
            type: type === 'deposit' ? '입금 상태' : '세금계산서 상태',
            status: type === 'deposit' ? user.depositStatus : user.taxStatus,
            time: new Date().toLocaleString()
        });
        writeData(db);
        res.json({ success: true });
    } else {
        res.status(404).json({ success: false, message: '유저를 찾을 수 없습니다.' });
    }
});

// 6. 슬롯 수량 변경 API
app.post('/api/admin/update-slots', (req, res) => {
    const db = readData();
    const { userId, slots } = req.body;
    const user = db.users.find(u => u.id === userId);
    if (user) {
        user.slots = parseInt(slots) || 5;
        writeData(db);
        res.json({ success: true });
    } else {
        res.status(404).json({ success: false });
    }
});

// 7. 파트너 삭제 API
app.post('/api/admin/delete-user', (req, res) => {
    const db = readData();
    const { userId } = req.body;
    db.users = db.users.filter(u => u.id !== userId);
    writeData(db);
    res.json({ success: true });
});

// 8. 1:1 문의 등록 API
app.post('/api/inquiry', (req, res) => {
    const db = readData();
    const { author, userId, title, content } = req.body;
    db.inquiries.unshift({
        id: Date.now(),
        author,
        userId,
        title,
        content,
        reply: '',
        status: '답변대기',
        date: new Date().toLocaleString()
    });
    writeData(db);
    res.json({ success: true });
});

// 9. 파트너별 문의 조회 API
app.get('/api/inquiries', (req, res) => {
    const db = readData();
    const { id } = req.query;
    const list = db.inquiries.filter(inq => inq.userId === id);
    res.json(list);
});

// 10. 관리자 문의 답변 등록 API
app.post('/api/admin/reply', (req, res) => {
    const db = readData();
    const { id, reply } = req.body;
    const inq = db.inquiries.find(item => item.id == id);
    if (inq) {
        inq.reply = reply;
        inq.status = reply ? '답변완료' : '답변대기';
        writeData(db);
        res.json({ success: true });
    } else {
        res.status(404).json({ success: false });
    }
});

// 11. 관리자 문의 삭제 API
app.post('/api/admin/delete-inquiry', (req, res) => {
    const db = readData();
    const { id } = req.body;
    db.inquiries = db.inquiries.filter(item => item.id != id);
    writeData(db);
    res.json({ success: true });
});

// 12. 관리자 입금 장부 직접 추가 API
app.post('/api/admin/add-deposit', (req, res) => {
    const db = readData();
    const { name, phone, businessNumber, email, amount, taxIncluded } = req.body;
    db.deposits.unshift({
        id: Date.now(),
        name,
        phone,
        businessNumber: businessNumber || '-',
        email: email || '-',
        amount: parseInt(amount) || 0,
        taxIncluded: taxIncluded || '포함',
        status: '활성',
        date: new Date().toLocaleDateString()
    });
    writeData(db);
    res.json({ success: true });
});

// 13. 입금 장부 삭제 / 복구 토글 API
app.post('/api/admin/toggle-deposit-status', (req, res) => {
    const db = readData();
    const { id } = req.body;
    const item = db.deposits.find(d => d.id == id);
    if (item) {
        item.status = item.status === '활성' ? '삭제됨' : '활성';
        writeData(db);
        res.json({ success: true });
    } else {
        res.status(404).json({ success: false });
    }
});

// 14. 관리자 공지사항 등록 API
app.post('/api/admin/add-notice', (req, res) => {
    const db = readData();
    const { title, content } = req.body;
    db.notices.unshift({
        id: Date.now(),
        title,
        content,
        date: new Date().toLocaleString()
    });
    writeData(db);
    res.json({ success: true });
});

// 15. 공지사항 삭제 API
app.post('/api/admin/delete-notice', (req, res) => {
    const db = readData();
    const { id } = req.body;
    db.notices = db.notices.filter(n => n.id != id);
    writeData(db);
    res.json({ success: true });
});

// Render 슬립 방지용 Self-Ping 메커니즘
setInterval(() => {
    const renderUrl = process.env.RENDER_EXTERNAL_URL;
    if (renderUrl) {
        const http = renderUrl.startsWith('https') ? require('https') : require('http');
        http.get(renderUrl, (res) => {
            console.log(`[Self-Ping] 서버 유지 신호 전송 완료 (상태코드: ${res.statusCode})`);
        }).on('error', (err) => {
            console.error('[Self-Ping 오류 발생]:', err.message);
        });
    }
}, 14 * 60 * 1000);

app.listen(PORT, () => {
    console.log(`HUNSTER Server running on port ${PORT}`);
});
