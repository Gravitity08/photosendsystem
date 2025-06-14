export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const multer = require('multer');
  const nodemailer = require('nodemailer');
  const formidable = require('formidable'); // 서버리스에서 파일 파싱용
  const fs = require('fs');

  const form = new formidable.IncomingForm({ multiples: true });

  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).json({ error: '파일 파싱 실패' });

    // fields: customerName, phoneNumber, deceasedName
    // files: 첨부된 파일들
    // 이메일 발송 처리 진행...

    return res.status(200).json({ message: '전송 완료' });
  });
}
