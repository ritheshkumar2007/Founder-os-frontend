const { getWorkflowState, setModuleState, MODULE_STATES } = require('./workflowState');
const { resolveDependencies } = require('./dependencyResolver');
const { validateWorkflowPreconditions } = require('./workflowValidator');
const { calculateVentureProgress } = require('./progressCalculator');
const { recommendNextAction } = require('./recommendationEngine');
const { buildWorkflowContext } = require('./workflowContext');
const { buildPrompt } = require('../prompts/buildPrompt');
const memoryManager = require('../memory/memoryManager');
const { workflowEvents, WORKFLOW_EVENT_TYPES } = require('./workflowEvents');

class WorkflowEngine {
  /**
   * Execute the 11-Step AI Workflow Orchestration Pipeline
   */
  async executePipeline({
    ventureId,
    ownerId,
    moduleId,
    agentName,
    userQuestion,
    history = [],
    llmCaller,
    options = {},
  }) {
    // Step 1: Read Workflow State
    const workflowState = getWorkflowState(ventureId);

    // Step 2, 3, 4, 5: Build Workflow Context (combining Memory, RAG, Dependencies)
    const workflowContextStr = await buildWorkflowContext({
      ventureId,
      ownerId,
      moduleId,
      agentName,
      userQuestion,
      history,
    });

    // Step 6: Generate System Prompt (Layer 1)
    const systemPrompt = buildPrompt({
      role: options.role || agentName || 'Workflow Intelligence Agent',
      objective: options.objective || 'Guide founder through sequential workflow execution.',
      agentInstructions: options.agentInstructions || '',
      ventureContext: workflowContextStr,
      userInput: userQuestion,
      includeCompetitors: options.includeCompetitors || false,
    });

    // Step 7: Call LLM or fallback
    let llmResponse = '';
    if (typeof llmCaller === 'function') {
      llmResponse = await llmCaller(systemPrompt);
    } else {
      llmResponse = `### 🚀 ${agentName || 'Workflow Intelligence'} Output\n- Successfully processed request for module: ${moduleId || 'general'}.`;
    }

    // Step 8: Update Venture Memory (Layer 2)
    if (ventureId && moduleId) {
      const memoryKey = memoryManager.MEMORY_TYPES[moduleId.toUpperCase()] || `build.${moduleId}`;
      await memoryManager.updateMemory(ventureId, memoryKey, llmResponse, ownerId);
    }

    // Step 9: Publish Workflow Event & Update State
    if (ventureId && moduleId) {
      setModuleState(ventureId, moduleId, MODULE_STATES.COMPLETED, {
        updatedBy: ownerId || 'system',
        propagateDownstream: true, // Mark downstream as Needs Review if upstream edited
      });

      const eventType = WORKFLOW_EVENT_TYPES[`${moduleId.toUpperCase()}_UPDATED`] || WORKFLOW_EVENT_TYPES.VENTURE_UPDATED;
      workflowEvents.emit(eventType, { ventureId, moduleId, timestamp: new Date() });
    }

    // Step 10: Recalculate Progress
    const updatedProgress = calculateVentureProgress(ventureId);

    // Step 11: Recommend Next Action
    const nextRecommendation = recommendNextAction(ventureId);

    return {
      output: llmResponse,
      systemPrompt,
      workflowState,
      progress: updatedProgress,
      nextRecommendation,
    };
  }

  getWorkflowState(ventureId) {
    return getWorkflowState(ventureId);
  }

  calculateProgress(ventureId) {
    return calculateVentureProgress(ventureId);
  }

  recommendNext(ventureId) {
    return recommendNextAction(ventureId);
  }

  setModuleState(ventureId, moduleId, status, options) {
    return setModuleState(ventureId, moduleId, status, options);
  }
}

module.exports = new WorkflowEngine();
