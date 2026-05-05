const fs = require('fs');
const PDFParser = require("pdf2json");
const llmService = require('../../services/llm/llmService');
const jobSpyService = require('../../services/jobSpyService');

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
        let { jobs } = req.body;

        if (!userProfile) {
            return res.status(400).json({ error: 'User profile not found. Please parse resume first.' });
        }

        // If jobs aren't provided, use JobSpy to fetch them based on user profile
        if (!jobs || jobs.length === 0) {
            const targetRole = userProfile.target_roles?.[0] || "software engineer";
            const location = userProfile.location_preference || "remote";

            console.log(`Fetching jobs via JobSpy for role: ${targetRole}, location: ${location}`);
            try {
                const fetchedJobs = await jobSpyService.fetchJobs({
                    search_term: targetRole,
                    location: location,
                    results_wanted: 5
                });

                // JobSpy returns a list of objects or sometimes empty list
                if (Array.isArray(fetchedJobs) && fetchedJobs.length > 0) {
                     jobs = fetchedJobs.map(job => ({
                         title: job.title,
                         company: job.company,
                         location: job.location,
                         apply_link: job.job_url,
                         job_type: job.job_type,
                         description: job.description
                     }));
                } else {
                     jobs = []; // no jobs found
                }
            } catch (err) {
                 console.error("JobSpy error, falling back to empty jobs list", err);
                 jobs = [];
            }
        }

        if (jobs.length === 0) {
            return res.json({ job_recommendations: [], message: "No jobs provided and JobSpy found no matching jobs." });
        }

        // We only send a subset of the job info to the LLM to avoid context limits
        const jobsForLLM = jobs.map(j => ({ title: j.title, company: j.company, description: j.description ? j.description.substring(0, 300) : '' }));

        const prompt = `Match the user profile against these jobs.\nUser:\n${JSON.stringify(userProfile)}\n\nJobs:\n${JSON.stringify(jobsForLLM)}`;
        const systemPrompt = "You are CareerOS AI. Return only a JSON array of job recommendations. Keep match reasons short.";

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
