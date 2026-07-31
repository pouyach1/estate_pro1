const Agent = require('../models/Agent');
const fs = require('fs');
const path = require('path');

const getAgents = async (req, res) => {
  try {
    const agents = await Agent.find({ isActive: true }).sort({ createdAt: -1 });
    res.json({ count: agents.length, agents });
  } catch (error) {
    res.status(500).json({ message: 'خطا' });
  }
};

const getAgent = async (req, res) => {
  try {
    const agent = await Agent.findById(req.params.id);
    if (!agent) return res.status(404).json({ message: 'یافت نشد' });
    res.json(agent);
  } catch (error) {
    res.status(500).json({ message: 'خطا' });
  }
};

const createAgent = async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.file) data.photo = `/uploads/${req.file.filename}`;
    const agent = await Agent.create(data);
    res.status(201).json({ message: 'مشاور افزوده شد', agent });
  } catch (error) {
    res.status(400).json({ message: 'خطا' });
  }
};

const updateAgent = async (req, res) => {
  try {
    const agent = await Agent.findById(req.params.id);
    if (!agent) return res.status(404).json({ message: 'یافت نشد' });
    if (req.file) {
      if (agent.photo) {
        const oldPath = path.join(__dirname, '..', agent.photo);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      req.body.photo = `/uploads/${req.file.filename}`;
    }
    const updated = await Agent.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ message: 'بروزرسانی شد', agent: updated });
  } catch (error) {
    res.status(400).json({ message: 'خطا' });
  }
};

const deleteAgent = async (req, res) => {
  try {
    const agent = await Agent.findByIdAndDelete(req.params.id);
    if (!agent) return res.status(404).json({ message: 'یافت نشد' });
    if (agent.photo) {
      const p = path.join(__dirname, '..', agent.photo);
      if (fs.existsSync(p)) fs.unlinkSync(p);
    }
    res.json({ message: 'حذف شد' });
  } catch (error) {
    res.status(500).json({ message: 'خطا' });
  }
};

module.exports = { getAgents, getAgent, createAgent, updateAgent, deleteAgent };