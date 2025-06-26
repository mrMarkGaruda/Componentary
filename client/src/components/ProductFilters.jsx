import React, { useState } from 'react';

const ProductFilters = ({ 
  filters, 
  onFilterChange, 
  availableFilters, 
  onClearFilters 
}) => {
  const [openSections, setOpenSections] = useState({
    category: true,
    priceRange: true,
    brand: true,
    condition: true,
    location: true
  });

  const toggleSection = (section) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleFilterChange = (filterType, value) => {
    onFilterChange(filterType, value);
  };

  const handlePriceChange = (type, value) => {
    const newPriceRange = {
      ...filters.priceRange,
      [type]: value
    };
    onFilterChange('priceRange', newPriceRange);
  };

  const handleCheckboxChange = (filterType, value, checked) => {
    const currentValues = filters[filterType] || [];
    let newValues;
    
    if (checked) {
      newValues = [...currentValues, value];
    } else {
      newValues = currentValues.filter(v => v !== value);
    }
    
    onFilterChange(filterType, newValues);
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
                value={filters.category || ''}
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
                    value={filters.priceRange?.min || ''}
                    onChange={(e) => handlePriceChange('min', e.target.value)}
                  />
                </div>
                <div className="col-6">
                  <input
                    type="number"
                    className="form-control"
                    placeholder="Max"
                    value={filters.priceRange?.max || ''}
                    onChange={(e) => handlePriceChange('max', e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Brand Filter */}
        {availableFilters.brands && availableFilters.brands.length > 0 && (
          <div className="mb-3">
            <button
              className="btn btn-link p-0 text-decoration-none fw-semibold text-start w-100 d-flex justify-content-between align-items-center"
              type="button"
              onClick={() => toggleSection('brand')}
            >
              Brand
              <i className={`bi bi-chevron-${openSections.brand ? 'up' : 'down'}`}></i>
            </button>
            {openSections.brand && (
              <div className="mt-2" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                {availableFilters.brands.map(brand => (
                  <div key={brand} className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id={`brand-${brand}`}
                      checked={filters.brands?.includes(brand) || false}
                      onChange={(e) => handleCheckboxChange('brands', brand, e.target.checked)}
                    />
                    <label className="form-check-label" htmlFor={`brand-${brand}`}>
                      {brand}
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
                      checked={filters.conditions?.includes(condition) || false}
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
                      checked={filters.locations?.includes(location) || false}
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
