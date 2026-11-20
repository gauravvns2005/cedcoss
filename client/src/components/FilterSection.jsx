import React from 'react';
import { FiFilter, FiSearch, FiRotateCcw, FiMessageSquare } from 'react-icons/fi';

export default function FilterSection({
  products = [],
  selectedProduct,
  onProductChange,
  selectedSentiment,
  onSentimentChange,
  selectedTopic,
  onTopicChange,
  searchQuery,
  onSearchChange,
  onResetFilters,
  totalResults,
  needsReplyCount
}) {
  const topicsList = [
    { value: 'all', label: 'All Topics' },
    { value: 'quality', label: 'Quality' },
    { value: 'delivery', label: 'Delivery' },
    { value: 'price', label: 'Price' },
    { value: 'packaging', label: 'Packaging' },
    { value: 'support', label: 'Support' },
    { value: 'size_fit', label: 'Size & Fit' },
    { value: 'other', label: 'Other' }
  ];

  const hasActiveFilters =
    selectedProduct !== 'all' ||
    selectedSentiment !== 'all' ||
    selectedTopic !== 'all' ||
    Boolean(searchQuery);

  return (
    <div className="card filter-bar-card">
      <div className="filter-bar-header">
        <div className="filter-heading-wrap">
          <FiFilter size={16} />
          <span className="filter-heading-text">Filter &amp; Search</span>
          <span className="count-badge-neutral">{totalResults} reviews showing</span>
        </div>

        {/* Quick-Filter Presets */}
        <div className="quick-filter-pills">
          <button
            type="button"
            className={`quick-pill ${selectedSentiment === 'all' && !searchQuery ? 'active' : ''}`}
            onClick={() => onSentimentChange('all')}
          >
            All
          </button>
          <button
            type="button"
            className={`quick-pill ${selectedSentiment === 'needs_reply' ? 'active-purple' : ''}`}
            onClick={() => onSentimentChange(selectedSentiment === 'needs_reply' ? 'all' : 'needs_reply')}
          >
            Needs Reply ({needsReplyCount})
          </button>
          <button
            type="button"
            className={`quick-pill ${selectedSentiment === 'negative' ? 'active' : ''}`}
            onClick={() => onSentimentChange(selectedSentiment === 'negative' ? 'all' : 'negative')}
          >
            Negative Only
          </button>
          <button
            type="button"
            className={`quick-pill ${selectedSentiment === 'positive' ? 'active' : ''}`}
            onClick={() => onSentimentChange(selectedSentiment === 'positive' ? 'all' : 'positive')}
          >
            Positive Only
          </button>
        </div>
      </div>

      <div className="filter-inputs-grid">
        {/* Search by Text */}
        <div className="input-field-group">
          <label className="input-field-label" htmlFor="search-input">
            Search Text
          </label>
          <div style={{ position: 'relative' }}>
            <input
              id="search-input"
              type="text"
              className="search-input-field"
              placeholder="Search ID, text, summary..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
        </div>

        {/* Product Dropdown */}
        <div className="input-field-group">
          <label className="input-field-label" htmlFor="filter-product">
            Product
          </label>
          <select
            id="filter-product"
            className="select-custom"
            value={selectedProduct}
            onChange={(e) => onProductChange(e.target.value)}
          >
            <option value="all">All Products</option>
            {products.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        {/* Sentiment Dropdown */}
        <div className="input-field-group">
          <label className="input-field-label" htmlFor="filter-sentiment">
            Sentiment
          </label>
          <select
            id="filter-sentiment"
            className="select-custom"
            value={selectedSentiment}
            onChange={(e) => onSentimentChange(e.target.value)}
          >
            <option value="all">All Sentiments</option>
            <option value="positive">Positive</option>
            <option value="neutral">Neutral</option>
            <option value="negative">Negative</option>
            <option value="needs_reply">Needs Reply</option>
          </select>
        </div>

        {/* Topic Dropdown */}
        <div className="input-field-group">
          <label className="input-field-label" htmlFor="filter-topic">
            Topic
          </label>
          <select
            id="filter-topic"
            className="select-custom"
            value={selectedTopic}
            onChange={(e) => onTopicChange(e.target.value)}
          >
            {topicsList.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        {/* Reset Button */}
        {hasActiveFilters && (
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={onResetFilters}
            title="Reset all filters"
          >
            <FiRotateCcw size={13} />
            Reset
          </button>
        )}
      </div>
    </div>
  );
}
