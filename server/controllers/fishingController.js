const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const getAll = async (req, res) => {
  const userId = req.userId;
  const fishings = await prisma.fishingReport.findMany({ where: { userId }, orderBy: { date: "desc" } });
  res.json(fishings);
};

const create = async (req, res) => {
  const userId = req.userId;
  const data = req.body;
  data.userId = userId;
  const fishing = await prisma.fishingReport.create({ data });
  res.json(fishing);
};

const getOne = async (req, res) => {
  const userId = req.userId;
  const id = req.params.id;
  const fishing = await prisma.fishingReport.findFirst({ where: { id, userId } });
  if (!fishing) return res.status(404).json({ error: "Not found" });
  res.json(fishing);
};

const update = async (req, res) => {
  const userId = req.userId;
  const id = req.params.id;
  const data = req.body;
  const fishing = await prisma.fishingReport.updateMany({
    where: { id, userId },
    data,
  });
  if (fishing.count === 0) return res.status(404).json({ error: "Not found or no access" });
  res.json({ message: "Updated" });
};

const remove = async (req, res) => {
  const userId = req.userId;
  const id = req.params.id;
  const fishing = await prisma.fishingReport.deleteMany({ where: { id, userId } });
  if (fishing.count === 0) return res.status(404).json({ error: "Not found or no access" });
  res.json({ message: "Deleted" });
};

module.exports = { getAll, create, getOne, update, remove };
