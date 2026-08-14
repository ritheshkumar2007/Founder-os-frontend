const mongoose = require('mongoose');

// Interview Subdocument Schema
const interviewSchema = new mongoose.Schema(
  {
    personName: {
      type: String,
      required: [true, 'Person name is required'],
      trim: true,
    },
    role: {
      type: String,
      trim: true,
      default: '',
    },
    quote: {
      type: String,
      trim: true,
      default: '',
    },
    painLevel: {
      type: String,
      enum: {
        values: ['LOW', 'MEDIUM', 'HIGH'],
        message: 'Pain level must be LOW, MEDIUM, or HIGH',
      },
      required: [true, 'Pain level is required'],
    },
    wouldPay: {
      type: String,
      enum: {
        values: ['YES', 'MAYBE', 'NO'],
        message: 'Would pay must be YES, MAYBE, or NO',
      },
      required: [true, 'Would pay selection is required'],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

// Launch Sprint Task Subdocument Schema
const sprintTaskSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: [true, 'Task text is required'],
      trim: true,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
  },
  { timestamps: true }
);

// Launch Sprint Day Subdocument Schema
const sprintDaySchema = new mongoose.Schema(
  {
    day: {
      type: Number,
      required: true,
      min: 1,
      max: 7,
    },
    title: {
      type: String,
      trim: true,
      default: '',
    },
    tasks: [sprintTaskSchema],
  },
  { _id: true }
);

// Traction History Snapshot Subdocument Schema
const tractionHistorySchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      default: Date.now,
    },
    peopleContacted: { type: Number, default: 0 },
    customerInterviews: { type: Number, default: 0 },
    waitlistSignups: { type: Number, default: 0 },
    mvpUsers: { type: Number, default: 0 },
    activeUsers: { type: Number, default: 0 },
    payingUsers: { type: Number, default: 0 },
    monthlyRevenue: { type: Number, default: 0 },
    currentTractionStage: { type: String, default: 'Pre-Launch' },
  },
  { _id: true }
);

// Venture Main Schema
const ventureSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    ventureName: {
      type: String,
      required: [true, 'Venture name is required'],
      trim: true,
    },
    ideaValidation: {
      ventureBrief: {
        building: { type: String, trim: true, default: '' },
        targetCustomer: { type: String, trim: true, default: '' },
        problem: { type: String, trim: true, default: '' },
        currentWorkaround: { type: String, trim: true, default: '' },
        desiredOutcome: { type: String, trim: true, default: '' },
        generatedSummary: {
          targetCustomer: { type: String, default: '' },
          problemStatement: { type: String, default: '' },
          currentWorkaround: { type: String, default: '' },
          valueProposition: { type: String, default: '' },
          riskiestAssumption: { type: String, default: '' },
        },
      },
      customerValidation: {
        validationPlan: { type: String, trim: true, default: '' },
        interviews: [interviewSchema],
      },
      validationInsights: {
        totalInterviews: { type: Number, default: 0 },
        highPainCount: { type: Number, default: 0 },
        wouldPayCount: { type: Number, default: 0 },
        repeatedPainPoints: [{ type: String }],
        quotes: [{ type: String }],
        warningSigns: [{ type: String }],
        positiveSignals: [{ type: String }],
        decision: {
          type: String,
          enum: ['Keep Validating', 'Promising Signal', 'Revisit Customer Problem'],
          default: 'Keep Validating',
        },
        lastAnalyzedAt: { type: Date },
      },
      founderNotes: {
        text: { type: String, default: '' },
        updatedAt: { type: Date, default: Date.now },
      },
      progress: {
        currentStep: { type: String, default: 'Venture Brief' },
        unlockedStep: { type: String, default: 'Venture Brief' },
        completedSteps: [{ type: String }],
      },
      validationState: {
        currentQuestion: { type: Number, default: 1, min: 1, max: 6 },
        answers: {
          question1: { type: String, default: null },
          question2: { type: String, default: null },
          question3: { type: String, default: null },
          question4: { type: String, default: null },
          question5: { type: String, default: null },
        },
        completed: { type: Boolean, default: false },
        score: { type: mongoose.Schema.Types.Mixed, default: null },
        lastEvaluatedAt: { type: Date, default: Date.now },
      },
      ideaScore: {
        overallScore: { type: Number, default: 0, min: 0, max: 100 },
        tier: {
          type: String,
          enum: ['Exceptional', 'Promising', 'Early Stage', 'High Risk', 'Unrated'],
          default: 'Unrated',
        },
        pillars: {
          problemSeverity: {
            score: { type: Number, default: 0, min: 0, max: 25 },
            reasoning: { type: String, default: '' },
          },
          willingnessToPay: {
            score: { type: Number, default: 0, min: 0, max: 20 },
            reasoning: { type: String, default: '' },
          },
          distribution: {
            score: { type: Number, default: 0, min: 0, max: 20 },
            reasoning: { type: String, default: '' },
          },
          unfairAdvantage: {
            score: { type: Number, default: 0, min: 0, max: 15 },
            reasoning: { type: String, default: '' },
          },
          executionSpeed: {
            score: { type: Number, default: 0, min: 0, max: 20 },
            reasoning: { type: String, default: '' },
          },
        },
        strengths: [{ type: String }],
        risks: [{ type: String }],
        recommendations: [{ type: String }],
        interviewMultiplier: { type: Number, default: 1.0 },
        lastCalculatedAt: { type: Date },
      },
    },
    mvpScope: {
      coreCustomerProblem: { type: String, trim: true, default: '' },
      mainCustomerJob: { type: String, trim: true, default: '' },
      mvpPromise: { type: String, trim: true, default: '' },
      desiredOutcome: { type: String, trim: true, default: '' },
      mustHaveFeatures: [{ type: String }],
      excludedFeatures: [{ type: String }],
      buildTarget: {
        type: String,
        trim: true,
        default: 'Build a usable MVP in two weeks.',
      },
      buildNow: [{ type: String }],
      buildLater: [{ type: String }],
      isSaved: { type: Boolean, default: false },
      createdAt: { type: Date, default: Date.now },
      updatedAt: { type: Date, default: Date.now },
    },
    marketingPlan: {
      idealCustomerProfile: { type: String, trim: true, default: '' },
      positioningStatement: { type: String, trim: true, default: '' },
      marketingMessage: { type: String, trim: true, default: '' },
      landingPageHeadline: { type: String, trim: true, default: '' },
      callToAction: { type: String, trim: true, default: '' },
      launchChannels: [{ type: String }],
      directOutreachMessage: { type: String, trim: true, default: '' },
      communityPostTemplate: { type: String, trim: true, default: '' },
      referralIdea: { type: String, trim: true, default: '' },
      contentIdeas: [{ type: String }],
      first100UsersStrategy: { type: String, trim: true, default: '' },
      isSaved: { type: Boolean, default: false },
      createdAt: { type: Date, default: Date.now },
      updatedAt: { type: Date, default: Date.now },
    },
    launchSprint: {
      overallProgress: { type: Number, default: 0, min: 0, max: 100 },
      currentDay: { type: Number, default: 1, min: 1, max: 7 },
      remainingTasks: { type: Number, default: 0 },
      completedTasks: { type: Number, default: 0 },
      successGoal: {
        type: String,
        trim: true,
        default: 'Get 5 early users to try the product.',
      },
      days: [sprintDaySchema],
      isSaved: { type: Boolean, default: false },
      createdAt: { type: Date, default: Date.now },
      updatedAt: { type: Date, default: Date.now },
    },
    traction: {
      peopleContacted: { type: Number, default: 0, min: 0 },
      customerInterviews: { type: Number, default: 0, min: 0 },
      waitlistSignups: { type: Number, default: 0, min: 0 },
      mvpUsers: { type: Number, default: 0, min: 0 },
      activeUsers: { type: Number, default: 0, min: 0 },
      payingUsers: { type: Number, default: 0, min: 0 },
      monthlyRevenue: { type: Number, default: 0, min: 0 },
      metrics: {
        contactToUserConversion: { type: Number, default: 0 },
        userToPayingConversion: { type: Number, default: 0 },
        revenuePerPayingUser: { type: Number, default: 0 },
        currentTractionStage: {
          type: String,
          enum: ['Pre-Launch', 'Early Validation', 'First Revenue', 'Growing Startup'],
          default: 'Pre-Launch',
        },
      },
      history: [tractionHistorySchema],
      isSaved: { type: Boolean, default: false },
      createdAt: { type: Date, default: Date.now },
      updatedAt: { type: Date, default: Date.now },
    },
    investorUpdate: {
      companyName: { type: String, trim: true, default: '' },
      problem: { type: String, trim: true, default: '' },
      solution: { type: String, trim: true, default: '' },
      targetCustomer: { type: String, trim: true, default: '' },
      validationEvidence: { type: String, trim: true, default: '' },
      mvpProgress: { type: String, trim: true, default: '' },
      marketingProgress: { type: String, trim: true, default: '' },
      launchProgress: { type: String, trim: true, default: '' },
      tractionSummary: { type: String, trim: true, default: '' },
      keyLearnings: { type: String, trim: true, default: '' },
      nextMilestone: { type: String, trim: true, default: '' },
      fundingNeeded: { type: String, trim: true, default: 'Not yet specified' },
      isSaved: { type: Boolean, default: false },
      generatedAt: { type: Date, default: Date.now },
      updatedAt: { type: Date, default: Date.now },
    },
    roadmap: {
      currentMilestone: { type: String, trim: true, default: 'MVP Build' },
      milestones: [
        {
          title: { type: String, trim: true, default: '' },
          status: {
            type: String,
            enum: ['PLANNED', 'IN_PROGRESS', 'COMPLETED'],
            default: 'PLANNED',
          },
          targetDate: { type: Date },
          tasks: [{ type: String }],
        },
      ],
      isSaved: { type: Boolean, default: false },
      createdAt: { type: Date, default: Date.now },
      updatedAt: { type: Date, default: Date.now },
    },
    // Founder Memory Extended Fields
    founderJourney: {
      currentStage: {
        type: String,
        enum: ['idea_validation', 'mvp_scope', 'roadmap', 'marketing_plan', 'growth'],
        default: 'idea_validation',
      },
      completedStages: {
        ideaValidation: { type: Boolean, default: false },
        mvpScope: { type: Boolean, default: false },
        roadmap: { type: Boolean, default: false },
        marketingPlan: { type: Boolean, default: false },
        growth: { type: Boolean, default: false },
      },
      updatedAt: { type: Date, default: Date.now },
    },
    businessModel: { type: String, trim: true, default: '' },
    pricing: { type: String, trim: true, default: '' },
    competitors: [{ type: String }],
    risks: [{ type: String }],
  },
  {
    timestamps: true,
  }
);

const Venture = mongoose.model('Venture', ventureSchema);

module.exports = Venture;
