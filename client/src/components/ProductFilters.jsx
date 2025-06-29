import React, { useState } from 'react';

const ProductFilters = ({ 
  filters = {}, 
  onFilterChange, 
  availableFilters, 
  onClearFilters 
}) => {
  const safeFilters = typeof filters === 'object' && filters !== null ? filters : {};
  const [openSections, setOpenSections] = useState({
    category: true,
    priceRange: true,
    manufacturer: true,
    condition: true,
    location: true,
    rating: true
  });

  const toggleSection = (section) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const handleFilterChange = (filterType, value) => {
    onFilterChange(filterType, value);
  };

  const handlePriceChange = (type, value) => {
    if (type === 'min') {
      onFilterChange('minPrice', value || '');
    } else if (type === 'max') {
      onFilterChange('maxPrice', value || '');
    }
  };

  const handleCheckboxChange = (filterType, value, checked) => {
    const currentValues = Array.isArray(safeFilters[filterType]) ? safeFilters[filterType] : 
                         (safeFilters[filterType] ? safeFilters[filterType].split(',') : []);
    let newValues;
    if (checked) {
      newValues = [...currentValues, value];
    } else {
      newValues = currentValues.filter(v => v !== value);
    }
    onFilterChange(filterType, newValues.length > 0 ? newValues.join(',') : '');
  };

  if (!availableFilters) {
    return (
      <div className="filter-sidebar">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="mb-0">
            <i className="bi bi-funnel me-2"></i>Filters
          </h5>
          <div className="loading-spinner"></div>
        </div>
        <p className="text-muted">Loading filters...</p>
      </div>
    );
  }

  return (
    <div className="filter-sidebar">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="mb-0">
          <i className="bi bi-funnel me-2"></i>Filters
        </h5>
        <button
          type="button"
          className="btn btn-sm btn-outline-danger"
          onClick={onClearFilters}
        >
          <i className="bi bi-x-circle me-1"></i>Clear All
        </button>
      </div>

      {/* Category Filter */}
      {availableFilters.categories && availableFilters.categories.length > 0 && (
        <div className="filter-section">
          <button
            className="btn btn-link p-0 text-decoration-none fw-semibold text-start w-100 d-flex justify-content-between align-items-center"
            type="button"
            onClick={() => toggleSection('category')}
          >
            <span><i className="bi bi-tags me-2"></i>Category</span>
            <i className={`bi bi-chevron-${openSections.category ? 'up' : 'down'}`}></i>
          </button>
          {openSections.category && (
            <div className="mt-3">
              <select
                className="form-select"
                value={safeFilters.category || ''}
                onChange={(e) => handleFilterChange('category', e.target.value)}
              >
                <option value="">All Categories</option>
                {availableFilters.categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}

      {/* Price Range Filter */}
      <div className="filter-section">
        <button
          className="btn btn-link p-0 text-decoration-none fw-semibold text-start w-100 d-flex justify-content-between align-items-center"
          type="button"
          onClick={() => toggleSection('priceRange')}
        >
          <span><i className="bi bi-currency-dollar me-2"></i>Price Range</span>
          <i className={`bi bi-chevron-${openSections.priceRange ? 'up' : 'down'}`}></i>
        </button>
        {openSections.priceRange && (
          <div className="mt-3">
            <div className="row g-2">
              <div className="col-6">
                <input
                  type="number"
                  className="form-control form-control-sm"
                  placeholder="Min"
                  value={safeFilters.minPrice || ''}
                  onChange={(e) => handlePriceChange('min', e.target.value)}
                  min="0"
                />
              </div>
              <div className="col-6">
                <input
                  type="number"
                  className="form-control form-control-sm"
                  placeholder="Max"
                  value={safeFilters.maxPrice || ''}
                  onChange={(e) => handlePriceChange('max', e.target.value)}
                  min="0"
                />
              </div>
            </div>
            {/* Quick price filters */}
            <div className="mt-2">
              <div className="d-flex flex-wrap gap-1">
                <button 
                  className="btn btn-outline-secondary btn-sm"
                  onClick={() => {
                    handlePriceChange('min', '0');
                    handlePriceChange('max', '100');
                  }}
                >
                  Under $100
                </button>
                <button 
                  className="btn btn-outline-secondary btn-sm"
                  onClick={() => {
                    handlePriceChange('min', '100');
                    handlePriceChange('max', '500');
                  }}
                >
                  $100-$500
                </button>
                <button 
                  className="btn btn-outline-secondary btn-sm"
                  onClick={() => {
                    handlePriceChange('min', '500');
                    handlePriceChange('max', '');
                  }}
                >
                  $500+
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Manufacturer Filter */}
      {availableFilters.manufacturers && availableFilters.manufacturers.length > 0 && (
        <div className="filter-section">
          <button
            className="btn btn-link p-0 text-decoration-none fw-semibold text-start w-100 d-flex justify-content-between align-items-center"
            type="button"
            onClick={() => toggleSection('manufacturer')}
          >
            <span><i className="bi bi-building me-2"></i>Brand</span>
            <i className={`bi bi-chevron-${openSections.manufacturer ? 'up' : 'down'}`}></i>
          </button>
          {openSections.manufacturer && (
            <div className="mt-3" style={{ maxHeight: '200px', overflowY: 'auto' }}>
              {availableFilters.manufacturers.map(manufacturer => (
                <div key={manufacturer} className="form-check mb-2">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id={`manufacturer-${manufacturer}`}
                    checked={safeFilters.manufacturer?.split(',').includes(manufacturer) || false}
                    onChange={(e) => handleCheckboxChange('manufacturer', manufacturer, e.target.checked)}
                  />
                  <label className="form-check-label" htmlFor={`manufacturer-${manufacturer}`}>
                    {manufacturer}
                  </label>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Rating Filter */}
      <div className="filter-section">
        <button
          className="btn btn-link p-0 text-decoration-none fw-semibold text-start w-100 d-flex justify-content-between align-items-center"
          type="button"
          onClick={() => toggleSection('rating')}
        >
          <span><i className="bi bi-star me-2"></i>Rating</span>
          <i className={`bi bi-chevron-${openSections.rating ? 'up' : 'down'}`}></i>
        </button>
        {openSections.rating && (
          <div className="mt-3">
            <div className="form-check mb-2">
              <input
                className="form-check-input"
                type="radio"
                name="minRating"
                id="rating-4"
                checked={safeFilters.minRating === '4'}
                onChange={() => handleFilterChange('minRating', '4')}
              />
              <label className="form-check-label d-flex align-items-center" htmlFor="rating-4">
                <span className="me-2">4</span>
                <i className="bi bi-star-fill text-warning me-1"></i>
                <span>& up</span>
              </label>
            </div>
            <div className="form-check mb-2">
              <input
                className="form-check-input"
                type="radio"
                name="minRating"
                id="rating-3"
                checked={safeFilters.minRating === '3'}
                onChange={() => handleFilterChange('minRating', '3')}
              />
              <label className="form-check-label d-flex align-items-center" htmlFor="rating-3">
                <span className="me-2">3</span>
                <i className="bi bi-star-fill text-warning me-1"></i>
                <span>& up</span>
              </label>
            </div>
            <div className="form-check mb-2">
              <input
                className="form-check-input"
                type="radio"
                name="minRating"
                id="rating-2"
                checked={safeFilters.minRating === '2'}
                onChange={() => handleFilterChange('minRating', '2')}
              />
              <label className="form-check-label d-flex align-items-center" htmlFor="rating-2">
                <span className="me-2">2</span>
                <i className="bi bi-star-fill text-warning me-1"></i>
                <span>& up</span>
              </label>
            </div>
            <div className="form-check">
              <input
                className="form-check-input"
                type="radio"
                name="minRating"
                id="rating-all"
                checked={!safeFilters.minRating}
                onChange={() => handleFilterChange('minRating', '')}
              />
              <label className="form-check-label" htmlFor="rating-all">
                All Ratings
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Condition Filter */}
      {availableFilters.conditions && availableFilters.conditions.length > 0 && (
        <div className="filter-section">
          <button
            className="btn btn-link p-0 text-decoration-none fw-semibold text-start w-100 d-flex justify-content-between align-items-center"
            type="button"
            onClick={() => toggleSection('condition')}
          >
            <span><i className="bi bi-shield-check me-2"></i>Condition</span>
            <i className={`bi bi-chevron-${openSections.condition ? 'up' : 'down'}`}></i>
          </button>
          {openSections.condition && (
            <div className="mt-3">
              {availableFilters.conditions.map(condition => (
                <div key={condition} className="form-check mb-2">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id={`condition-${condition}`}
                    checked={safeFilters.condition?.split(',').includes(condition) || false}
                    onChange={(e) => handleCheckboxChange('condition', condition, e.target.checked)}
                  />
                  <label className="form-check-label" htmlFor={`condition-${condition}`}>
                    {condition}
                  </label>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Location Filter */}
      {availableFilters.locations && availableFilters.locations.length > 0 && (
        <div className="filter-section">
          <button
            className="btn btn-link p-0 text-decoration-none fw-semibold text-start w-100 d-flex justify-content-between align-items-center"
            type="button"
            onClick={() => toggleSection('location')}
          >
            <span><i className="bi bi-geo-alt me-2"></i>Location</span>
            <i className={`bi bi-chevron-${openSections.location ? 'up' : 'down'}`}></i>
          </button>
          {openSections.location && (
            <div className="mt-3" style={{ maxHeight: '200px', overflowY: 'auto' }}>
              {availableFilters.locations.map(location => (
                <div key={location} className="form-check mb-2">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id={`location-${location}`}
                    checked={safeFilters.locations?.includes(location) || false}
                    onChange={(e) => handleCheckboxChange('locations', location, e.target.checked)}
                  />
                  <label className="form-check-label" htmlFor={`location-${location}`}>
                    {location}
                  </label>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductFilters;
