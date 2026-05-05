import Branch from '../models/Branch.js';

// Haversine distance in km
function haversine(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export const list = async (req, res) => {
  try { return res.json({ success: true, data: await Branch.find() }); }
  catch (err) { return res.status(500).json({ success: false, message: err.message }); }
};

export const detail = async (req, res) => {
  try {
    const b = await Branch.findById(req.params.id);
    return b ? res.json({ success: true, data: b }) : res.status(404).json({ success: false, message: 'Not found' });
  } catch (err) { return res.status(500).json({ success: false, message: err.message }); }
};

export const create = async (req, res) => {
  try {
    const { name, address, city, phone, manager, is_active, operating_hours, coordinates, coverage_radius_km } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ success: false, message: 'Tên chi nhánh là bắt buộc' });
    const branch = await Branch.create({ name: name.trim(), address, city, phone, manager, is_active, operating_hours, coordinates, coverage_radius_km });
    return res.status(201).json({ success: true, data: branch });
  } catch (err) { return res.status(500).json({ success: false, message: err.message }); }
};

export const update = async (req, res) => {
  try {
    const branch = await Branch.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!branch) return res.status(404).json({ success: false, message: 'Chi nhánh không tồn tại' });
    return res.json({ success: true, data: branch });
  } catch (err) { return res.status(500).json({ success: false, message: err.message }); }
};

export const remove = async (req, res) => {
  try {
    const branch = await Branch.findByIdAndDelete(req.params.id);
    if (!branch) return res.status(404).json({ success: false, message: 'Chi nhánh không tồn tại' });
    return res.json({ success: true, message: 'Đã xóa chi nhánh' });
  } catch (err) { return res.status(500).json({ success: false, message: err.message }); }
};

// Duplicate detection: find branches near given coordinates
export const checkNearby = async (req, res) => {
  try {
    const { lat, lng, exclude_id, threshold_km = 1 } = req.query;
    if (!lat || !lng) return res.status(400).json({ success: false, message: 'lat and lng required' });
    const pLat = parseFloat(lat), pLng = parseFloat(lng), thresh = parseFloat(threshold_km);
    const all = await Branch.find({ 'coordinates.lat': { $exists: true, $ne: null } });
    const nearby = all
      .filter(b => b.coordinates?.lat && b.coordinates?.lng)
      .filter(b => exclude_id ? String(b._id) !== String(exclude_id) : true)
      .map(b => ({ ...b.toObject(), id: b._id, distance_km: haversine(pLat, pLng, b.coordinates.lat, b.coordinates.lng) }))
      .filter(b => b.distance_km <= thresh)
      .sort((a, b) => a.distance_km - b.distance_km);
    return res.json({ success: true, data: nearby });
  } catch (err) { return res.status(500).json({ success: false, message: err.message }); }
};
