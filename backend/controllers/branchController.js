import Branch from '../models/Branch.js';
export const list = async (req, res) => {
  try { return res.json({ success: true, data: await Branch.find() }); }
  catch (err) { return res.status(500).json({ success: false, message: err.message }); }
};
export const detail = async (req, res) => {
  try { const b = await Branch.findById(req.params.id); return b ? res.json({ success: true, data: b }) : res.status(404).json({ success: false, message: 'Not found' }); }
  catch (err) { return res.status(500).json({ success: false, message: err.message }); }
};
export const create = async (req, res) => {
  try { return res.status(201).json({ success: true, data: await Branch.create(req.body) }); }
  catch (err) { return res.status(500).json({ success: false, message: err.message }); }
};
export const update = async (req, res) => {
  try { return res.json({ success: true, data: await Branch.findByIdAndUpdate(req.params.id, req.body, { new: true }) }); }
  catch (err) { return res.status(500).json({ success: false, message: err.message }); }
};
export const remove = async (req, res) => {
  try { await Branch.findByIdAndDelete(req.params.id); return res.json({ success: true, message: 'Deleted' }); }
  catch (err) { return res.status(500).json({ success: false, message: err.message }); }
};
