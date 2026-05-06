import React, { useState } from 'react';
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000',
  withCredentials: true // needed for session cookies
});

function App() {
  const [email, setEmail] = useState('');
  const [loginMessage, setLoginMessage] = useState('');
  const [user, setUser] = useState(null);

  const [resume, setResume] = useState(null);
  const [profile, setProfile] = useState(null);
  const [roles, setRoles] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/login', { email });
      setLoginMessage(res.data.message);
      // For this demo, let's just bypass the magic link step and force test-login so we can show the UI quickly
      const bypass = await api.post('/auth/test-login');
      setUser(bypass.data.user || { email: 'test@example.com' });
    } catch (err) {
      setLoginMessage("Login failed");
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!resume) return;
    setLoading(true);
    const formData = new FormData();
    formData.append('resume', resume);
    try {
      const res = await api.post('/api/v1/parse-resume', formData);
      setProfile(res.data.user_summary);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const res = await api.post('/api/v1/suggest-roles', { userProfile: profile });
      setRoles(res.data.role_suggestions);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const fetchJobs = async () => {
    setLoading(true);
    try {
      // Empty jobs array will trigger JobSpy in backend
      const res = await api.post('/api/v1/match-jobs', { userProfile: profile, jobs: [] });
      setJobs(res.data.job_recommendations);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  if (!user) {
    return (
      <div className="flex h-screen bg-gray-100 justify-center items-center">
        <form onSubmit={handleLogin} className="bg-white p-8 rounded shadow-md w-96">
          <h1 className="text-2xl font-bold mb-4">CareerOS Login</h1>
          <input
            type="email"
            placeholder="Email address"
            className="w-full p-2 border rounded mb-4"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded font-semibold hover:bg-blue-700">
            Send Magic Link
          </button>
          {loginMessage && <p className="mt-4 text-sm text-gray-600">{loginMessage}</p>}
          <p className="mt-2 text-xs text-blue-500">* Demo mode: Instantly logs in for testing</p>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* Header */}
        <div className="bg-white p-6 rounded shadow flex justify-between items-center">
           <div>
              <h1 className="text-3xl font-bold text-gray-800">CareerOS Dashboard</h1>
              <p className="text-gray-500">Welcome, {user.email}</p>
           </div>
        </div>

        {/* Upload Resume */}
        <div className="bg-white p-6 rounded shadow">
           <h2 className="text-xl font-semibold mb-4">1. Upload Resume</h2>
           <form onSubmit={handleUpload} className="flex space-x-4">
              <input
                type="file"
                accept="application/pdf"
                className="flex-1 p-2 border rounded"
                onChange={(e) => setResume(e.target.files[0])}
                required
              />
              <button type="submit" disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded">
                 {loading ? 'Parsing...' : 'Parse Resume'}
              </button>
           </form>

           {profile && (
             <div className="mt-6 p-4 bg-blue-50 rounded">
                <h3 className="font-bold">Extracted Profile</h3>
                <p><strong>Level:</strong> {profile.experience_level}</p>
                <p><strong>Location:</strong> {profile.location_preference}</p>
                <p><strong>Skills:</strong> {profile.top_skills?.join(', ')}</p>
                <p><strong>Target:</strong> {profile.target_roles?.join(', ')}</p>
             </div>
           )}
        </div>

        {/* Suggest Roles */}
        {profile && (
          <div className="bg-white p-6 rounded shadow">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">2. Role Suggestions</h2>
              <button onClick={fetchRoles} disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded">
                 {loading ? 'Loading...' : 'Get Roles'}
              </button>
            </div>

            {roles.length > 0 && (
              <div className="grid gap-4 md:grid-cols-2">
                 {roles.map((r, i) => (
                    <div key={i} className="p-4 border rounded">
                       <h3 className="font-bold text-lg">{r.role} <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded ml-2">Fit: {r.fit_score}%</span></h3>
                       <p className="text-gray-600 mt-2 text-sm">{r.reason}</p>
                    </div>
                 ))}
              </div>
            )}
          </div>
        )}

        {/* Match Jobs */}
        {profile && (
          <div className="bg-white p-6 rounded shadow">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">3. Discover & Match Live Jobs</h2>
              <button onClick={fetchJobs} disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded">
                 {loading ? 'Scraping Jobs via JobSpy...' : 'Find Jobs'}
              </button>
            </div>

            {jobs.length > 0 && (
              <div className="space-y-4">
                 {jobs.map((j, i) => (
                    <div key={i} className="p-4 border rounded flex justify-between items-start">
                       <div>
                          <h3 className="font-bold text-lg text-blue-800">{j.title}</h3>
                          <p className="text-gray-700 font-medium">{j.company} &bull; {j.location}</p>
                          <p className="text-gray-500 text-sm mt-2">{j.match_reason}</p>
                          {j.missing_skills?.length > 0 && (
                             <p className="text-red-500 text-sm mt-1">Missing: {j.missing_skills.join(', ')}</p>
                          )}
                       </div>
                       <div className="text-right">
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-bold block mb-2">{j.recommendation_level} ({j.fit_score}%)</span>
                          <a href={j.apply_link} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline text-sm font-semibold">Apply Here &rarr;</a>
                       </div>
                    </div>
                 ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

export default App;
