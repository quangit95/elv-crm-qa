import express from 'express';
import { PrismaClient } from '@prisma/client';
import multer from 'multer';
import path from 'path';

// Setup multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(process.cwd(), 'uploads/'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'logo-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });


const router = express.Router();
const prisma = new PrismaClient();

// GET Company Info
router.get('/company', async (req, res) => {
  try {
    let company = await prisma.company.findFirst();
    if (!company) {
      company = await prisma.company.create({
        data: {
          name: 'Công ty của bạn',
        }
      });
    }
    res.json(company);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// PUT Company Info
router.put('/company', async (req, res) => {
  try {
    const { name, phone, address, taxCode, logo } = req.body;
    let company = await prisma.company.findFirst();
    if (company) {
      company = await prisma.company.update({
        where: { id: company.id },
        data: { name, phone, address, taxCode, logo }
      });
    } else {
      company = await prisma.company.create({
        data: { name, phone, address, taxCode, logo }
      });
    }
    res.json(company);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// POST Upload Logo
router.post('/upload-logo', upload.single('logo'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({ url: fileUrl });
});

// GET Account Info (First User)
router.get('/account', async (req, res) => {
  try {
    let user = await prisma.user.findFirst();
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: 'admin@example.com',
          name: 'Admin',
          password: 'password123'
        }
      });
    }
    res.json({ email: user.email });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// PUT Account Info
router.put('/account', async (req, res) => {
  try {
    const { email, currentPassword, newPassword } = req.body;
    const user = await prisma.user.findFirst();
    if (!user) {
      return res.status(404).json({ error: 'Người dùng không tồn tại' });
    }

    if (currentPassword !== user.password) {
      return res.status(400).json({ error: 'Mật khẩu hiện tại không đúng' });
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        email,
        password: newPassword || user.password
      }
    });

    res.json({ email: updatedUser.email, message: 'Cập nhật thành công' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
// GET Contract Template
router.get('/contract-template', async (req, res) => {
  try {
    const fs = require('fs');
    const templatePath = path.join(process.cwd(), '../contract_template.txt');
    if (!fs.existsSync(templatePath)) {
      return res.json({ content: '' });
    }
    const content = fs.readFileSync(templatePath, 'utf8');
    res.json({ content });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to read contract template' });
  }
});

// PUT Contract Template
router.put('/contract-template', async (req, res) => {
  try {
    const { content } = req.body;
    const fs = require('fs');
    const templatePath = path.join(process.cwd(), '../contract_template.txt');
    fs.writeFileSync(templatePath, content, 'utf8');
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to write contract template' });
  }
});

export default router;
