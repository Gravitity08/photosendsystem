// server/api/send-email.js

const express    = require("express");
const cors       = require("cors");
const multer     = require("multer");
const nodemailer = require("nodemailer");
const path       = require("path");

const app  = express();
const PORT = process.env.PORT || 4000;

// 1) CORS 설정
const corsOptions = {
  origin(origin, callback) {
    if (
      !origin ||
      /^https:\/\/photosendsystem-jiwg(?:-[a-z0-9-]+)?\.vercel\.app$/.test(origin) ||
      /^https:\/\/photosendsystem(?:-[a-z0-9-]+)?\.onrender\.com$/.test(origin)
    ) {
      return callback(null, true);
    }
    callback(new Error("허용되지 않은 출처입니다"));
  }
};
app.use(cors(corsOptions));
app.options("/*splat", cors(corsOptions));

// 2) React 빌드 정적 파일 서빙
const buildPath = path.resolve(__dirname, "../../client/build");
app.use(express.static(buildPath));

// 3) 바디 파서
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 4) 파일 업로드 미들웨어
const upload = multer({ storage: multer.memoryStorage() });

// 5) 메일 전송 API
app.post(
  "/send-email",
  upload.fields([{ name: "files", maxCount: 100 }]),
  async (req, res) => {
    try {
      const { customerName, phoneNumber, deceasedName } = req.body;
      const files = req.files;

      if (!customerName || !phoneNumber || !deceasedName || files.length === 0) {
        return res.status(400).json({ error: "모든 필수 항목을 입력해 주세요." });
      }

      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      const date = new Date().toISOString().split("T")[0];
      const mailOptions = {
        from: `"사진 접수 시스템" <${process.env.EMAIL_USER}>`,
        to: process.env.EMAIL_USER,
        subject: `[${date}] ${customerName}님의 사진 접수`,
        text: `- 고객 이름: ${customerName}\n- 전화번호: ${phoneNumber}\n- 고인 이름: ${deceasedName}`,
        attachments: files.map((file) => ({
          filename: file.originalname,
          content: file.buffer,
        })),
      };

      await transporter.sendMail(mailOptions);
      res.status(200).json({ message: "메일 전송 완료" });
    } catch (err) {
      console.error("메일 전송 오류:", err);
      res.status(500).json({ error: "메일 전송 실패" });
    }
  }
);

// 6) SPA용 Catch-all 라우트
app.get("/*splat", (req, res) => {
  res.sendFile(path.join(buildPath, "index.html"));
});

// 7) 서버 실행
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});