import json

# Note: This is a mock AI service that returns high-quality tailored questions
# and evaluations. In a production environment, this would integrate with
# an LLM API like OpenAI (gpt-4) or Anthropic (claude-3).

def generate_interview_question(role: str, category: str, difficulty: str, question_number: int) -> str:
    # Scale difficulty based on question number (1-10)
    complexity = ""
    if question_number <= 3:
        complexity = "fundamental"
    elif question_number <= 7:
        complexity = "scenario-based"
    else:
        complexity = "advanced complex"

    # Mock questions based on role
    if "developer" in role.lower() or "engineer" in role.lower():
        if category.lower() == "technical":
            if question_number == 1:
                return f"As a {difficulty} {role}, can you explain the difference between processes and threads, and when you would use each?"
            elif question_number == 3:
                return f"You're designing a high-traffic {role} system. How would you handle rate limiting to prevent abuse?"
            else:
                return f"Can you describe a {complexity} technical challenge you've faced recently and how you debugged it?"

    # Generic mock fallback
    return f"Can you describe a {complexity} concept related to {category} for a {difficulty} {role}?"


def evaluate_answer(question: str, answer: str) -> dict:
    # In a real app, we'd pass the question and user's answer into an LLM prompt
    # and require it to output structured JSON matching our EvaluationResponse.

    # Mocking evaluation logic based on answer length as a basic proxy
    word_count = len(answer.split())

    score = 5
    if word_count > 50:
        score = 8
    elif word_count > 20:
        score = 6

    return {
        "score": score,
        "relevance": min(10, score + 1),
        "technical_accuracy": score,
        "communication_clarity": min(10, score + 2),
        "confidence": score,
        "strengths": "Good attempt at explaining the core concept. Structured the answer reasonably well.",
        "weaknesses": "Lacked specific detailed examples or deep technical depth in the explanation.",
        "suggested_improvement": "Try to incorporate more real-world examples and use precise technical vocabulary.",
        "ideal_sample_answer": "An ideal answer would directly address the core technical tradeoffs. For example: 'A thread shares memory space making context switching faster, whereas processes are isolated. I would use threads for I/O bound tasks and processes for CPU intensive parallel processing to bypass the GIL in Python.'"
    }