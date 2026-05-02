import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, default: '' },
  summary: { type: String, default: '' },
  content: { type: String, default: '' },
  thumbnail: { type: String, default: '' },
  banner_image: { type: String, default: '' },
  images: [String],
  category: { type: String, default: 'promotion' },
  tags: [String],
  author: { type: String, default: 'Admin' },
  status: { type: String, default: 'draft', enum: ['draft', 'published', 'archived'] },
  is_featured: { type: Boolean, default: false },
  start_date: { type: Date, default: null },
  end_date: { type: Date, default: null },
  views: { type: Number, default: 0 },
  likes: { type: Number, default: 0 },
  comments_count: { type: Number, default: 0 },
  related_products: [mongoose.Schema.Types.Mixed],
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

const eventCommentSchema = new mongoose.Schema({
  event_id: { type: mongoose.Schema.Types.Mixed, required: true },
  user_id: { type: mongoose.Schema.Types.Mixed, required: true },
  user_name: { type: String, default: '' },
  user_avatar: { type: String, default: null },
  content: { type: String, required: true },
  status: { type: String, default: 'active' },
}, { timestamps: { createdAt: 'created_at' } });

export const Event = mongoose.model('Event', eventSchema);
export const EventComment = mongoose.model('EventComment', eventCommentSchema);
