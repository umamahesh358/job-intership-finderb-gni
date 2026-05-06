const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const { wrapper } = require('axios-cookiejar-support');
const { CookieJar } = require('tough-cookie');

const jar = new CookieJar();
const client = wrapper(axios.create({ jar, withCredentials: true }));

async function run() {
    try {
        console.log("1. Test Login");
        await client.post('http://localhost:3000/auth/test-login');

        console.log("2. Upload Resume");
        const form = new FormData();
        form.append('resume', fs.createReadStream('test-data/test_resume.pdf'));
        const parseRes = await client.post('http://localhost:3000/api/v1/parse-resume', form, {
            headers: form.getHeaders()
        });
        console.log("Parse Result:", parseRes.data);

        console.log("3. Suggest Roles");
        const rolesRes = await client.post('http://localhost:3000/api/v1/suggest-roles');
        console.log("Role Suggestions:", rolesRes.data);

        console.log("4. Match Jobs (With provided jobs)");
        const jobsRes = await client.post('http://localhost:3000/api/v1/match-jobs', {
            jobs: [
                {
                    "title": "Frontend Engineer",
                    "company": "Tech Corp",
                    "source": "LinkedIn",
                    "location": "Remote",
                    "job_type": "Full-time",
                    "apply_link": "http://example.com/apply/1"
                }
            ]
        });
        console.log("Job Matches:", jobsRes.data);

        console.log("5. Match Jobs (Using JobSpy)");
        const spyRes = await client.post('http://localhost:3000/api/v1/match-jobs', {
            jobs: [] // empty array forces jobspy to trigger
        });
        console.log("Job Matches (JobSpy):", spyRes.data);

        console.log("6. Tailor Resume (V2)");
        const tailorRes = await client.post('http://localhost:3000/api/v2/tailor-resume', {
            job_description: "We are looking for a highly skilled React developer with experience in Node.js and TypeScript."
        });
        console.log("Tailor Resume Result:", tailorRes.data);

    } catch (e) {
        console.error("Test failed:", e.response ? e.response.data : e.message);
    }
}
run();
