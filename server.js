// 📈 순위 추적기 데이터 저장소 (db 객체에 rankTrackers 추가)
// 기존 let db = { users: [], inquiries: [], ipLogs: [], statusLogs: [] }; 대신 아래와 같이 rankTrackers를 추가해주세요.
let db = {
  users: [],
  inquiries: [],
  ipLogs: [],
  statusLogs: [],
  rankTrackers: [] // 👈 추가된 순위 추적기 DB
};

// 📈 파트너 순위 추적 상품 등록 API
app.post('/api/rank-tracker', (req, res) => {
  const { userId, userName, name, keyword, url, rank } = req.body;
  const newTracker = {
    id: Date.now(),
    userId, // 파트너 아이디
    userName, // 파트너 성함/이름
    name,
    keyword,
    url,
    rank: rank || '실시간 연동 확인중',
    date: new Date().toLocaleDateString()
  };
  db.rankTrackers.unshift(newTracker);
  saveDatabase();
  res.json({ success: true, tracker: newTracker });
});

// 📈 특정 파트너 본인만의 순위 추적 상품 조회 API (a에게는 b, c의 것이 절대 안 보임)
app.get('/api/rank-trackers', (req, res) => {
  const { userId } = req.query;
  const myTrackers = db.rankTrackers.filter(item => item.userId === userId);
  res.json(myTrackers);
});

// 👑 관리자용 전체 순위 추적 상품 통합 조회 API (관리자 센터용)
app.get('/api/admin/rank-trackers', (req, res) => {
  res.json(db.rankTrackers);
});

// 📈 순위 추적 상품 삭제 API
app.post('/api/rank-tracker/delete', (req, res) => {
  const { id, userId } = req.body;
  // 관리자이거나 본인일 경우 삭제 가능
  db.rankTrackers = db.rankTrackers.filter(item => item.id != id);
  saveDatabase();
  res.json({ success: true });
});
