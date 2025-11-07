import { ReadingsModel } from "../models/readingsModel.js";

export const ReadingsController = {
  async list(req, res) {
    try {
      const data = await ReadingsModel.list();
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async latest(req, res) {
    try {
      const data = await ReadingsModel.latest();
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async create(req, res) {
    try {
      const created = await ReadingsModel.create(req.body);
      res.status(201).json(created);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // --- FITUR BARU: HAPUS SATU DATA ---
  async remove(req, res) {
    const { id } = req.params;
    try {
      await ReadingsModel.remove(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // --- FITUR BARU: HAPUS SEMUA DATA ---
  async clear(req, res) {
    try {
      await ReadingsModel.clear();
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};
