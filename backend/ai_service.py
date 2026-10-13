import json
import random
import re
import string

# ─────────────────────────────────────────────────────────
# QUESTION BANKS — role / category / tier
# ─────────────────────────────────────────────────────────
BANKS = {
  "Software Developer": {
    "Technical": {
      "basic": [
        "What is the difference between a stack and a queue? When would you use each?",
        "Explain object-oriented programming and its four core principles.",
        "What is the difference between synchronous and asynchronous programming?",
        "What is a REST API and how does it work?",
        "What is version control and what Git commands do you use most often?",
        "What is recursion? Explain with a simple example.",
        "What is the difference between an abstract class and an interface?",
        "What is a database index and why is it important?",
        "Explain what HTTP methods (GET, POST, PUT, DELETE) are used for.",
        "What is the difference between == and === in JavaScript?",
      ],
      "intermediate": [
        "How would you design a caching system to improve application performance?",
        "Explain the SOLID principles with real examples.",
        "When would you choose SQL over NoSQL and why?",
        "How do you handle race conditions in concurrent programming?",
        "What is dependency injection and how does it improve testability?",
        "Explain microservices architecture and its trade-offs vs monolith.",
        "How would you implement pagination for a large dataset REST API?",
        "What is the difference between horizontal and vertical scaling?",
        "How do you approach debugging a production issue with minimal logs?",
        "Explain the Observer and Factory design patterns with use-cases.",
      ],
      "advanced": [
        "Design a high-availability system that handles 1 million requests per second.",
        "How would you architect a real-time notification system for a social platform?",
        "Explain CAP theorem and how you'd design around it.",
        "How would you implement a distributed transaction across microservices?",
        "Describe implementing a rate limiter for a public API at scale.",
        "How would you design a search indexing system for 100 million documents?",
        "What is eventual consistency? Give a real-world example.",
        "How would you process 10TB of user event data daily?",
        "Describe how you'd implement a circuit breaker pattern in production.",
        "How would you design a multi-tenant SaaS ensuring data isolation?",
      ],
    },
    "HR": {
      "basic": [
        "Why did you choose software development as a career?",
        "How do you stay updated with new technologies?",
        "Tell me about a project you're most proud of.",
        "How do you handle code review feedback?",
        "What kind of development environment do you prefer and why?",
      ],
      "intermediate": [
        "Describe a technical disagreement with a teammate. How did you resolve it?",
        "How do you manage multiple projects with competing deadlines?",
        "Tell me about a time you had to learn a new technology very quickly.",
        "How do you explain complex technical concepts to non-technical stakeholders?",
        "Describe a situation where you identified and fixed a critical production bug.",
      ],
      "advanced": [
        "Tell me about a time you led a team through a major technical migration.",
        "How do you mentor junior developers? Give an example of measurable impact.",
        "Describe a time you pushed back on a technical decision from leadership.",
        "How do you balance technical debt with delivering new features?",
        "Tell me about a project you led that failed and what you learned.",
      ],
    },
    "Behavioral": {
      "basic": [
        "Tell me about a challenging coding problem. How did you approach it?",
        "How do you handle tight deadlines in development?",
        "Describe a situation where you adapted quickly to changing requirements.",
        "Give an example of going above and beyond what was expected.",
        "How do you prioritize tasks when you have multiple things to work on?",
      ],
      "intermediate": [
        "Tell me about a conflict in a development team and how you resolved it.",
        "Describe a time you improved a process or workflow in your team.",
        "Tell me about working with incomplete or ambiguous requirements.",
        "How have you handled a situation where a teammate wasn't contributing?",
        "Describe how you responded to and implemented critical feedback.",
      ],
      "advanced": [
        "Tell me about the most complex technical project you've worked on.",
        "Describe a trade-off you made between code quality and delivery speed.",
        "How have you driven adoption of a new technology in your organization?",
        "Tell me about a time you influenced stakeholders without direct authority.",
        "Describe your most impactful individual contribution to a software project.",
      ],
    },
  },
  "Data Analyst": {
    "Technical": {
      "basic": [
        "What is the difference between mean, median, and mode?",
        "Explain supervised vs unsupervised machine learning.",
        "What is a SQL JOIN? Explain the different types.",
        "What is data normalization and why is it important?",
        "How would you handle missing values in a dataset?",
        "What is the difference between a primary key and a foreign key?",
        "Explain what a pivot table is and how you use it.",
        "What is standard deviation and what does it tell you?",
        "How do you decide which chart type to use for a dataset?",
        "What is the difference between a left join and an inner join?",
      ],
      "intermediate": [
        "How would you build a customer churn prediction model?",
        "Explain A/B testing — how do you design and interpret results?",
        "What is the difference between correlation and causation?",
        "How do you detect and handle outliers in data?",
        "What is a confusion matrix? Explain precision and recall.",
        "How do you validate statistical significance of your findings?",
        "What is feature engineering and why does it matter?",
        "How would you design a dashboard to track business KPIs?",
        "What is time series analysis and where would you apply it?",
        "How do you ensure quality and accuracy in your analysis?",
      ],
      "advanced": [
        "Design an end-to-end pipeline for processing streaming clickstream data.",
        "How would you build a recommendation engine for e-commerce?",
        "Explain how to implement anomaly detection for financial fraud.",
        "How would you tackle analysis with ambiguous business requirements?",
        "Describe designing a data warehouse schema from scratch.",
        "How would you measure the long-term impact of a product feature?",
        "What is multi-armed bandit testing vs A/B testing?",
        "How would you use ML to optimize pricing strategies?",
        "How do you communicate counter-intuitive findings to leadership?",
        "Describe handling a scenario where data contradicts the hypothesis.",
      ],
    },
    "HR": {
      "basic": [
        "Why did you choose data analytics as a career?",
        "What excites you most about working with data?",
        "Tell me about a data project you've worked on.",
        "How do you keep your data skills current?",
        "What types of business problems do you enjoy solving with data?",
      ],
      "intermediate": [
        "Describe a time your analysis directly changed a business decision.",
        "How do you communicate complex findings to non-technical stakeholders?",
        "Tell me about a time your analysis was wrong. How did you handle it?",
        "How do you handle situations where data contradicts what stakeholders want to hear?",
        "Describe your experience working cross-functionally.",
      ],
      "advanced": [
        "Tell me about a time you built an analytics function from scratch.",
        "How have you influenced data culture in an organization?",
        "Describe the most strategically impactful analysis you've delivered.",
        "How do you balance speed of analysis with accuracy?",
        "Tell me about building trust with a skeptical stakeholder using data.",
      ],
    },
    "Behavioral": {
      "basic": [
        "Tell me about learning a new tool for a specific project.",
        "How do you handle ambiguous or incomplete data?",
        "Describe meeting a tight deadline for an analysis.",
        "How do you ensure your analysis is reproducible?",
        "How do you prioritize which analyses to work on?",
      ],
      "intermediate": [
        "Describe a time you found and fixed a critical data quality issue.",
        "Tell me about a conflict over data interpretation with a stakeholder.",
        "How have you improved a data process or workflow in your team?",
        "Describe defending your analytical methodology under pressure.",
        "Tell me about collaborating closely with engineers to get the data you needed.",
      ],
      "advanced": [
        "Tell me about the most complex analytical challenge you've faced.",
        "Describe influencing a major strategic decision using data.",
        "How have you built analytical capabilities in a team?",
        "Tell me about turning messy, unstructured data into actionable insights.",
        "Describe a project where the initial approach failed and how you pivoted.",
      ],
    },
  },
  "Product Manager": {
    "Technical": {
      "basic": [
        "What is a product roadmap and how do you prioritize features?",
        "Explain the concept of an MVP and its purpose.",
        "How do you use data and metrics to make product decisions?",
        "What is an OKR and how do you use it for product planning?",
        "What is user story mapping and how does it help in development?",
      ],
      "intermediate": [
        "How would you decide whether to build, buy, or partner for a capability?",
        "How do you conduct user research to validate a product hypothesis?",
        "How do you measure product-market fit?",
        "Explain how you balance technical debt with new feature development.",
        "How do you approach pricing strategy for a new product?",
      ],
      "advanced": [
        "How would you design a product strategy against a dominant incumbent?",
        "Describe handling a product pivot based on negative market feedback.",
        "How do you build and evolve a product vision over time?",
        "Describe managing a platform product with multiple competing stakeholders.",
        "How would you grow a product from 100K to 1M users?",
      ],
    },
    "HR": {
      "basic": [
        "Why do you want to be a Product Manager?",
        "How do you stay informed about industry trends?",
        "What does good product management look like to you?",
        "Tell me about a product you love and why.",
        "How do you handle disagreements with engineers or designers?",
      ],
      "intermediate": [
        "Tell me about a product you built end-to-end. What were the key decisions?",
        "Describe a time you had to say no to a feature request from leadership.",
        "How do you build trust with engineering and design teams?",
        "Tell me about a time a product launch didn't go as planned.",
        "How do you manage stakeholder expectations with competing priorities?",
      ],
      "advanced": [
        "Tell me about the highest-impact product decision you've ever made.",
        "How have you defined and communicated a product vision to your organization?",
        "Describe successfully entering a new market with a product.",
        "How do you create alignment around product strategy across multiple teams?",
        "Tell me about making a big product bet under significant uncertainty.",
      ],
    },
    "Behavioral": {
      "basic": [
        "How do you prioritize competing feature requests?",
        "Tell me about making a decision with limited data.",
        "How do you handle customer feedback that conflicts with your product vision?",
        "Describe your sprint planning process.",
        "How do you handle a situation when a product launch is at risk?",
      ],
      "intermediate": [
        "Tell me about a time you successfully influenced without direct authority.",
        "Describe a conflict between what customers wanted and what the business needed.",
        "Tell me about killing a product feature. How did you manage it?",
        "How have you used data to change someone's mind about a product decision?",
        "Describe failing to launch on time. What happened and what did you learn?",
      ],
      "advanced": [
        "Tell me about the most difficult product trade-off you've made.",
        "Describe aligning an organization around a controversial product direction.",
        "Tell me about transforming a failing product into a success.",
        "How have you built and scaled a high-performing product team?",
        "Describe your most significant product failure and what it taught you.",
      ],
    },
  },
  "UI UX Designer": {
    "Technical": {
      "basic": [
        "What is the difference between UI and UX design?",
        "What is a wireframe and how does it differ from a prototype?",
        "Explain user-centered design.",
        "What is a design system and why is it important?",
        "How do you approach designing for accessibility?",
      ],
      "intermediate": [
        "Walk me through your design process from brief to final delivery.",
        "How do you conduct usability testing and incorporate findings?",
        "What is information architecture and how does it impact UX?",
        "How do you design responsively for multiple devices?",
        "What user research methods do you use most often?",
      ],
      "advanced": [
        "How have you built or maintained a design system at scale?",
        "Describe redesigning a product with poor usability metrics.",
        "How do you balance business goals with user needs?",
        "Describe a time your design significantly improved a key business metric.",
        "How do you measure the success of a UX design post-launch?",
      ],
    },
    "HR": {
      "basic": [
        "What inspired you to pursue UX/UI design?",
        "What design tools do you use most and why?",
        "How do you take and incorporate design feedback?",
        "What kinds of projects do you find most exciting?",
        "How do you collaborate effectively with developers?",
      ],
      "intermediate": [
        "Tell me about a design project you're particularly proud of.",
        "How do you handle disagreements with stakeholders about design?",
        "Tell me about designing under significant constraints.",
        "How do you manage multiple design projects simultaneously?",
        "Describe advocating for the user against business pressure.",
      ],
      "advanced": [
        "Tell me about a design that had a measurable business impact.",
        "How have you influenced design culture in an organization?",
        "Describe leading a design team through significant ambiguity.",
        "Tell me about redesigning a core product experience end-to-end.",
        "How do you balance innovation with design consistency?",
      ],
    },
    "Behavioral": {
      "basic": [
        "Tell me about user feedback that changed your design direction.",
        "How do you handle tight deadlines in the design process?",
        "Describe simplifying a design that was overly complex.",
        "Tell me about defending a design decision under pressure.",
        "How do you approach designing something you personally disagree with?",
      ],
      "intermediate": [
        "Describe a time a usability test revealed a problem late in the process.",
        "How have you handled a situation where engineering couldn't implement your design?",
        "Tell me about a cross-functional project where design played a critical role.",
        "Describe pivoting a design based on data.",
        "Tell me about designing for a user group very different from yourself.",
      ],
      "advanced": [
        "Tell me about your most challenging design project.",
        "Describe driving a fundamental product design change.",
        "How have you built design thinking practices in a non-design team?",
        "Tell me about a design failure that taught you an important lesson.",
        "Describe designing for an emerging platform or technology.",
      ],
    },
  },
  "Marketing Executive": {
    "Technical": {
      "basic": [
        "What is the difference between inbound and outbound marketing?",
        "Explain what SEO is and why it's important.",
        "What metrics do you use to measure marketing campaign performance?",
        "What is a customer persona and how do you use it?",
        "Explain the concept of a marketing funnel.",
      ],
      "intermediate": [
        "How do you approach building a go-to-market strategy for a new product?",
        "What is attribution modeling in digital marketing?",
        "How do you use data to optimize a campaign mid-flight?",
        "Describe building a content marketing strategy from scratch.",
        "How do you measure ROI on marketing spend?",
      ],
      "advanced": [
        "How would you design a multi-channel strategy for a global product launch?",
        "Describe building and scaling a demand generation engine.",
        "How do you approach brand positioning in a competitive market?",
        "Describe how you grew a user base exponentially. What were the key levers?",
        "How do you integrate product-led growth into traditional marketing?",
      ],
    },
    "HR": {
      "basic": [
        "Why did you choose marketing as a career?",
        "What marketing channels do you have most experience with?",
        "How do you stay current with marketing trends?",
        "What campaigns are you most proud of?",
        "How do you collaborate with sales and product teams?",
      ],
      "intermediate": [
        "Tell me about a campaign that didn't perform as expected. What did you learn?",
        "How do you manage and prioritize multiple marketing initiatives?",
        "Tell me about marketing a product you didn't fully believe in.",
        "How do you handle data that contradicts your marketing instincts?",
        "Describe building a marketing function from scratch.",
      ],
      "advanced": [
        "Tell me about the highest-impact marketing initiative you've led.",
        "How have you built a marketing organization or team?",
        "Describe successfully repositioning a brand.",
        "Tell me about driving significant revenue through marketing.",
        "How do you create alignment between marketing and business strategy?",
      ],
    },
    "Behavioral": {
      "basic": [
        "Tell me about adjusting a campaign strategy mid-execution.",
        "How do you handle tight timelines for marketing deliverables?",
        "Describe working with a very limited budget.",
        "How do you approach understanding a new target audience?",
        "Tell me about getting leadership buy-in on a marketing idea.",
      ],
      "intermediate": [
        "Describe coordinating a complex multi-team campaign launch.",
        "Tell me about a conflict with another department over priorities.",
        "Describe turning a marketing failure into a learning opportunity.",
        "How have you used data to change your marketing approach?",
        "Tell me about marketing to an audience you hadn't targeted before.",
      ],
      "advanced": [
        "Describe the most complex marketing challenge you've faced.",
        "Tell me about making a major marketing bet with limited data.",
        "Describe driving cultural change through marketing.",
        "Tell me about navigating a PR or marketing crisis.",
        "How have you influenced company strategy through marketing insights?",
      ],
    },
  },
}

FALLBACK = {
    "basic": [
        "Can you walk me through your background and main skills?",
        "What motivates you in your professional life?",
        "How do you approach learning new skills?",
        "What would your colleagues say are your greatest strengths?",
        "How do you handle working in a fast-paced environment?",
    ],
    "intermediate": [
        "Describe a challenging project and your approach to solving it.",
        "How do you handle competing priorities and deadlines?",
        "Tell me about a conflict with a colleague and how you resolved it.",
        "How do you stay updated on industry developments?",
        "Describe a process improvement you implemented.",
    ],
    "advanced": [
        "What is the highest-impact contribution you've made in your career?",
        "Describe how you've influenced organizational strategy or direction.",
        "Tell me about leading through significant ambiguity.",
        "How do you build trust with new stakeholders quickly?",
        "Describe the most complex challenge you've faced and how you resolved it.",
    ],
}

# ─────────────────────────────────────────────────────────
def normalize(text: str) -> str:
    """Normalize text by lowercasing, stripping, and removing punctuation."""
    if not text: return ""
    # Remove punctuation
    text = text.translate(str.maketrans('', '', string.punctuation))
    # Lowercase and strip
    return " ".join(text.lower().split())


RELEVANCE_MAP = {
    "stack": ["lifo", "last in", "plate", "undo", "redo", "push", "pop"],
    "queue": ["fifo", "first in", "line", "schedule", "bfs", "enqueue", "dequeue"],
    "rest": ["http", "get", "post", "put", "delete", "stateless", "json", "endpoint", "resource"],
    "sql": ["relational", "schema", "table", "acid", "transaction", "join", "query", "normalization"],
    "nosql": ["document", "key-value", "flexible", "scalable", "schema", "mongodb", "dynamo"],
    "oop": ["encapsulation", "abstraction", "inheritance", "polymorphism", "class", "object", "interface"],
    "microservices": ["service", "decouple", "autonomous", "deploy", "network", "gateway", "monolith", "isolation"],
    "solid": ["single responsibility", "open/closed", "liskov", "interface segregation", "dependency inversion"],
    "ab test": ["hypothesis", "variant", "control", "metric", "confidence", "statistical", "significance"],
    "churn": ["prediction", "attrition", "retention", "user", "behavior", "metric", "engagement"],
    "cap theorem": ["consistency", "availability", "partition", "tolerance", "distributed", "eventual"],
}


# ─────────────────────────────────────────────────────────
# HELPER: find the right bank
# ─────────────────────────────────────────────────────────
def _find_bank(role: str, category: str):
    role_key = next((k for k in BANKS if k.lower() in role.lower() or role.lower() in k.lower()), None)
    if not role_key:
        return None, None
    cat_key = next((k for k in BANKS[role_key] if k.lower() in category.lower() or category.lower() in k.lower()), None)
    if not cat_key:
        cat_key = list(BANKS[role_key].keys())[0]
    return role_key, cat_key


# ─────────────────────────────────────────────────────────
# QUESTION GENERATION
# ─────────────────────────────────────────────────────────
def generate_interview_question(
    role: str,
    category: str,
    difficulty: str,
    question_number: int,
    asked_questions: list = None,
) -> str:
    # Normalize asked questions for strict comparison
    asked_normalized = {normalize(q) for q in (asked_questions or [])}

    # Tier based on question number (1-10)
    if question_number <= 3:
        tier = "basic"
    elif question_number <= 7:
        tier = "intermediate"
    else:
        tier = "advanced"

    role_key, cat_key = _find_bank(role, category)

    if role_key and cat_key:
        tier_pool = BANKS[role_key][cat_key][tier][:]
        all_pool = (
            BANKS[role_key][cat_key]["basic"]
            + BANKS[role_key][cat_key]["intermediate"]
            + BANKS[role_key][cat_key]["advanced"]
        )
    else:
        tier_pool = FALLBACK[tier][:]
        all_pool = FALLBACK["basic"] + FALLBACK["intermediate"] + FALLBACK["advanced"]

    # Try tier first
    random.shuffle(tier_pool)
    for q in tier_pool:
        if normalize(q) not in asked_normalized:
            return q

    # Fallback to any tier in the bank
    random.shuffle(all_pool)
    for q in all_pool:
        if normalize(q) not in asked_normalized:
            return q

    # Final emergency fallback - shouldn't happen with 10 questions/session
    fallback_q = random.choice(tier_pool) if tier_pool else f"Explain your approach to complex problem solving as a {role}."
    return fallback_q


# ─────────────────────────────────────────────────────────
# ANSWER EVALUATION
# ─────────────────────────────────────────────────────────
def evaluate_answer(question: str, answer: str) -> dict:
    # 1. Normalize for analysis
    q_norm = normalize(question)
    a_norm = normalize(answer)
    words = answer.split()
    word_count = len(words)
    
    # 2. Check for "Refusal" or "Irrelevance"
    refusal_signals = ["dont know", "do not know", "not sure", "no idea", "cant explain", "no clue"]
    is_refusal = any(sig in a_norm for sig in refusal_signals)
    
    # 3. Semantic Relevance Check (Heuristic)
    # Find relevant keywords for this question topic
    relevant_keywords = []
    for key, keywords in RELEVANCE_MAP.items():
        if key in q_norm:
            relevant_keywords.extend(keywords)
    
    # Check if any relevant keywords (if any) are in the answer
    semantic_match = False
    if relevant_keywords:
        match_count = sum(1 for kw in relevant_keywords if kw in a_norm)
        # Require at least 2 keywords for "Intermediate/Advanced" or 1 for "Basic" topics
        semantic_match = match_count >= 1
    else:
        # If no specific relevance map, rely on general tech signals or just length
        semantic_match = word_count >= 15

    # 4. Strict Scoring Logic
    # 0-3: Refusal, Unrelated, or Extremely Brief (<10 words)
    # 4-6: Partial (On topic but lacking depth/details)
    # 7-8: Good (On topic, good detail, example/structure)
    # 9-10: Excellent (Comprehensive, technical, structured, specific)
    
    score = 0
    if is_refusal or not semantic_match or word_count < 15:
        score = random.randint(1, 3)
    else:
        # Base score for on-topic answers
        score = 5
        # Structure/Depth bonuses
        has_example = any(p in a_norm for p in ["example", "instance", "such as", "experience", "implemented", "project"])
        has_structure = any(p in a_norm for p in ["first", "second", "third", "firstly", "additionally", "however", "therefore", "conclusion"])
        tech_hits = sum(1 for kw in ["algorithm", "architect", "framework", "pattern", "logic", "system", "process", "deploy", "optim"] if kw in a_norm)
        
        if word_count >= 100: score += 2
        elif word_count >= 50: score += 1
        
        if has_example: score += 1
        if has_structure: score += 1
        if tech_hits >= 2: score += 1
        
        score = min(10, score)

    # 5. Forced Strict Evidence-Based Evaluation
    snippet = " ".join(words[:6]) + "..." if len(words) > 6 else (answer or "[Empty Answer]")
    
    strengths = ""
    weaknesses = ""
    tip = ""
    
    if score <= 3:
        strengths = "None identified. The response was either a refusal or largely unrelated to the specific question asked."
        if is_refusal:
            weaknesses = f"You explicitly stated you were unsure or didn't know the answer. In a real interview, this is high-risk. Your response '{snippet}' provides no value to the evaluator."
        elif word_count < 15:
            weaknesses = f"Your answer '{snippet}' was far too brief to demonstrate any technical competency or relevant knowledge."
        else:
            weaknesses = f"The response '{snippet}' lacked semantic relevance to the question. You failed to address the core concepts of {question.split('?')[0]}."
        tip = "When you don't know an answer, try to explain your thought process or relate it to a concept you DO know rather than a flat refusal."
    
    elif score <= 6:
        strengths = f"You correctly identified the topic and addressed it with '{snippet}', which shows basic awareness."
        weaknesses = "Your answer lacks technical depth and specific examples. It's too generic and doesn't separate you from junior candidates."
        tip = "Try using specific technical terminology and provide a 'Result' from a past experience using the STAR method."
    
    else:
        strengths = f"Strong response. Your mention of {words[0]}... demonstrated clear understanding. Structure and detail were professional."
        weaknesses = "Minor. Could be improved by mentioning specific trade-offs or alternative approaches (e.g. what happens if your chosen method fails?)"
        tip = "To reach a 10/10, always conclude with a specific success metric or lesson learned from a real-world application."

    # 6. Final Pack
    return {
        "score": score,
        "relevance": min(10, score + (1 if semantic_match else -3)),
        "technical_accuracy": min(10, score + (1 if score > 7 else -2)),
        "communication_clarity": min(10, score + (1 if score > 5 else -1)),
        "confidence": 3 if is_refusal else (min(10, score + 1)),
        "strengths": strengths,
        "weaknesses": weaknesses,
        "suggested_improvement": tip,
        "ideal_sample_answer": _ideal_for(question),
    }


# ─────────────────────────────────────────────────────────
# IDEAL ANSWER TEMPLATES
# ─────────────────────────────────────────────────────────
_IDEAL_MAP = {
    ("stack", "queue"): (
        "A stack follows LIFO (Last In, First Out) — like a stack of plates; used for undo/redo or call stacks. "
        "A queue follows FIFO (First In, First Out) — like a bank line; used for job scheduling or BFS traversal."
    ),
    ("rest", "api"): (
        "REST uses HTTP methods (GET, POST, PUT, DELETE) to operate on resources identified by URLs. "
        "The server is stateless — each request carries all needed information. Responses are typically JSON. "
        "Example: GET /users returns all users; POST /users creates a new one."
    ),
    ("sql", "nosql"): (
        "SQL databases (PostgreSQL, MySQL) use structured schemas and support ACID transactions — ideal for relational data. "
        "NoSQL (MongoDB, DynamoDB) is schema-flexible and horizontally scalable — ideal for unstructured or high-throughput data. "
        "Choose SQL for financial systems; NoSQL for user profiles or real-time feeds."
    ),
    ("object-oriented", "oop"): (
        "OOP rests on four principles: Encapsulation (hide state behind interfaces), Abstraction (expose only what's needed), "
        "Inheritance (child classes extend parent behaviour), Polymorphism (same interface, different implementations). "
        "Example: a Shape base class with a draw() method overridden differently by Circle and Rectangle."
    ),
    ("microservices",): (
        "Microservices split an application into independently deployable services each owning its data. "
        "Benefits: independent scaling, tech flexibility, fault isolation. "
        "Trade-offs: network overhead, distributed tracing complexity. "
        "I've used an API gateway routing to dedicated auth, orders, and payments services."
    ),
    ("solid",): (
        "SOLID: Single Responsibility (one reason to change), Open/Closed (extend without modifying), "
        "Liskov Substitution (subtypes replace base types safely), Interface Segregation (small, focused interfaces), "
        "Dependency Inversion (depend on abstractions). These reduce coupling and aid maintainability."
    ),
    ("a/b test", "ab test"): (
        "Define a clear hypothesis, randomly split users into control (A) and variant (B), determine sample size for 95% confidence, "
        "measure primary metric + guardrail metrics. Avoid peeking at results before the test ends. "
        "Multi-armed bandit is an alternative that dynamically allocates traffic to better-performing variants."
    ),
    ("churn",): (
        "Define churn (e.g., 30 days inactive), engineer features (session frequency, feature adoption, support tickets), "
        "train a gradient-boosted classifier, validate with cross-validation. "
        "Feed high-risk users into a proactive CS outreach playbook and measure its effectiveness with a separate A/B test."
    ),
    ("cap theorem",): (
        "CAP states a distributed system can guarantee at most two of: Consistency, Availability, Partition tolerance. "
        "Since network partitions are inevitable, you choose between CP (consistent, may be unavailable — e.g., HBase) "
        "or AP (available, eventually consistent — e.g., Cassandra). Choose based on your business requirements."
    ),
    ("rate limit",): (
        "Implement a token bucket or sliding window algorithm. Store counters in Redis with TTL. "
        "For a distributed setup, use Redis Lua scripts for atomic counter updates. "
        "Return 429 Too Many Requests with a Retry-After header. Separate limits by API key and endpoint tier."
    ),
}

def _ideal_for(question: str) -> str:
    q = question.lower()
    for keys, answer in _IDEAL_MAP.items():
        if all(k in q for k in keys):
            return answer
    return (
        "An ideal response: clearly state your approach, support it with a specific example from your experience, "
        "explain the outcome or impact, and discuss any trade-offs or lessons learned. "
        "The strongest answers demonstrate not just knowledge, but practical application in realistic scenarios."
    )