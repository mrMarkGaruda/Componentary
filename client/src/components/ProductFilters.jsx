import React, { useState, useEffect, useCallback } from 'react';
import { Accordion, Form, Button, InputGroup, FormControl, Row, Col, Card } from 'react-bootstrap';

const ProductFilters = ({ availableFilters, onFilterChange, currentFilters }) => {
  const [selectedCategories, setSelectedCategories] = useState(currentFilters.category ? currentFilters.category.split(',') : []);
  const [selectedManufacturers, setSelectedManufacturers] = useState(currentFilters.manufacturer ? currentFilters.manufacturer.split(',') : []);
  const [minPrice, setMinPrice] = useState(currentFilters.minPrice || '');
  const [maxPrice, setMaxPrice] = useState(currentFilters.maxPrice || '');
  const [selectedTags, setSelectedTags] = useState(currentFilters.tags ? currentFilters.tags.split(',') : []);
  const [minRating, setMinRating] = useState(currentFilters.minRating || '');
  const [specFilters, setSpecFilters] = useState({});

  useEffect(() => {
    // Initialize specFilters from currentFilters (which might come from URL params)
    const initialSpecs = {};
    for (const key in currentFilters) {
      if (key.startsWith('spec_')) {
        initialSpecs[key.substring(5)] = currentFilters[key];
      }
    }
    setSpecFilters(initialSpecs);
  }, [currentFilters]);

  const handleCategoryChange = (e) => {
    const { value, checked } = e.target;
    setSelectedCategories(prev => 
      checked ? [...prev, value] : prev.filter(cat => cat !== value)
    );
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
      const existingValues = prev[specKey] ? prev[specKey].split(',') : [];
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
      if (specFilters[specKey] && specFilters[specKey] !== '') {
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
    onFilterChange({}); // Apply empty filters
  };

  if (!availableFilters) return <p>Loading filters...</p>;

  return (
    <Card className="mb-4">
      <Card.Header as="h5">Filter Products</Card.Header>
      <Card.Body>
        <Accordion defaultActiveKey={['0', '1']} alwaysOpen>
          <Accordion.Item eventKey="0">
            <Accordion.Header>Core Filters</Accordion.Header>
            <Accordion.Body>
              <Form.Group className="mb-3">
                <Form.Label><strong>Categories</strong></Form.Label>
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
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label><strong>Manufacturers</strong></Form.Label>
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
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label><strong>Price Range</strong></Form.Label>
                <Row>
                  <Col>
                    <InputGroup>
                      <InputGroup.Text>$</InputGroup.Text>
                      <FormControl 
                        type="number" 
                        placeholder={`Min (${availableFilters.priceRange?.min || 0})`} 
                        value={minPrice} 
                        onChange={(e) => setMinPrice(e.target.value)} 
                      />
                    </InputGroup>
                  </Col>
                  <Col>
                    <InputGroup>
                      <InputGroup.Text>$</InputGroup.Text>
                      <FormControl 
                        type="number" 
                        placeholder={`Max (${availableFilters.priceRange?.max || 5000})`} 
                        value={maxPrice} 
                        onChange={(e) => setMaxPrice(e.target.value)} 
                      />
                    </InputGroup>
                  </Col>
                </Row>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label><strong>Tags</strong></Form.Label>
                <div style={{ maxHeight: '150px', overflowY: 'auto', border: '1px solid #ced4da', padding: '10px' }}>
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

              <Form.Group className="mb-3">
                <Form.Label><strong>Minimum Rating</strong></Form.Label>
                <Form.Select value={minRating} onChange={(e) => setMinRating(e.target.value)}>
                  <option value="">Any</option>
                  <option value="5">5 Stars</option>
                  <option value="4">4 Stars & Up</option>
                  <option value="3">3 Stars & Up</option>
                  <option value="2">2 Stars & Up</option>
                  <option value="1">1 Star & Up</option>
                </Form.Select>
              </Form.Group>
            </Accordion.Body>
          </Accordion.Item>

          {availableFilters.specificationFilters && Object.keys(availableFilters.specificationFilters).length > 0 && (
            <Accordion.Item eventKey="1">
              <Accordion.Header>Specifications</Accordion.Header>
              <Accordion.Body>
                {Object.entries(availableFilters.specificationFilters).map(([specKey, values]) => (
                  <Form.Group className="mb-3" key={specKey}>
                    <Form.Label><strong>{specKey.charAt(0).toUpperCase() + specKey.slice(1)}</strong></Form.Label>
                    {/* Render as checkboxes if few options, select if many, or based on data type */}
                    {/* Simple example: checkboxes for all spec filters for now */}
                    <div style={{ maxHeight: '150px', overflowY: 'auto', border: '1px solid #ced4da', padding: '10px' }}>
                      {values.map(val => (
                        <Form.Check
                          type="checkbox"
                          key={`${specKey}-${val}`}
                          label={String(val)} // Ensure val is a string for label
                          value={String(val)} // Ensure val is a string for value
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

        <div className="mt-3 d-flex justify-content-between">
          <Button variant="primary" onClick={applyFilters}>Apply Filters</Button>
          <Button variant="outline-secondary" onClick={clearFilters}>Clear Filters</Button>
        </div>
      </Card.Body>
    </Card>
  );
};

export default ProductFilters;
