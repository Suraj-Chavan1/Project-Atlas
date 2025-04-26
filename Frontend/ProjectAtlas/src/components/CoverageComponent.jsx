import { useEffect, useState } from "react";

const CoverageComponent = () => {
  const [coverage, setCoverage] = useState(null);

  useEffect(() => {
    // Function to fetch coverage
    const fetchCoverage = () => {
      fetch("https://atlas-test-cases-f2kg.vercel.app/coverage")
        .then((res) => res.json())
        .then((data) => {
          // Get the first key's data (ANUJT65/Jira_Testcases)
          const firstKey = Object.keys(data)[0];
          if (data[firstKey]?.totals) {
            setCoverage(data[firstKey]);
          } else {
            setCoverage(null);
          }
        })
        .catch((err) => {
          console.error("Failed to fetch coverage", err);
          setCoverage(null);
        });
    };

    // Fetch immediately
    fetchCoverage();

    // Then fetch every 10 seconds
    const intervalId = setInterval(fetchCoverage, 10000); // every 10 seconds

    return () => clearInterval(intervalId); // cleanup on unmount
  }, []);

  return (
    coverage?.totals && (
      <div style={{
        padding: '8px',
        margin: '4px',
        border: '1px solid #e0e0e0',
        borderRadius: '4px',
        backgroundColor: '#f8f9fa',
        fontSize: '0.85rem'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '4px'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: '4px',
            backgroundColor: '#fff',
            borderRadius: '2px'
          }}>
            <span style={{ fontWeight: '500' }}>Coverage:</span>
            <span>{coverage.totals.percent_covered}%</span>
          </div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: '4px',
            backgroundColor: '#fff',
            borderRadius: '2px'
          }}>
            <span style={{ fontWeight: '500' }}>Lines:</span>
            <span>{coverage.totals.covered_lines}/{coverage.totals.num_statements}</span>
          </div>
        </div>
      </div>
    )
  );
};

export default CoverageComponent;
