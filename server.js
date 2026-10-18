const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname)); // 현재 폴더의 파일을 웹에 그대로 띄웁니다.

// 임시 데이터베이스
let users = [];
let slots = [];

// 회원가입
app.post('/api/signup', (req, res) => {
    const { email, password, phone } = req.body;
    if (users.find(u => u.email === email)) {
        return res.status(400).json({ success: false, message: '이미 가입된 이메일입니다.' });
    }
    users.push({ email, password, phone });
    res.json({ success: true, message: '회원가입 완료! 로그인해 주세요.' });
});

// 로그인
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) {
        return res.status(400).json({ success: false, message: '이메일 또는 비밀번호가 틀렸습니다.' });
    }
    res.json({ success: true, message: '로그인 성공!', user: { email: user.email } });
});

// 슬롯 신청
app.post('/api/apply-slot', (req, res) => {
    const { email, serviceType, targetUrl, memo } = req.body;
    slots.push({
        id: Date.now(),
        email: email || '비회원',
        serviceType,
        targetUrl,
        memo,
        status: '승인대기',
        createdAt: new Date().toLocaleString()
    });
    res.json({ success: true, message: '슬롯 신청이 완료되었습니다!' });
});

// 신청 목록 조회
app.get('/api/admin/slots', (req, res) => {
    res.json({ success: true, slots });
});

app.listen(PORT, () => {
    console.log(`🚀 서버 실행 중! 주소창에 http://localhost:${PORT} 을 입력하세요.`);
