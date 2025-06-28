import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './RecommendationSection.css';
import { getCurrentUser, isAuthenticated, isTokenValid } from '../utils/auth';

const RecommendationSection = ({ title = 'Recommended for You', limit = 6, showViewAll = true, description }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      setLoading(true);
      setError(null);
      try {
        const user = getCurrentUser();
        const token = localStorage.getItem('token');
        if (!user || !isAuthenticated() || !isTokenValid() || !token) {
          setRecommendations([]);
          setLoading(false);
          return;
        }
        // Only use simple recommendations (order-based)
        let res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/recommendations/simple/${user.id}?limit=${limit}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('No recommendations available.');
        const data = await res.json();
        setRecommendations(data.slice(0, limit));
      } catch (err) {
        setError('No recommendations available.');
      } finally {
        setLoading(false);
      }
    };
    fetchRecommendations();
  }, [limit]);

  if (loading) return <div className="rec-section rec-loading" style={{ background: '#181a1b', color: '#fff' }}>Loading recommendations...</div>;
  if (error) return <div className="rec-section rec-error" style={{ background: '#181a1b', color: '#fff' }}>{error}</div>;
  if (!recommendations.length) return (
    <section className="rec-section rec-empty" style={{ background: '#181a1b', color: '#fff' }}>
      <div className="rec-header">
        <h2>{title}</h2>
      </div>
      <div className="rec-empty-message">
        <img src="/assets/no-image.png" alt="No recommendations" style={{width:'120px',opacity:0.5,marginBottom:'1rem'}} />
        <p style={{color:'#aaa',fontSize:'1.1rem'}}>No recommendations yet. Buy something to get personalized suggestions!</p>
      </div>
    </section>
  );

  return (
    <section className="rec-section" style={{ background: '#181a1b', color: '#fff' }}>
      <div className="rec-header">
        <h2>{title}</h2>
        {showViewAll && (
          <Link to="/recommendations" className="rec-view-all">View All</Link>
        )}
      </div>
      {description && <div className="rec-desc" style={{ color: '#90caf9' }}>{description}</div>}
      <div className="rec-list">
        {recommendations.map((rec) => (
          <Link to={`/products/${rec._id}`} className="rec-card" key={rec._id} style={{ background: '#23272b', color: '#fff' }}>
            <img src={rec.imageUrl || rec.image || '/assets/no-image.png'} alt={rec.name} />
            <div className="rec-info">
              <h3>{rec.name}</h3>
              <p className="rec-brand">{rec.brand}</p>
              <p className="rec-type">{rec.category}</p>
              <p className="rec-price">${rec.price?.toFixed(2)}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default RecommendationSection;
