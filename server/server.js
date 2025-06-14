const express = require('express');
const cors = require('cors');
const multer = require('multer');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 4000;

// CORS 허용 (React와 통신)
app.use(cors());
app.use(express.json());

// 파일 업로드 설정 (uploads/ 폴더에 저장)
const upload = multer({ dest: 'uploads/' });

// 이메일 발송 처리
app.post('/send-email', upload.array('files'), async (req, res) => {
  const { customerName, phoneNumber, deceasedName } = req.body;
  const files = req.files;

  try {
    // nodemailer 설정 (Gmail 기준)
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'geneforever.send@gmail.com',      // 실제 이메일 입력
        pass: 'nxfx kpzv fepv ambe',  // 앱 비밀번호 사용 권장
      },
    });

    // 메일 내용
    const mailOptions = {
      from: `"사진접수 시스템" <너의_구글_이메일@gmail.com>`,
      to: 'geneforever001@gmail.com', // 너의 수신용 주소
      subject: `사진 접수 - ${customerName}님`,
      text: `고객 이름: ${customerName}\n전화번호: ${phoneNumber}\n고인 이름: ${deceasedName}`,
      attachments: files.map(file => ({
        filename: file.originalname,
        path: file.path
      })),
    };

    // 이메일 전송
    await transporter.sendMail(mailOptions);

    // 파일 정리 (선택)
    files.forEach(file => fs.unlinkSync(file.path));

    res.status(200).json({ message: '이메일이 성공적으로 전송되었습니다.' });
  } catch (error) {
    console.error('메일 전송 실패:', error);
    res.status(500).json({ message: '메일 전송 중 오류가 발생했습니다.', error: error.message });
  }
});

// 서버 실행
app.listen(PORT, () => {
  console.log(`✅ 이메일 서버 실행 중: http://localhost:${PORT}`);
});
