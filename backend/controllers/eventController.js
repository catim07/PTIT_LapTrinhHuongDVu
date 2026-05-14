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
  try {
    const cmts = await EventComment.find({ event_id: req.params.id, status: 'active' })
      .sort('created_at') // Sort ascending for threaded view or keep descending
      .lean();
      
    // Manual populate to ensure avatar is always up-to-date and accurate
    const userIds = cmts.map(c => c.user_id).filter(Boolean);
    
    // We only query valid ObjectIds to prevent cast errors
    const validUserIds = userIds.filter(id => mongoose.Types.ObjectId.isValid(id));
    const users = await mongoose.model('User').find({ _id: { $in: validUserIds } }).select('avatar full_name username').lean();
    
    const userMap = {};
    for (const u of users) {
      userMap[u._id.toString()] = u;
    }

    const data = cmts.map(c => {
      const u = c.user_id ? userMap[c.user_id.toString()] : null;
      if (u) {
        c.user_avatar = u.avatar || null;
        c.user_name = u.full_name || u.username || c.user_name;
      }
      return c;
    });

    // We can also sort comments here: parent comments descending, replies ascending, etc.
    // Let's sort by created_at descending generally, but frontend handles it anyway
    data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    return res.json({ success: true, data });
  } catch (err) { return res.status(500).json({ success: false, message: err.message }); }
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

export const likeEvent = async (req, res) => {
  try {
    const userId = req.user.id;
    const ev = await EventPost.findById(req.params.id);
    if (!ev) return res.status(404).json({ success: false, message: 'Event not found' });
    
    const idx = ev.liked_by.indexOf(userId);
    if (idx !== -1) {
      // unlike
      ev.liked_by.splice(idx, 1);
      ev.likes = Math.max(0, (ev.likes || 1) - 1);
    } else {
      // like
      ev.liked_by.push(userId);
      ev.likes = (ev.likes || 0) + 1;
    }
    await ev.save();
    return res.json({ success: true, likes: ev.likes, isLiked: idx === -1 });
  } catch (err) { return res.status(500).json({ success: false, message: err.message }); }
};

export const likeComment = async (req, res) => {
  try {
    const userId = req.user.id;
    const comment = await EventComment.findById(req.params.commentId);
    if (!comment) return res.status(404).json({ success: false, message: 'Comment not found' });
    
    const idx = comment.liked_by.indexOf(userId);
    if (idx !== -1) {
      // unlike
      comment.liked_by.splice(idx, 1);
      comment.likes = Math.max(0, (comment.likes || 1) - 1);
    } else {
      // like
      comment.liked_by.push(userId);
      comment.likes = (comment.likes || 0) + 1;
    }
    await comment.save();
    return res.json({ success: true, likes: comment.likes, isLiked: idx === -1 });
  } catch (err) { return res.status(500).json({ success: false, message: err.message }); }
};
