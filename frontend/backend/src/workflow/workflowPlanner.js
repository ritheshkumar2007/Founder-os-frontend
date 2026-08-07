const { validateWorkflowPreconditions } = require('./workflowValidator');
const { calculateVentureProgress } = require('./progressCalculator');
const { recommendNextAction } = require('./recommendationEngine');

class WorkflowPlanner {
  /**
   * Plan execution for a target module
   */
  planModuleExecution(ventureId, moduleId) {
    const validation = validateWorkflowPreconditions(ventureId, moduleId);
    const progress = calculateVentureProgress(ventureId);
    const recommendation = recommendNextAction(ventureId);

    return {
      ventureId,
      targetModule: moduleId,
      validation,
      progress,
      recommendation,
      readyToExecute: validation.isValid || validation.canOverride,
    };
  }
}

module.exports = new WorkflowPlanner();
