const registry = require('./registry');
const ideaValidator = require('./definitions/ideaValidator');
const customerResearch = require('./definitions/customerResearch');
const competitorAnalysis = require('./definitions/competitorAnalysis');
const mvpPlanner = require('./definitions/mvpPlanner');
const marketingStrategist = require('./definitions/marketingStrategist');
const pricingAdvisor = require('./definitions/pricingAdvisor');
const growthCoach = require('./definitions/growthCoach');
const investorAdvisor = require('./definitions/investorAdvisor');

// Register all 8 specialized agents into the pluggable registry
registry.registerAgent(ideaValidator);
registry.registerAgent(customerResearch);
registry.registerAgent(competitorAnalysis);
registry.registerAgent(mvpPlanner);
registry.registerAgent(marketingStrategist);
registry.registerAgent(pricingAdvisor);
registry.registerAgent(growthCoach);
registry.registerAgent(investorAdvisor);

module.exports = registry;
