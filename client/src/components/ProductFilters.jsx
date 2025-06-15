import React, { useState, useEffect, useCallback } from 'react';
import { Accordion, Form, Button, InputGroup, FormControl, Row, Col, Card, Spinner } from 'react-bootstrap';

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

  const handleSpecChange = (specKey, value) => {
    setSpecFilters(prev => ({ ...prev, [specKey]: value }));
  };
  
  const handleMultiSelectSpecChange = (specKey, e) => {
    const { value, checked } = e.target;
    setSpecFilters(prev => {
      const existingValues = prev[specKey] ? String(prev[specKey]).split(',').filter(v => v) : [];
      let newValues;
      if (checked) {
        newValues = [...existingValues, value];
      } else {
        newValues = existingValues.filter(v => v !== value);
      }
      return { ...prev, [specKey]: newValues.join(',') };
    });
  };

  const applyFilters = useCallback(() => {
    const filtersToApply = {};
    if (selectedCategories.length > 0) filtersToApply.category = selectedCategories.join(',');
    if (selectedManufacturers.length > 0) filtersToApply.manufacturer = selectedManufacturers.join(',');
    if (minPrice) filtersToApply.minPrice = minPrice;
    if (maxPrice) filtersToApply.maxPrice = maxPrice;
    if (selectedTags.length > 0) filtersToApply.tags = selectedTags.join(',');
    if (minRating) filtersToApply.minRating = minRating;

    for (const specKey in specFilters) {
      if (specFilters[specKey] && String(specFilters[specKey]).trim() !== '') {
        filtersToApply[`spec_${specKey}`] = specFilters[specKey];
      }
    }
    onFilterChange(filtersToApply);
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

  if (!availableFilters) return <Card className="mb-4"><Card.Body><Spinner animation="border" size="sm" /> Loading filters...</Card.Body></Card>;

  return (
    <Card className="mb-4 shadow-sm">
      <Card.Header as="h5" className="bg-light">Filter Products</Card.Header>
      <Card.Body>
        <Accordion activeKey={activeAccordionKeys} onSelect={(keys) => setActiveAccordionKeys(keys)} alwaysOpen>
          <Accordion.Item eventKey="0">
            <Accordion.Header>Core Filters</Accordion.Header>
            <Accordion.Body>
              {availableFilters.categories && availableFilters.categories.length > 0 && (
                <Form.Group className="mb-3">
                  <Form.Label><strong>Categories</strong></Form.Label>
                  <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #eee', padding: '10px' }}>
                  {availableFilters.categories?.map(cat => (
                    <Form.Check 
                      type="checkbox" 
                      key={cat} 
                      label={cat} 
                      value={cat} 
                      checked={selectedCategories.includes(cat)}
                      onChange={handleCategoryChange} 
                    />
                  ))}
                  </div>
                </Form.Group>
              )}

              {availableFilters.manufacturers && availableFilters.manufacturers.length > 0 && (
                <Form.Group className="mb-3">
                  <Form.Label><strong>Manufacturers</strong></Form.Label>
                  <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #eee', padding: '10px' }}>
                  {availableFilters.manufacturers?.map(man => (
                    <Form.Check 
                      type="checkbox" 
                      key={man} 
                      label={man} 
                      value={man} 
                      checked={selectedManufacturers.includes(man)}
                      onChange={handleManufacturerChange} 
                    />
                  ))}
                  </div>
                </Form.Group>
              )}
              
              {availableFilters.priceRange && (availableFilters.priceRange.min !== undefined || availableFilters.priceRange.max !== undefined) && (
                <Form.Group className="mb-3">
                  <Form.Label><strong>Price Range</strong></Form.Label>
                  <Row>
                    <Col>
                      <InputGroup size="sm">
                        <InputGroup.Text>$</InputGroup.Text>
                        <FormControl 
                          type="number" 
                          placeholder={`Min (${availableFilters.priceRange?.min || 0})`} 
                          value={minPrice} 
                          onChange={(e) => setMinPrice(e.target.value)} 
                          min={availableFilters.priceRange?.min || 0}
                        />
                      </InputGroup>
                    </Col>
                    <Col>
                      <InputGroup size="sm">
                        <InputGroup.Text>$</InputGroup.Text>
                        <FormControl 
                          type="number" 
                          placeholder={`Max (${availableFilters.priceRange?.max || 5000})`} 
                          value={maxPrice} 
                          onChange={(e) => setMaxPrice(e.target.value)} 
                          max={availableFilters.priceRange?.max || 10000}
                        />
                      </InputGroup>
                    </Col>
                  </Row>
                </Form.Group>
              )}

              {availableFilters.tags && availableFilters.tags.length > 0 && (
                <Form.Group className="mb-3">
                  <Form.Label><strong>Tags</strong></Form.Label>
                  <div style={{ maxHeight: '150px', overflowY: 'auto', border: '1px solid #eee', padding: '10px' }}>
                    {availableFilters.tags?.map(tag => (
                      <Form.Check 
                        type="checkbox" 
                        key={tag} 
                        label={tag} 
                        value={tag} 
                        checked={selectedTags.includes(tag)}
                        onChange={handleTagChange} 
                      />
                    ))}
                  </div>
                </Form.Group>
              )}

              <Form.Group className="mb-3">
                <Form.Label><strong>Minimum Rating</strong></Form.Label>
                <Form.Select size="sm" value={minRating} onChange={(e) => setMinRating(e.target.value)}>
                  <option value="">Any</option>
                  <option value="5">★★★★★</option>
                  <option value="4">★★★★☆ & Up</option>
                  <option value="3">★★★☆☆ & Up</option>
                  <option value="2">★★☆☆☆ & Up</option>
                  <option value="1">★☆☆☆☆ & Up</option>
                </Form.Select>
              </Form.Group>
            </Accordion.Body>
          </Accordion.Item>

          {Object.keys(relevantSpecFilters).length > 0 && (
            <Accordion.Item eventKey="1">
              <Accordion.Header>Specifications</Accordion.Header>
              <Accordion.Body>
                {Object.entries(relevantSpecFilters).map(([specKey, values]) => (
                  <Form.Group className="mb-3" key={specKey}>
                    <Form.Label><strong>{specKey.charAt(0).toUpperCase() + specKey.slice(1).replace(/([A-Z])/g, ' $1')}</strong></Form.Label>
                    <div style={{ maxHeight: '150px', overflowY: 'auto', border: '1px solid #eee', padding: '10px' }}>
                      {values.map(val => (
                        <Form.Check
                          type="checkbox"
                          key={`${specKey}-${val}`}
                          label={String(val)}
                          value={String(val)}
                          checked={specFilters[specKey]?.split(',').includes(String(val)) || false}
                          onChange={(e) => handleMultiSelectSpecChange(specKey, e)}
                        />
                      ))}
                    </div>
                  </Form.Group>
                ))}
              </Accordion.Body>
            </Accordion.Item>
          )}
        </Accordion>

        <div className="mt-4 d-flex justify-content-between">
          <Button variant="primary" onClick={applyFilters} size="sm">Apply Filters</Button>
          <Button variant="outline-secondary" onClick={clearFilters} size="sm">Clear All</Button>
        </div>
      </Card.Body>
    </Card>
  );
};

export default ProductFilters;
