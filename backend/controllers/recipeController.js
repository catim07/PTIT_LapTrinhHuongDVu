import Recipe from '../models/Recipe.js';
import { generateRecipe } from '../services/aiService.js';

const normalizeStr = (str) => {
  return str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
};

// GET /api/recipes
export const getRecipes = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const recipes = await Recipe.find({ status: 'active' })
      .sort('-access_count -createdAt')
      .limit(limit)
      .select('-steps');
    res.json({ success: true, data: recipes });
  } catch (err) {
    console.error('[RecipeList] Error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/recipes/search?q=
export const searchRecipes = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json({ success: true, data: [] });

    const normQ = normalizeStr(q);
    const exactMatch = await Recipe.findOne({ normalized_name: { $regex: normQ, $options: 'i' }, status: 'active' });
    if (exactMatch) return res.json({ success: true, data: [exactMatch] });

    const partialMatches = await Recipe.find({
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { normalized_name: { $regex: normQ, $options: 'i' } },
        { tags: { $regex: q, $options: 'i' } }
      ],
      status: 'active'
    }).limit(10);

    return res.json({ success: true, data: partialMatches });
  } catch (err) {
    console.error('[RecipeSearch] Error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/recipes/:id
export const getRecipeById = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ success: false, message: 'Không tìm thấy công thức' });

    recipe.access_count += 1;
    recipe.last_accessed_at = new Date();
    await recipe.save();
    res.json({ success: true, data: recipe });
  } catch (err) {
    console.error('[RecipeById] Error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/recipes/by-name/:name
export const getRecipeByName = async (req, res) => {
  try {
    const norm = normalizeStr(req.params.name);
    const recipe = await Recipe.findOne({ normalized_name: { $regex: `^${norm}`, $options: 'i' } });

    if (recipe) {
      recipe.access_count += 1;
      recipe.last_accessed_at = new Date();
      await recipe.save();
      return res.json({ success: true, data: recipe });
    }

    return res.status(404).json({ success: false, message: 'Không tìm thấy công thức, vui lòng tạo mới.' });
  } catch (err) {
    console.error('[RecipeByName] Error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/recipes/generate
export const generateUserRecipe = async (req, res) => {
  try {
    const { dishName, servings, appetite = 'normal' } = req.body;

    // ── INPUT VALIDATION ──
    if (!dishName || typeof dishName !== 'string' || dishName.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập tên món ăn.' });
    }
    if (dishName.trim().length < 2) {
      return res.status(400).json({ success: false, message: 'Tên món ăn quá ngắn (tối thiểu 2 ký tự).' });
    }
    if (dishName.trim().length > 100) {
      return res.status(400).json({ success: false, message: 'Tên món ăn quá dài (tối đa 100 ký tự).' });
    }
    if (servings === undefined || servings === null || isNaN(Number(servings))) {
      return res.status(400).json({ success: false, message: 'Vui lòng chọn số người ăn (1-10).' });
    }

    const srv = Math.min(10, Math.max(1, parseInt(servings, 10)));
    const cleanDishName = dishName.trim();
    const validAppetites = ['small', 'normal', 'large'];
    const cleanAppetite = validAppetites.includes(appetite) ? appetite : 'normal';
    const normalizedKey = normalizeStr(cleanDishName) + '-' + srv + '-' + cleanAppetite;

    console.log(`[RecipeGenerate] ═══════════════════════════════════════`);
    console.log(`[RecipeGenerate] Request: "${cleanDishName}" for ${srv} servings (appetite=${cleanAppetite})`);
    console.log(`[RecipeGenerate] Cache key: "${normalizedKey}"`);

    // ── DB-FIRST: return cached recipe if exists ──
    const existing = await Recipe.findOne({ normalized_name: normalizedKey, status: 'active' });
    if (existing) {
      console.log(`[RecipeGenerate] ✅ CACHE HIT: "${existing.title}" (id=${existing._id})`);
      existing.access_count += 1;
      existing.last_accessed_at = new Date();
      await existing.save();
      return res.json({ success: true, data: existing, cached: true });
    }

    // ── AI GENERATION (only when no cache) ──
    console.log(`[RecipeGenerate] ❌ Cache miss — calling AI service...`);
    let generatedData = null;
    try {
      generatedData = await generateRecipe(cleanDishName, srv, cleanAppetite);
    } catch (aiError) {
      console.error(`[RecipeGenerate] AI service error:`, aiError.message);

      if (aiError.message?.includes('Missing GEMINI_RECIPE_KEY')) {
        return res.status(503).json({
          success: false,
          message: 'AI chưa được cấu hình. Vui lòng liên hệ admin.'
        });
      }

      return res.status(503).json({
        success: false,
        message: 'Dịch vụ AI tạm thời không khả dụng. Vui lòng thử lại sau ít phút.'
      });
    }

    if (!generatedData) {
      console.error(`[RecipeGenerate] AI returned null — generation failed entirely`);
      return res.status(500).json({
        success: false,
        message: 'AI không thể tạo công thức chi tiết cho món này. Vui lòng thử lại hoặc nhập tên món khác.'
      });
    }

    // ── VALIDATE AI OUTPUT BEFORE SAVING ──
    if (!generatedData.title || typeof generatedData.title !== 'string') {
      generatedData.title = cleanDishName;
    }

    // Ensure minimum quality for ingredients
    if (!Array.isArray(generatedData.ingredients) || generatedData.ingredients.length < 3) {
      console.error(`[RecipeGenerate] AI output has too few ingredients: ${generatedData.ingredients?.length || 0}`);
      return res.status(500).json({
        success: false,
        message: 'AI tạo công thức không đủ chi tiết. Vui lòng thử lại.'
      });
    }

    // Ensure minimum quality for steps
    if (!Array.isArray(generatedData.steps) || generatedData.steps.length < 3) {
      console.error(`[RecipeGenerate] AI output has too few steps: ${generatedData.steps?.length || 0}`);
      return res.status(500).json({
        success: false,
        message: 'AI tạo công thức không đủ bước nấu. Vui lòng thử lại.'
      });
    }

    // ── NORMALIZE DATA FOR DB ──
    generatedData.normalized_name = normalizedKey;
    generatedData.servings = srv;
    generatedData.ai_generated = true;
    generatedData.source_type = 'ai_generated';
    generatedData.status = 'active';

    // Ensure ingredients are properly formatted
    generatedData.ingredients = generatedData.ingredients.map(ing => ({
      name: String(ing.name || '').trim() || 'Nguyên liệu',
      quantity: String(ing.quantity ?? '').trim(),
      unit: String(ing.unit || '').trim(),
      note: String(ing.note || '').trim()
    }));

    // Ensure steps are properly formatted
    generatedData.steps = generatedData.steps.map((s, idx) => ({
      step: Number(s.step) || idx + 1,
      title: String(s.title || `Bước ${idx + 1}`).trim(),
      description: String(s.description || '').trim(),
      duration: String(s.duration || '').trim()
    }));

    // Ensure tips are strings
    if (Array.isArray(generatedData.tips)) {
      generatedData.tips = generatedData.tips.filter(t => typeof t === 'string' && t.trim().length > 0);
    } else {
      generatedData.tips = [];
    }

    // Ensure tags are strings
    if (Array.isArray(generatedData.tags)) {
      generatedData.tags = generatedData.tags.filter(t => typeof t === 'string' && t.trim().length > 0);
    } else {
      generatedData.tags = [];
    }

    // ── SAVE TO DB ──
    try {
      const newRecipe = await Recipe.create(generatedData);
      console.log(`[RecipeGenerate] ✅ SAVED: "${newRecipe.title}" (id=${newRecipe._id}, ingredients=${newRecipe.ingredients.length}, steps=${newRecipe.steps.length})`);
      return res.json({ success: true, data: newRecipe, cached: false });
    } catch (saveError) {
      // Handle duplicate key — race condition where another request saved it first
      if (saveError.code === 11000) {
        console.log(`[RecipeGenerate] Duplicate key — fetching existing record...`);
        const dup = await Recipe.findOne({ normalized_name: normalizedKey });
        if (dup) {
          dup.access_count += 1;
          dup.last_accessed_at = new Date();
          await dup.save();
          return res.json({ success: true, data: dup, cached: true });
        }
      }
      console.error(`[RecipeGenerate] DB save error:`, saveError.message);
      throw saveError;
    }

  } catch (err) {
    console.error('[RecipeGenerate] Unexpected error:', err);
    res.status(500).json({ success: false, message: 'Lỗi hệ thống khi tạo công thức. Vui lòng thử lại.' });
  }
};
