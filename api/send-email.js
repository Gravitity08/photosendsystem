import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end();
  }

  const { customerName, phoneNumber, deceasedName, fileInfos } = req.body;

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.EMAIL_USER,
    subject: `[사진 접수] ${new Date().toLocaleDateString()} 접수`,
    text: `${customerName} / ${phoneNumber} / ${deceasedName}\n\n${fileInfos}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: '전송 완료' });
  } catch (error) {
    res.status(500).json({ error: '메일 전송 실패' });
  }
}