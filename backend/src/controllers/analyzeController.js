const { analyzeCode, explainFix } = require('../services/geminiService');

async function analyze(req, res, next) {
  try {
    const { code, language, analysisMode } = req.body;
    const analysis = await analyzeCode(code, language, analysisMode);
    res.json({
      ...analysis,
      detectedBy: 'ai',
      timestamp: Date.now(),
    });
  } catch (error) {
    next(error);
  }
}

async function explain(req, res, next) {
  try {
    const { issue, language, codeContext } = req.body;
    const explanation = await explainFix(issue, language, codeContext);
    res.json({
      ...explanation,
      timestamp: Date.now(),
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  analyze,
  explain,
};
