const { PythonShell } = require('python-shell');
const path = require('path');

const fetchJobs = async (searchOptions) => {
    return new Promise((resolve, reject) => {
        const options = {
            mode: 'json',
            pythonPath: 'python3', // Requires python3 and jobspy installed on the system
            scriptPath: path.join(__dirname, '../../python-scripts'),
            args: [JSON.stringify(searchOptions)]
        };

        PythonShell.run('jobspy_runner.py', options).then(messages => {
             if (messages && messages.length > 0) {
                 resolve(messages[0]);
             } else {
                 resolve([]);
             }
        }).catch(err => {
            console.error("JobSpy Error:", err);
            reject(err);
        });
    });
};

module.exports = { fetchJobs };
