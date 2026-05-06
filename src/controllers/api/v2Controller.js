const llmService = require('../../services/llm/llmService');

const tailorResume = async (req, res) => {
    try {
        const userProfile = req.body.userProfile || req.session.userProfile;
        const { job_description } = req.body;

        if (!userProfile) {
            return res.status(400).json({ error: 'User profile not found. Please parse resume first (V1).' });
        }

        if (!job_description) {
            return res.status(400).json({ error: 'job_description is required to tailor the resume.' });
        }

        const prompt = `
        Analyze this job description against the user's resume.
        User Resume Profile: ${JSON.stringify(userProfile)}
        Job Description: ${job_description}

        Suggest an ATS-optimized version of the resume.
        Identify missing keywords, recommend a template (e.g. Modern, Standard, Creative), and provide suggested edits for bullet points.
        Never invent experience. Preserve factual accuracy.
        `;

        const systemPrompt = `You are CareerOS AI. Return ONLY a JSON object exactly matching this schema:
        {
          "resume_tailoring": {
            "template_recommendation": "string",
            "ats_score": "number (0-100)",
            "keyword_gaps": ["array of strings"],
            "suggested_edits": [
              {
                 "original": "string",
                 "improved": "string",
                 "reason": "string"
              }
            ]
          }
        }`;

        const tailoredData = await llmService.callLLM(prompt, systemPrompt);

        res.json(JSON.parse(tailoredData));

    } catch (error) {
        console.error("Error tailoring resume", error);
        res.status(500).json({ error: 'Failed to tailor resume' });
    }
};

module.exports = {
    tailorResume
};
