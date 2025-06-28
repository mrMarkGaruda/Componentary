import React from 'react';
import RecommendationSection from '../components/RecommendationSection';

const RecommendationsPage = () => {
  return (
    <div className="container rec-page" style={{ maxWidth: 1200, margin: '0 auto', padding: '2.5rem 1rem 3rem 1rem', minHeight: '80vh' }}>
      <div className="rec-page-hero">
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.7rem', letterSpacing: '-1px' }}>Your Personalized Recommendations</h1>
        <p style={{ fontSize: '1.2rem', fontWeight: 500, opacity: 0.95, maxWidth: 600 }}>
          Discover products picked just for you based on your previous purchases, favorite brands, and interests. The more you shop, the better your recommendations get!
        </p>
      </div>
      <RecommendationSection 
        title="Based on Your Purchases & Interests" 
        limit={24} 
        showViewAll={false}
        description="Handpicked for you using your order history, favorite brands, and trending items."
      />
    </div>
  );
};

export default RecommendationsPage;
