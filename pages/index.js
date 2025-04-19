
import { useState, useEffect } from 'react';

export default function Home() {
  const [domain, setDomain] = useState('');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('linkr-history') || '[]');
    setHistory(saved);
  }, []);

  const runLinkr = async () => {
    if (!domain) return;

    const cached = history.find(h => h.domain === domain);
    if (cached) {
      setOutput(cached.output);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/linkr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain }),
      });

      const data = await res.json();
      if (data.output) {
        setOutput(data.output);
        const updatedHistory = [{ domain, output: data.output }, ...history].slice(0, 5);
        setHistory(updatedHistory);
        localStorage.setItem('linkr-history', JSON.stringify(updatedHistory));
      }
    } catch (err) {
      setOutput(`❌ Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-purple-900 text-white p-6">
      <div className="flex items-center gap-4 mb-6">
        <img src="/logo.png" alt="Lynkr Logo" className="h-14" />
        <h1 className="text-4xl font-bold">LINKR – Data Monetization Studio</h1>
      </div>
      <input
        value={domain}
        onChange={(e) => setDomain(e.target.value)}
        placeholder="Enter a company domain (e.g. qualifacts.com)"
        className="p-2 rounded bg-gray-800 text-white w-full mb-4"
      />
      <button
        onClick={runLinkr}
        disabled={loading || !domain}
        className="bg-indigo-600 px-4 py-2 rounded text-white"
      >
        {loading ? 'Analyzing...' : 'Run LINKR'}
      </button>

      {loading && (
        <div className="mt-4 text-indigo-400 animate-pulse">🔄 Thinking...</div>
      )}

      <pre className="mt-6 whitespace-pre-wrap text-sm bg-gray-900 p-4 rounded">
        {output}
      </pre>

      {history.length > 0 && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-2">Recent Queries</h2>
          <ul className="space-y-1">
            {history.map((item, idx) => (
              <li key={idx}>
                <button
                  onClick={() => {
                    setDomain(item.domain);
                    setOutput(item.output);
                  }}
                  className="text-indigo-400 hover:underline"
                >
                  {item.domain}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
