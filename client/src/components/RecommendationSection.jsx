import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './RecommendationSection.css';
import { useAuth } from '../contexts/AuthContext';
import { isTokenValid } from '../utils/auth';

const RecommendationSection = ({ title = 'Recommended for You', limit = 6, showViewAll = true, description }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, isLoggedIn } = useAuth();

  useEffect(() => {
    const fetchRecommendations = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        if (!user || !isLoggedIn || !isTokenValid() || !token) {
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
  }, [limit, user, isLoggedIn]);

  if (loading) return <div className="rec-section rec-loading" style={{ background: '#181a1b', color: '#fff' }}>Loading recommendations...</div>;
  if (error) return <div className="rec-section rec-error" style={{ background: '#181a1b', color: '#fff' }}>{error}</div>;
  if (!recommendations.length) return (
    <section className="rec-section rec-empty" style={{ background: '#181a1b', color: '#fff' }}>
      <div className="rec-header">
        <h2>{title}</h2>
      </div>
      <div className="rec-empty-message">
        <div className="empty-state-icon" style={{ marginBottom: '1rem' }}>
          <svg 
            width="120" 
            height="120" 
            viewBox="0 0 24 24" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            style={{ opacity: 0.5 }}
          >
            <path 
              d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" 
              stroke="#aaa" 
              strokeWidth="1.5" 
              fill="none"
            />
            <path 
              d="M19 12L19.5 14L21 14.5L19.5 15L19 17L18.5 15L17 14.5L18.5 14L19 12Z" 
              stroke="#aaa" 
              strokeWidth="1.5" 
              fill="none"
            />
            <path 
              d="M5 6L5.5 7.5L7 8L5.5 8.5L5 10L4.5 8.5L3 8L4.5 7.5L5 6Z" 
              stroke="#aaa" 
              strokeWidth="1.5" 
              fill="none"
            />
          </svg>
        </div>
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
          <Link to={`/product/${rec._id}`} className="rec-card" key={rec._id} style={{ background: '#23272b', color: '#fff' }}>
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
