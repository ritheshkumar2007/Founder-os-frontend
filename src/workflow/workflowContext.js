const { getWorkflowState } = require('./workflowState');
const { resolveDependencies } = require('./dependencyResolver');
const { calculateVentureProgress } = require('./progressCalculator');
const { recommendNextAction } = require('./recommendationEngine');
const { assembleRAGContext } = require('../knowledge/retrieval/contextAssembler');

/**
 * Build unified workflow execution context
 */
async function buildWorkflowContext({ ventureId, ownerId, moduleId, agentName, userQuestion, history = [] }) {
  // 1. Fetch Workflow State & Dependencies
  const stateMap = getWorkflowState(ventureId);
  const deps = resolveDependencies(moduleId);
  const progress = calculateVentureProgress(ventureId);
  const nextRec = recommendNextAction(ventureId);

  // 2. Fetch Layer 3 RAG Context (Venture Memory + Knowledge Chunks)
  const ragContext = await assembleRAGContext({
    ventureId,
    ownerId,
    agentName: agentName || moduleId,
    userQuestion,
    history,
  });

  // 3. Format Workflow DAG Header
  const workflowHeader = `
=== WORKFLOW INTELLIGENCE CONTEXT ===
Active Module: ${moduleId || 'General'}
Current Venture Progress: ${progress.overallProgress}% Overall
Stage Progress: Idea Validation (${progress.stagesProgress['Idea Validation'] || 0}%), Build (${progress.stagesProgress.Build || 0}%), GTM (${progress.stagesProgress['Go To Market'] || 0}%), Growth (${progress.stagesProgress.Growth || 0}%)

Module Dependencies:
- Requires: ${deps.requires.length > 0 ? deps.requires.join(', ') : 'None'}
- Produces: ${deps.produces.join(', ')}

Next Recommended Action:
- ${nextRec.actionTitle}: ${nextRec.recommendation}
=== END WORKFLOW INTELLIGENCE CONTEXT ===
`.trim();

  return `${workflowHeader}\n\n${ragContext}`;
}

module.exports = {
  buildWorkflowContext,
};
