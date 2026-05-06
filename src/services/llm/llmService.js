// Dummy LLM service. In a real application, this would call Groq or a local model.
// We use deterministic logic/mock data here if no API keys are provided as per the rules.

const callLLM = async (prompt, systemPrompt, format = "json") => {
    // In production, implement Groq or Local LLM call here based on mode.
    // For this prototype we will return simulated structured data.

    // Simulate LLM delay
    await new Promise(resolve => setTimeout(resolve, 500));

    if (prompt.includes('Extract details from this resume')) {
        return JSON.stringify({
             "experience_level": "Entry Level",
             "top_skills": ["JavaScript", "React", "Node.js"],
             "target_roles": ["Frontend Developer", "Full Stack Developer"],
             "location_preference": "Remote",
             "work_preference": "Full-time"
        });
    }

    if (prompt.includes('Suggest roles for the following user profile')) {
        return JSON.stringify([
            {
                "role": "Frontend Developer",
                "fit_score": 90,
                "reason": "Strong JavaScript and React skills match typical frontend requirements."
            },
            {
                "role": "Full Stack Developer",
                "fit_score": 80,
                "reason": "Experience with Node.js provides a foundation for full stack work."
            }
        ]);
    }

    if (prompt.includes('Match the user profile against these jobs')) {
        return JSON.stringify([
             {
                "title": "Frontend Engineer",
                "company": "Tech Corp",
                "source": "LinkedIn",
                "location": "Remote",
                "job_type": "Full-time",
                "apply_link": "http://example.com/apply/1",
                "fit_score": 85,
                "match_reason": "High skill overlap in React.",
                "missing_skills": ["TypeScript"],
                "recommendation_level": "Strong Match"
             }
        ]);
    }

    if (prompt.includes('Analyze this job description against the user\'s resume')) {
        return JSON.stringify({
          "resume_tailoring": {
            "template_recommendation": "Modern Tech Template",
            "ats_score": 75,
            "keyword_gaps": ["TypeScript", "GraphQL", "CI/CD"],
            "suggested_edits": [
              {
                 "original": "Built frontend using React.",
                 "improved": "Architected responsive frontend interfaces utilizing React and modern hooks, increasing user engagement.",
                 "reason": "Includes stronger action verbs and highlights impact."
              }
            ]
          }
        });
    }

    return JSON.stringify({ error: "Unknown prompt type" });
};

module.exports = {
    callLLM
};
