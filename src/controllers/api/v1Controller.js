const fs = require('fs');
const PDFParser = require("pdf2json");
const llmService = require('../../services/llm/llmService');

const parseResume = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No resume file uploaded' });
        }

        const pdfParser = new PDFParser(this, 1);

        pdfParser.on("pdfParser_dataError", errData => {
            console.error(errData.parserError);
            fs.unlinkSync(req.file.path);
            return res.status(500).json({ error: 'Failed to parse resume' });
        });

        pdfParser.on("pdfParser_dataReady", async pdfData => {
            const resumeText = pdfParser.getRawTextContent();

            // Clean up uploaded file
            fs.unlinkSync(req.file.path);

            const prompt = `Extract details from this resume:\n${resumeText}`;
            const systemPrompt = "You are CareerOS AI. Return only a JSON object matching the user_summary schema.";

            try {
                const extractedData = await llmService.callLLM(prompt, systemPrompt);

                // Save to session for subsequent steps
                req.session.userProfile = JSON.parse(extractedData);

                res.json({ user_summary: req.session.userProfile });
            } catch (err) {
                 console.error("Error from LLM service", err);
                 res.status(500).json({ error: 'Failed to process resume' });
            }
        });

        pdfParser.loadPDF(req.file.path);

    } catch (error) {
        console.error("Error parsing resume", error);
        res.status(500).json({ error: 'Failed to parse resume' });
    }
};

const suggestRoles = async (req, res) => {
    try {
        const userProfile = req.body.userProfile || req.session.userProfile;

        if (!userProfile) {
            return res.status(400).json({ error: 'User profile not found. Please parse resume first.' });
        }

        const prompt = `Suggest roles for the following user profile:\n${JSON.stringify(userProfile)}`;
        const systemPrompt = "You are CareerOS AI. Return only a JSON array of role suggestions.";

        const rolesData = await llmService.callLLM(prompt, systemPrompt);

        res.json({ role_suggestions: JSON.parse(rolesData) });

    } catch (error) {
        console.error("Error suggesting roles", error);
        res.status(500).json({ error: 'Failed to suggest roles' });
    }
};

const matchJobs = async (req, res) => {
    try {
        const userProfile = req.body.userProfile || req.session.userProfile;
        const { jobs } = req.body; // Application provides job listings

        if (!userProfile) {
            return res.status(400).json({ error: 'User profile not found. Please parse resume first.' });
        }

        if (!jobs || !Array.isArray(jobs)) {
            return res.status(400).json({ error: 'Jobs array is required.' });
        }

        const prompt = `Match the user profile against these jobs.\nUser:\n${JSON.stringify(userProfile)}\n\nJobs:\n${JSON.stringify(jobs)}`;
        const systemPrompt = "You are CareerOS AI. Return only a JSON array of job recommendations.";

        const matchedJobsData = await llmService.callLLM(prompt, systemPrompt);

        res.json({ job_recommendations: JSON.parse(matchedJobsData) });

    } catch (error) {
        console.error("Error matching jobs", error);
        res.status(500).json({ error: 'Failed to match jobs' });
    }
};

module.exports = {
    parseResume,
    suggestRoles,
    matchJobs
};
