const Ajv2020 = require('ajv/dist/2020');

const registrySchema = require('../review-protocols/schema.json');
const requestSchema = require('../review-protocols/contracts/review-request.v1.schema.json');
const reviewSchema = require('../review-protocols/contracts/strategic-review.v1.schema.json');
const conflictRequestSchema = require('../review-protocols/contracts/ai-conflict-analysis-request.v1.schema.json');
const conflictSchema = require('../review-protocols/contracts/ai-conflict-analysis.v1.schema.json');

const ajv = new Ajv2020({ allErrors: true, strict: true });
ajv.addSchema(registrySchema);
ajv.addSchema(requestSchema);
ajv.addSchema(reviewSchema);
ajv.addSchema(conflictRequestSchema);
ajv.addSchema(conflictSchema);

function compile(schema) {
  const validate = ajv.getSchema(schema.$id);
  if (!validate) throw new Error('review contract schema was not registered: ' + schema.$id);
  return value => {
    if (validate(value)) return [];
    return (validate.errors || []).map(error => {
      const location = error.instancePath || '/';
      return 'schema ' + location + ' ' + error.message;
    });
  };
}

module.exports = {
  validateReviewProtocolRegistryShape: compile(registrySchema),
  validateConflictAnalysisShape: compile(conflictSchema),
  validateConflictRequestShape: compile(conflictRequestSchema),
  validateReviewRequestShape: compile(requestSchema),
  validateStrategicReviewShape: compile(reviewSchema)
};
