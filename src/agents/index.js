const registry = require('./registry');

// Legacy definitions
const ideaValidator = require('./definitions/ideaValidator');
const customerResearch = require('./definitions/customerResearch');
const competitorAnalysis = require('./definitions/competitorAnalysis');
const mvpPlanner = require('./definitions/mvpPlanner');
const marketingStrategist = require('./definitions/marketingStrategist');
const pricingAdvisor = require('./definitions/pricingAdvisor');
const growthCoach = require('./definitions/growthCoach');
const investorAdvisor = require('./definitions/investorAdvisor');

// Modular agent definitions
const competitorAgent = require('./competitorAgent');
const marketingAgent = require('./marketingAgent');
const validationAgent = require('./validationAgent');
const roadmapAgent = require('./roadmapAgent');
const mvpAgent = require('./mvpAgent');
const launchAgent = require('./launchAgent');
const tractionAgent = require('./tractionAgent');
const investorAgent = require('./investorAgent');

// Register all agents into the pluggable registry
registry.registerAgent(ideaValidator);
registry.registerAgent(customerResearch);
registry.registerAgent(competitorAnalysis);
registry.registerAgent(mvpPlanner);
registry.registerAgent(marketingStrategist);
registry.registerAgent(pricingAdvisor);
registry.registerAgent(growthCoach);
registry.registerAgent(investorAdvisor);

registry.registerAgent(competitorAgent);
registry.registerAgent(marketingAgent);
registry.registerAgent(validationAgent);
registry.registerAgent(roadmapAgent);
registry.registerAgent(mvpAgent);
registry.registerAgent(launchAgent);
registry.registerAgent(tractionAgent);
registry.registerAgent(investorAgent);

module.exports = registry;
