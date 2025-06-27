import React, { useState, useEffect, useCallback } from 'react';

const ProductFilters = ({ availableFilters, onFilterChange, currentFilters }) => {
  const [selectedCategories, setSelectedCategories] = useState(currentFilters.category ? currentFilters.category.split(',') : []);
  const [selectedManufacturers, setSelectedManufacturers] = useState(currentFilters.manufacturer ? currentFilters.manufacturer.split(',') : []);
  const [minPrice, setMinPrice] = useState(currentFilters.minPrice || '');
  const [maxPrice, setMaxPrice] = useState(currentFilters.maxPrice || '');
  const [selectedTags, setSelectedTags] = useState(currentFilters.tags ? currentFilters.tags.split(',') : []);
  const [minRating, setMinRating] = useState(currentFilters.minRating || '');
  const [specFilters, setSpecFilters] = useState({});
  const [activeAccordionKeys, setActiveAccordionKeys] = useState(['0']); // Start with Core Filters open

  useEffect(() => {
    const initialSpecs = {};
    for (const key in currentFilters) {
      if (key.startsWith('spec_')) {
        initialSpecs[key.substring(5)] = currentFilters[key];
      }
    }
    setSpecFilters(initialSpecs);
    // Update selected categories/manufacturers if currentFilters change (e.g. from URL)
    setSelectedCategories(currentFilters.category ? currentFilters.category.split(',') : []);
    setSelectedManufacturers(currentFilters.manufacturer ? currentFilters.manufacturer.split(',') : []);
    setMinPrice(currentFilters.minPrice || '');
    setMaxPrice(currentFilters.maxPrice || '');
    setSelectedTags(currentFilters.tags ? currentFilters.tags.split(',') : []);
    setMinRating(currentFilters.minRating || '');

  }, [currentFilters]);

  const handleCategoryChange = (e) => {
    const { value, checked } = e.target;
    setSelectedCategories(prev => 
      checked ? [...prev, value] : prev.filter(cat => cat !== value)
    );
    // Optionally open/focus specification accordion if a category is selected
    if (checked && availableFilters.specificationFilters && Object.keys(availableFilters.specificationFilters).length > 0) {
      if (!activeAccordionKeys.includes('1')) {
        setActiveAccordionKeys(prev => [...prev, '1']);
      }
    }
  };

  const handleManufacturerChange = (e) => {
    const { value, checked } = e.target;
    setSelectedManufacturers(prev => 
      checked ? [...prev, value] : prev.filter(man => man !== value)
    );
  };

  const handleTagChange = (e) => {
    const { value, checked } = e.target;
    setSelectedTags(prev => 
      checked ? [...prev, value] : prev.filter(tag => tag !== value)
    );
  };

  const handleMultiSelectSpecChange = (specKey, e) => {
    const { value, checked } = e.target;
    setSpecFilters(prev => {
      const currentValues = prev[specKey] ? prev[specKey].split(',') : [];
      const newValues = checked 
        ? [...currentValues, value] 
        : currentValues.filter(v => v !== value);
      
      if (newValues.length === 0) {
        const { [specKey]: removed, ...rest } = prev;
        return rest;
      }
      
      return {
        ...prev,
        [specKey]: newValues.join(',')
      };
    });
  };

  const applyFilters = useCallback(() => {
    const filters = {};
    
    if (selectedCategories.length > 0) filters.category = selectedCategories.join(',');
    if (selectedManufacturers.length > 0) filters.manufacturer = selectedManufacturers.join(',');
    if (minPrice) filters.minPrice = minPrice;
    if (maxPrice) filters.maxPrice = maxPrice;
    if (selectedTags.length > 0) filters.tags = selectedTags.join(',');
    if (minRating) filters.minRating = minRating;
    
    // Add specification filters
    for (const [key, value] of Object.entries(specFilters)) {
      if (value) filters[`spec_${key}`] = value;
    }
    
    onFilterChange(filters);
  }, [selectedCategories, selectedManufacturers, minPrice, maxPrice, selectedTags, minRating, specFilters, onFilterChange]);

  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedManufacturers([]);
    setMinPrice('');
    setMaxPrice('');
    setSelectedTags([]);
    setMinRating('');
    setSpecFilters({});
    setActiveAccordionKeys(['0']); // Reset accordion to default
    onFilterChange({});
  };

  // Determine which specification filters to show based on selected categories
  const getRelevantSpecFilters = () => {
    if (!availableFilters || !availableFilters.specificationFilters) return {};
    if (selectedCategories.length === 0) {
      // If no category selected, show all general specs or a limited set
      // For now, let's show all if no category is selected, can be refined
      return availableFilters.specificationFilters;
    }

    // This is a placeholder for more complex logic.
    // A more robust solution would involve mapping categories to relevant spec keys on the backend
    // or having a predefined mapping on the frontend.
    // For now, we'll show all spec filters if any category is selected.
    // A simple improvement: only show spec filters if a category is selected.
    return availableFilters.specificationFilters;
  };

  const relevantSpecFilters = getRelevantSpecFilters();

  if (!availableFilters) return (
    <div className="card mb-4">
      <div className="card-body">
        <div className="d-flex align-items-center">
          <div className="spinner-border spinner-border-sm me-2" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          Loading filters...
        </div>
      </div>
    </div>
  );

  return (
    <div className="card mb-4 shadow-sm">
      <div className="card-header bg-light">
        <h5 className="card-title mb-0">Filter Products</h5>
      </div>
      <div className="card-body">
        <div className="accordion" id="filterAccordion">
          {/* Core Filters Accordion Item */}
          <div className="accordion-item">
            <h2 className="accordion-header">
              <button 
                className={`accordion-button ${!activeAccordionKeys.includes('0') ? 'collapsed' : ''}`}
                type="button" 
                data-bs-toggle="collapse" 
                data-bs-target="#coreFilters" 
                aria-expanded={activeAccordionKeys.includes('0')}
                aria-controls="coreFilters"
                onClick={() => {
                  setActiveAccordionKeys(prev => 
                    prev.includes('0') 
                      ? prev.filter(key => key !== '0')
                      : [...prev, '0']
                  );
                }}
              >
                Core Filters
              </button>
            </h2>
            <div 
              id="coreFilters" 
              className={`accordion-collapse collapse ${activeAccordionKeys.includes('0') ? 'show' : ''}`}
              data-bs-parent="#filterAccordion"
            >
              <div className="accordion-body">
                {availableFilters.categories && availableFilters.categories.length > 0 && (
                  <div className="mb-3">
                    <label className="form-label"><strong>Categories</strong></label>
                    <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #eee', padding: '10px' }}>
                      {availableFilters.categories?.map(cat => (
                        <div key={cat} className="form-check">
                          <input 
                            className="form-check-input"
                            type="checkbox" 
                            id={`category-${cat}`}
                            value={cat} 
                            checked={selectedCategories.includes(cat)}
                            onChange={handleCategoryChange} 
                          />
                          <label className="form-check-label" htmlFor={`category-${cat}`}>
                            {cat}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {availableFilters.manufacturers && availableFilters.manufacturers.length > 0 && (
                  <div className="mb-3">
                    <label className="form-label"><strong>Manufacturers</strong></label>
                    <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #eee', padding: '10px' }}>
                      {availableFilters.manufacturers?.map(man => (
                        <div key={man} className="form-check">
                          <input 
                            className="form-check-input"
                            type="checkbox" 
                            id={`manufacturer-${man}`}
                            value={man} 
                            checked={selectedManufacturers.includes(man)}
                            onChange={handleManufacturerChange} 
                          />
                          <label className="form-check-label" htmlFor={`manufacturer-${man}`}>
                            {man}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {availableFilters.priceRange && (availableFilters.priceRange.min !== undefined || availableFilters.priceRange.max !== undefined) && (
                  <div className="mb-3">
                    <label className="form-label"><strong>Price Range</strong></label>
                    <div className="row">
                      <div className="col">
                        <div className="input-group input-group-sm">
                          <span className="input-group-text">$</span>
                          <input 
                            type="number" 
                            className="form-control"
                            placeholder={`Min (${availableFilters.priceRange?.min || 0})`} 
                            value={minPrice} 
                            onChange={(e) => setMinPrice(e.target.value)} 
                            min={availableFilters.priceRange?.min || 0}
                          />
                        </div>
                      </div>
                      <div className="col">
                        <div className="input-group input-group-sm">
                          <span className="input-group-text">$</span>
                          <input 
                            type="number" 
                            className="form-control"
                            placeholder={`Max (${availableFilters.priceRange?.max || 5000})`} 
                            value={maxPrice} 
                            onChange={(e) => setMaxPrice(e.target.value)} 
                            max={availableFilters.priceRange?.max || 10000}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {availableFilters.tags && availableFilters.tags.length > 0 && (
                  <div className="mb-3">
                    <label className="form-label"><strong>Tags</strong></label>
                    <div style={{ maxHeight: '150px', overflowY: 'auto', border: '1px solid #eee', padding: '10px' }}>
                      {availableFilters.tags?.map(tag => (
                        <div key={tag} className="form-check">
                          <input 
                            className="form-check-input"
                            type="checkbox" 
                            id={`tag-${tag}`}
                            value={tag} 
                            checked={selectedTags.includes(tag)}
                            onChange={handleTagChange} 
                          />
                          <label className="form-check-label" htmlFor={`tag-${tag}`}>
                            {tag}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mb-3">
                  <label className="form-label"><strong>Minimum Rating</strong></label>
                  <select className="form-select form-select-sm" value={minRating} onChange={(e) => setMinRating(e.target.value)}>
                    <option value="">Any</option>
                    <option value="5">★★★★★</option>
                    <option value="4">★★★★☆ & Up</option>
                    <option value="3">★★★☆☆ & Up</option>
                    <option value="2">★★☆☆☆ & Up</option>
                    <option value="1">★☆☆☆☆ & Up</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Specifications Accordion Item */}
          {Object.keys(relevantSpecFilters).length > 0 && (
            <div className="accordion-item">
              <h2 className="accordion-header">
                <button 
                  className={`accordion-button ${!activeAccordionKeys.includes('1') ? 'collapsed' : ''}`}
                  type="button" 
                  data-bs-toggle="collapse" 
                  data-bs-target="#specifications" 
                  aria-expanded={activeAccordionKeys.includes('1')}
                  aria-controls="specifications"
                  onClick={() => {
                    setActiveAccordionKeys(prev => 
                      prev.includes('1') 
                        ? prev.filter(key => key !== '1')
                        : [...prev, '1']
                    );
                  }}
                >
                  Specifications
                </button>
              </h2>
              <div 
                id="specifications" 
                className={`accordion-collapse collapse ${activeAccordionKeys.includes('1') ? 'show' : ''}`}
                data-bs-parent="#filterAccordion"
              >
                <div className="accordion-body">
                  {Object.entries(relevantSpecFilters).map(([specKey, values]) => (
                    <div className="mb-3" key={specKey}>
                      <label className="form-label"><strong>{specKey.charAt(0).toUpperCase() + specKey.slice(1).replace(/([A-Z])/g, ' $1')}</strong></label>
                      <div style={{ maxHeight: '150px', overflowY: 'auto', border: '1px solid #eee', padding: '10px' }}>
                        {values.map(val => (
                          <div key={`${specKey}-${val}`} className="form-check">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              id={`spec-${specKey}-${val}`}
                              value={String(val)}
                              checked={specFilters[specKey]?.split(',').includes(String(val)) || false}
                              onChange={(e) => handleMultiSelectSpecChange(specKey, e)}
                            />
                            <label className="form-check-label" htmlFor={`spec-${specKey}-${val}`}>
                              {String(val)}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-4 d-flex justify-content-between">
          <button className="btn btn-primary btn-sm" onClick={applyFilters}>Apply Filters</button>
          <button className="btn btn-outline-secondary btn-sm" onClick={clearFilters}>Clear All</button>
        </div>
      </div>
    </div>
  );
};

export default ProductFilters;
