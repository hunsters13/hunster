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
