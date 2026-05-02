import { EventComment } from '../models/Event.js';
import { EventPost } from '../models/EventPost.js';
import mongoose from 'mongoose';

export const list = async (req, res) => {
  try {
    const { featured, page, limit } = req.query;
    const filter = { is_published: true };
    if (featured === 'true') filter.is_featured = true;

    let query = EventPost.find(filter).sort('-published_at');

    if (limit) {
      const skip = page ? (Number(page) - 1) * Number(limit) : 0;
      query = query.skip(skip).limit(Number(limit));
    }

    const data = await query;
    return res.json({ success: true, data, items: data });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const published = async (req, res) => {
  try { return res.json({ success: true, data: await EventPost.find({ is_published: true }).sort('-published_at') }); }
  catch (err) { return res.status(500).json({ success: false, message: err.message }); }
};

export const featured = async (req, res) => {
  try { return res.json({ success: true, data: await EventPost.find({ is_featured: true, is_published: true }).sort('-published_at') }); }
  catch (err) { return res.status(500).json({ success: false, message: err.message }); }
};

export const detail = async (req, res) => {
  try {
    const idParam = req.params.id;
    let ev = null;
    if (mongoose.Types.ObjectId.isValid(idParam)) {
      ev = await EventPost.findById(idParam);
    }
    if (!ev) {
      ev = await EventPost.findOne({ slug: idParam });
    }
    if (!ev) return res.status(404).json({ success: false, message: 'Not found' });

    ev.views = (ev.views || 0) + 1;
    await ev.save();
    return res.json({ success: true, data: ev });
  } catch (err) { return res.status(500).json({ success: false, message: err.message }); }
};

export const create = async (req, res) => {
  try { return res.status(201).json({ success: true, data: await EventPost.create(req.body) }); }
  catch (err) { return res.status(500).json({ success: false, message: err.message }); }
};

export const update = async (req, res) => {
  try { return res.json({ success: true, data: await EventPost.findByIdAndUpdate(req.params.id, req.body, { new: true }) }); }
  catch (err) { return res.status(500).json({ success: false, message: err.message }); }
};

export const remove = async (req, res) => {
  try { await EventPost.findByIdAndDelete(req.params.id); return res.json({ success: true, message: 'Deleted' }); }
  catch (err) { return res.status(500).json({ success: false, message: err.message }); }
};

export const publish = async (req, res) => {
  try { return res.json({ success: true, data: await EventPost.findByIdAndUpdate(req.params.id, { is_published: true }, { new: true }) }); }
  catch (err) { return res.status(500).json({ success: false, message: err.message }); }
};

export const unpublish = async (req, res) => {
  try { return res.json({ success: true, data: await EventPost.findByIdAndUpdate(req.params.id, { is_published: false }, { new: true }) }); }
  catch (err) { return res.status(500).json({ success: false, message: err.message }); }
};

export const toggleFeatured = async (req, res) => {
  try {
    const ev = await EventPost.findById(req.params.id);
    if (!ev) return res.status(404).json({ success: false, message: 'Not found' });
    ev.is_featured = !ev.is_featured; await ev.save();
    return res.json({ success: true, data: ev });
  } catch (err) { return res.status(500).json({ success: false, message: err.message }); }
};

export const bulkDelete = async (req, res) => {
  try { await EventPost.deleteMany({ _id: { $in: req.body.ids } }); return res.json({ success: true, message: 'Deleted' }); }
  catch (err) { return res.status(500).json({ success: false, message: err.message }); }
};

export const comments = async (req, res) => {
  try { return res.json({ success: true, data: await EventComment.find({ event_id: req.params.id, status: 'active' }).sort('-created_at') }); }
  catch (err) { return res.status(500).json({ success: false, message: err.message }); }
};

export const addComment = async (req, res) => {
  try {
    const comment = await EventComment.create({ ...req.body, event_id: req.params.id });
    await EventPost.findByIdAndUpdate(req.params.id, { $inc: { comments_count: 1 } });
    return res.status(201).json({ success: true, data: comment });
  } catch (err) { return res.status(500).json({ success: false, message: err.message }); }
};

export const related = async (req, res) => {
  try {
    const idParam = req.params.id;
    let ev = null;
    if (mongoose.Types.ObjectId.isValid(idParam)) {
      ev = await EventPost.findById(idParam);
    }
    if (!ev) {
      ev = await EventPost.findOne({ slug: idParam });
    }
    const data = ev ? await EventPost.find({ category_id: ev.category_id, _id: { $ne: ev._id }, is_published: true }).limit(4) : [];
    return res.json({ success: true, data });
  } catch (err) { return res.status(500).json({ success: false, message: err.message }); }
};

export const categories = async (req, res) => {
  try {
    const cats = await EventPost.distinct('category_id');
    return res.json({ success: true, data: cats });
  } catch (err) { return res.status(500).json({ success: false, message: err.message }); }
};
