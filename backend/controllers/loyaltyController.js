import { LoyaltyTransaction, LoyaltyRule } from '../models/Loyalty.js';

export const transactions = async (req, res) => {
  try {
    const filter = {};
    if (req.user?.role_id !== 3 && req.query.user_id) filter.user_id = req.query.user_id;
    else if (req.userId) filter.user_id = req.userId;
    return res.json({ success: true, data: await LoyaltyTransaction.find(filter).sort('-created_at') });
  } catch (err) { return res.status(500).json({ success: false, message: err.message }); }
};

export const rules = async (req, res) => {
  try { return res.json({ success: true, data: await LoyaltyRule.find() }); }
  catch (err) { return res.status(500).json({ success: false, message: err.message }); }
};

export const updateRules = async (req, res) => {
  try {
    const { rules: rulesData } = req.body;
    if (Array.isArray(rulesData)) {
      for (const r of rulesData) {
        if (r._id) await LoyaltyRule.findByIdAndUpdate(r._id, r);
        else await LoyaltyRule.create(r);
      }
    }
    return res.json({ success: true, data: await LoyaltyRule.find() });
  } catch (err) { return res.status(500).json({ success: false, message: err.message }); }
};
