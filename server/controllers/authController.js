const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const register = async (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Missing email or password" });
  const userExists = await prisma.user.findUnique({ where: { email } });
  if (userExists) return res.status(409).json({ error: "User already exists" });
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { email, password: hashedPassword, name }
  });
  res.json({ message: "Registration successful" });
};

const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(401).json({ error: "Invalid credentials" });
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ error: "Invalid credentials" });
  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: "7d" });
  res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
};

const getProfile = async (req, res) => {
  const userId = req.userId;
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, email: true, name: true, avatar: true } });
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json(user);
};

module.exports = { register, login, getProfile };
