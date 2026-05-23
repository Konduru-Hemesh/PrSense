const Joi = require('joi');

const analyzeSchema = Joi.object({
  code: Joi.string().min(1).max(500000).required(),
  language: Joi.string().min(1).max(40).required(),
  analysisMode: Joi.string().valid('deep-review', 'explain-code').default('deep-review'),
});

const pullRequestSchema = Joi.object({
  prUrl: Joi.string().uri().required(),
  analysisMode: Joi.string().valid('deep-review', 'explain-code').default('deep-review'),
});

const repoSchema = Joi.object({
  repoUrl: Joi.string().uri().required(),
  analysisMode: Joi.string().valid('deep-review', 'explain-code').default('deep-review'),
});

const explainSchema = Joi.object({
  issue: Joi.object({
    title: Joi.string().min(1).required(),
    description: Joi.string().allow('').required(),
    suggestedFix: Joi.string().allow('').required(),
    line: Joi.number().integer().allow(null).required(),
    category: Joi.string().allow('', null),
    severity: Joi.string().allow('', null),
    detectedBy: Joi.string().allow('', null),
    codeContext: Joi.string().allow('').required(),
  }).required(),
  language: Joi.string().min(1).max(40).required(),
  codeContext: Joi.string().allow('').required(),
});

function validateBody(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      return res.status(400).json({
        error: 'Invalid request payload',
        details: error.details.map((item) => item.message),
      });
    }

    req.body = value;
    next();
  };
}

module.exports = {
  validateAnalyzeRequest: validateBody(analyzeSchema),
  validatePullRequestRequest: validateBody(pullRequestSchema),
  validateRepoRequest: validateBody(repoSchema),
  validateExplainRequest: validateBody(explainSchema),
};
