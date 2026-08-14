const assert = require('assert');

function validateMvpInputQuality({ ventureName, idea, targetUsers, problem }) {
  const vName = (ventureName || '').trim();
  const vUsers = (targetUsers || '').trim();
  const vIdea = (idea || '').trim();
  const vProblem = (problem || '').trim();

  // 1. Basic length check
  if (vName.length < 2 || vUsers.length < 3 || vIdea.length < 6 || vProblem.length < 6) {
    return {
      valid: false,
      message: "This doesn't look like real Idea Validation data — the fields are empty, duplicated, or too generic to scope an MVP from. Please complete Idea Validation properly first, or re-enter your actual startup details.",
    };
  }

  const normalize = (str) =>
    str
      .toLowerCase()
      .replace(/[^a-z0-9]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

  const normName = normalize(vName);
  const normUsers = normalize(vUsers);
  const normIdea = normalize(vIdea);
  const normProblem = normalize(vProblem);

  // 2. Meaningful difference check (Identical or near-identical text)
  const fields = [normName, normUsers, normIdea, normProblem];
  for (let i = 0; i < fields.length; i++) {
    for (let j = i + 1; j < fields.length; j++) {
      const f1 = fields[i];
      const f2 = fields[j];
      if (f1 === f2 && f1.length > 2) {
        return {
          valid: false,
          message: "This doesn't look like real Idea Validation data — the fields are empty, duplicated, or too generic to scope an MVP from. Please complete Idea Validation properly first, or re-enter your actual startup details.",
        };
      }
      if (f1.length > 5 && f2.length > 5) {
        if ((f1.includes(f2) || f2.includes(f1)) && Math.abs(f1.length - f2.length) < 4) {
          return {
            valid: false,
            message: "This doesn't look like real Idea Validation data — the fields are empty, duplicated, or too generic to scope an MVP from. Please complete Idea Validation properly first, or re-enter your actual startup details.",
          };
        }
      }
    }
  }

  // 3. Generic Target Users check (Must be a specific persona, not just 'founders' or 'users')
  const genericUsersList = [
    'users', 'user',
    'founders', 'founder',
    'people', 'person',
    'customers', 'customer',
    'everyone', 'anyone', 'anybody', 'someone',
    'clients', 'client',
    'startups', 'startup',
    'all users', 'all people', 'target users', 'target customers', 'target customer segments',
    'early stage founders', 'early stage startups', 'b2b founders', 'b2c users',
  ];

  if (genericUsersList.includes(normUsers) || (normUsers.split(' ').length === 1 && genericUsersList.includes(normUsers))) {
    return {
      valid: false,
      message: "This doesn't look like real Idea Validation data — the fields are empty, duplicated, or too generic to scope an MVP from. Please complete Idea Validation properly first, or re-enter your actual startup details.",
    };
  }

  // 4. Vague / Generic Idea or Problem Check
  const genericPhrases = [
    'i am solving the problem for founders',
    'solving the problem for founders',
    'solving problem for founders',
    'helping people',
    'helping users',
    'helping founders',
    'making things easier',
    'make things easier',
    'solving problems',
    'solving customer problem',
    'an app',
    'a website',
    'ai app',
    'ai platform',
    'ai startup',
    'platform',
    'good idea',
    'something cool',
    'solve pain',
    'core customer problem',
    'startup concept',
    'new startup idea',
    'validated startup idea',
  ];

  if (genericPhrases.includes(normIdea) || genericPhrases.includes(normProblem)) {
    return {
      valid: false,
      message: "This doesn't look like real Idea Validation data — the fields are empty, duplicated, or too generic to scope an MVP from. Please complete Idea Validation properly first, or re-enter your actual startup details.",
    };
  }

  if (normProblem.split(' ').length < 3 || normIdea.split(' ').length < 3) {
    return {
      valid: false,
      message: "This doesn't look like real Idea Validation data — the fields are empty, duplicated, or too generic to scope an MVP from. Please complete Idea Validation properly first, or re-enter your actual startup details.",
    };
  }

  return { valid: true };
}

const EXPECTED_ERROR = "This doesn't look like real Idea Validation data — the fields are empty, duplicated, or too generic to scope an MVP from. Please complete Idea Validation properly first, or re-enter your actual startup details.";

console.log("Running MVP Scope input quality validation tests...\n");

// Test 1: Duplicated fields
const res1 = validateMvpInputQuality({
  ventureName: "Acme",
  targetUsers: "crypto traders",
  idea: "crypto traders",
  problem: "crypto traders",
});
assert.strictEqual(res1.valid, false);
assert.strictEqual(res1.message, EXPECTED_ERROR);
console.log("✓ Test 1 Passed: Duplicated fields correctly rejected.");

// Test 2: Generic target users ('founders')
const res2 = validateMvpInputQuality({
  ventureName: "FounderTool",
  targetUsers: "founders",
  idea: "Autonomous email cold outreach assistant",
  problem: "High bounce rate on outbound marketing emails",
});
assert.strictEqual(res2.valid, false);
assert.strictEqual(res2.message, EXPECTED_ERROR);
console.log("✓ Test 2 Passed: Generic target users ('founders') rejected.");

// Test 3: Generic target users ('users')
const res3 = validateMvpInputQuality({
  ventureName: "AppX",
  targetUsers: "users",
  idea: "Task management web app with priority tags",
  problem: "Users forget deadlines on critical weekly projects",
});
assert.strictEqual(res3.valid, false);
assert.strictEqual(res3.message, EXPECTED_ERROR);
console.log("✓ Test 3 Passed: Generic target users ('users') rejected.");

// Test 4: Vague idea ('helping people')
const res4 = validateMvpInputQuality({
  ventureName: "HelpCo",
  targetUsers: "Dental Clinic Office Managers",
  idea: "helping people",
  problem: "High patient no-show rates for cleanings",
});
assert.strictEqual(res4.valid, false);
assert.strictEqual(res4.message, EXPECTED_ERROR);
console.log("✓ Test 4 Passed: Vague idea ('helping people') rejected.");

// Test 5: Vague problem ('i am solving the problem for founders')
const res5 = validateMvpInputQuality({
  ventureName: "SolveX",
  targetUsers: "Bootstrapped SaaS Founders",
  idea: "Automated Stripe churn alerts with discount triggers",
  problem: "i am solving the problem for founders",
});
assert.strictEqual(res5.valid, false);
assert.strictEqual(res5.message, EXPECTED_ERROR);
console.log("✓ Test 5 Passed: Vague problem ('i am solving the problem for founders') rejected.");

// Test 6: Vague problem ('making things easier')
const res6 = validateMvpInputQuality({
  ventureName: "EasyApp",
  targetUsers: "Shopify E-commerce Store Owners",
  idea: "Automated inventory restock notification agent",
  problem: "making things easier",
});
assert.strictEqual(res6.valid, false);
assert.strictEqual(res6.message, EXPECTED_ERROR);
console.log("✓ Test 6 Passed: Vague problem ('making things easier') rejected.");

// Test 7: Valid specific inputs
const res7 = validateMvpInputQuality({
  ventureName: "DocuFlow",
  targetUsers: "Commercial Real Estate Brokers",
  idea: "Automated lease compliance extraction from 100-page PDF contracts",
  problem: "Brokers spend 12 hours manually cross-checking tenant indemnity clauses in scanned PDFs",
});
assert.strictEqual(res7.valid, true);
console.log("✓ Test 7 Passed: Valid specific persona & concrete problem accepted.");

console.log("\nAll 7 MVP input quality tests passed successfully! 🚀");
