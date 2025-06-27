import React, { useState } from 'react';

const ProductFilters = ({ 
  filters = {}, // Default to empty object
  onFilterChange, 
  availableFilters, 
  onClearFilters 
}) => {
  // Defensive: ensure filters is always an object
  const safeFilters = typeof filters === 'object' && filters !== null ? filters : {};
  const [openSections, setOpenSections] = useState({
    category: true,
    priceRange: true,
    manufacturer: true,
    condition: true,
    location: true
  });

  const toggleSection = (section) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const handleFilterChange = (filterType, value) => {
    onFilterChange(filterType, value);
  };

  const handlePriceChange = (type, value) => {
    // Send minPrice and maxPrice as separate filters to match backend API
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
    // Join array values with comma for backend compatibility
    onFilterChange(filterType, newValues.length > 0 ? newValues.join(',') : '');
  };

  if (!availableFilters) {
    return (
      <div className="card">
        <div className="card-body">
          <div className="d-flex justify-content-center">
            <div className="spinner-border spinner-border-sm" role="status">
              <span className="visually-hidden">Loading filters...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header">
        <div className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Filters</h5>
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary"
            onClick={onClearFilters}
          >
            Clear All
          </button>
        </div>
      </div>
      <div className="card-body">
        {/* Category Filter */}
        <div className="mb-3">
          <button
            className="btn btn-link p-0 text-decoration-none fw-semibold text-start w-100 d-flex justify-content-between align-items-center"
            type="button"
            onClick={() => toggleSection('category')}
          >
            Category
            <i className={`bi bi-chevron-${openSections.category ? 'up' : 'down'}`}></i>
          </button>
          {openSections.category && (
            <div className="mt-2">
              <select
                className="form-select"
                value={safeFilters.category || ''}
                onChange={(e) => handleFilterChange('category', e.target.value)}
              >
                <option value="">All Categories</option>
                {availableFilters.categories?.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Price Range Filter */}
        <div className="mb-3">
          <button
            className="btn btn-link p-0 text-decoration-none fw-semibold text-start w-100 d-flex justify-content-between align-items-center"
            type="button"
            onClick={() => toggleSection('priceRange')}
          >
            Price Range
            <i className={`bi bi-chevron-${openSections.priceRange ? 'up' : 'down'}`}></i>
          </button>
          {openSections.priceRange && (
            <div className="mt-2">
              <div className="row g-2">
                <div className="col-6">
                  <input
                    type="number"
                    className="form-control"
                    placeholder="Min"
                    value={safeFilters.minPrice || ''}
                    onChange={(e) => handlePriceChange('min', e.target.value)}
                  />
                </div>
                <div className="col-6">
                  <input
                    type="number"
                    className="form-control"
                    placeholder="Max"
                    value={safeFilters.maxPrice || ''}
                    onChange={(e) => handlePriceChange('max', e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Manufacturer Filter */}
        {availableFilters.manufacturers && availableFilters.manufacturers.length > 0 && (
          <div className="mb-3">
            <button
              className="btn btn-link p-0 text-decoration-none fw-semibold text-start w-100 d-flex justify-content-between align-items-center"
              type="button"
              onClick={() => toggleSection('manufacturer')}
            >
              Manufacturer
              <i className={`bi bi-chevron-${openSections.manufacturer ? 'up' : 'down'}`}></i>
            </button>
            {openSections.manufacturer && (
              <div className="mt-2" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                {availableFilters.manufacturers.map(manufacturer => (
                  <div key={manufacturer} className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id={`manufacturer-${manufacturer}`}
                      checked={(safeFilters.manufacturer ? safeFilters.manufacturer.split(',') : []).includes(manufacturer)}
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

        {/* Condition Filter */}
        {availableFilters.conditions && availableFilters.conditions.length > 0 && (
          <div className="mb-3">
            <button
              className="btn btn-link p-0 text-decoration-none fw-semibold text-start w-100 d-flex justify-content-between align-items-center"
              type="button"
              onClick={() => toggleSection('condition')}
            >
              Condition
              <i className={`bi bi-chevron-${openSections.condition ? 'up' : 'down'}`}></i>
            </button>
            {openSections.condition && (
              <div className="mt-2">
                {availableFilters.conditions.map(condition => (
                  <div key={condition} className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id={`condition-${condition}`}
                      checked={(safeFilters.conditions ? safeFilters.conditions.split(',') : []).includes(condition)}
                      onChange={(e) => handleCheckboxChange('conditions', condition, e.target.checked)}
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
          <div className="mb-3">
            <button
              className="btn btn-link p-0 text-decoration-none fw-semibold text-start w-100 d-flex justify-content-between align-items-center"
              type="button"
              onClick={() => toggleSection('location')}
            >
              Location
              <i className={`bi bi-chevron-${openSections.location ? 'up' : 'down'}`}></i>
            </button>
            {openSections.location && (
              <div className="mt-2" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                {availableFilters.locations.map(location => (
                  <div key={location} className="form-check">
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
    </div>
  );
};

export default ProductFilters;
