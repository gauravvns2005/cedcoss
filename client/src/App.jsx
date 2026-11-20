import React, { useState, useEffect, useMemo } from 'react';
import { 
  FiCheck, 
  FiLayers, 
  FiShield, 
  FiDatabase, 
  FiZap, 
  FiPlay, 
  FiRotateCcw,
  FiActivity
} from 'react-icons/fi';
import Sidebar from './components/Sidebar.jsx';
import SummaryCards from './components/SummaryCards.jsx';
import SentimentChart from './components/SentimentChart.jsx';
import InsightsSection from './components/InsightsSection.jsx';
import FilterSection from './components/FilterSection.jsx';
import ReviewTable from './components/ReviewTable.jsx';
import ReplyModal from './components/ReplyModal.jsx';
import Loader from './components/Loader.jsx';
import { checkHealth, uploadAndAnalyzeCSV, generateSuggestedReply } from './services/api.js';

export default function App() {
  const [serverStatus, setServerStatus] = useState('checking');
  const [activeModel, setActiveModel] = useState('llama-3.3-70b-versatile');
  const [selectedFile, setSelectedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Analysis result state
  const [stats, setStats] = useState(null);
  const [insights, setInsights] = useState(null);
  const [reviews, setReviews] = useState([]);

  // Filter state
  const [filterProduct, setFilterProduct] = useState('all');
  const [filterSentiment, setFilterSentiment] = useState('all');
  const [filterTopic, setFilterTopic] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Suggested reply modal state
  const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);
  const [activeReviewForReply, setActiveReviewForReply] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [isGeneratingReply, setIsGeneratingReply] = useState(false);

  // Floating Toast Notification
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage((prev) => (prev === message ? null : prev));
    }, 3200);
  };

  // Check backend health on mount
  useEffect(() => {
    checkHealth()
      .then((data) => {
        setServerStatus('online');
        if (data.model) {
          setActiveModel(data.model);
        }
      })
      .catch((err) => {
        console.warn('Backend server check:', err.message);
        setServerStatus('offline');
      });
  }, []);

  // Handle file select or drop
  const handleFileUpload = (file) => {
    setSelectedFile(file);
    setError(null);
    showToast(`Loaded "${file.name}" (${(file.size / 1024).toFixed(1)} KB)`);
  };

  // Helper to load sample-reviews.csv from public folder
  const handleLoadSample = async () => {
    try {
      setError(null);
      const response = await fetch('/sample-reviews.csv');
      if (!response.ok) {
        throw new Error('Could not load sample-reviews.csv file.');
      }
      const blob = await response.blob();
      const sampleFile = new File([blob], 'sample-reviews.csv', { type: 'text/csv' });
      setSelectedFile(sampleFile);
      showToast('Loaded 30-record CEDCOSS assessment dataset.');
    } catch (err) {
      setError(`Failed to load sample dataset: ${err.message}`);
    }
  };

  // Trigger analysis upload
  const handleAnalyze = async () => {
    if (!selectedFile) {
      setError('Please select or upload a CSV file first.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await uploadAndAnalyzeCSV(selectedFile);
      if (data.success) {
        setStats(data.stats);
        setInsights(data.insights);
        setReviews(data.reviews);
        // Reset filters on new upload
        setFilterProduct('all');
        setFilterSentiment('all');
        setFilterTopic('all');
        setSearchQuery('');
        showToast(`Successfully analysed ${data.stats.total_analysed} reviews!`);
      } else {
        setError(data.error || 'Failed to analyze reviews.');
      }
    } catch (err) {
      const serverMsg = err.response?.data?.error || err.message;
      setError(`Analysis Error: ${serverMsg}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Generate suggested reply on-demand
  const handleOpenReplyModal = async (reviewRow) => {
    setActiveReviewForReply(reviewRow);
    setReplyText('');
    setIsReplyModalOpen(true);
    setIsGeneratingReply(true);

    try {
      const data = await generateSuggestedReply(reviewRow.review_id, reviewRow);
      if (data.success) {
        setReplyText(data.reply);
      } else {
        setReplyText('Could not generate reply: ' + (data.error || 'Unknown error'));
      }
    } catch (err) {
      const serverMsg = err.response?.data?.error || err.message;
      setReplyText(`Failed to generate reply: ${serverMsg}`);
    } finally {
      setIsGeneratingReply(false);
    }
  };

  // Extract unique products for dropdown
  const uniqueProducts = useMemo(() => {
    const set = new Set();
    reviews.forEach((r) => {
      if (r.product) set.add(r.product);
    });
    return Array.from(set).sort();
  }, [reviews]);

  // Filter reviews based on combined filters + search query
  const filteredReviews = useMemo(() => {
    return reviews.filter((row) => {
      // 1. Text Search Filter (review_id, product, review_text, or summary)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const idMatch = row.review_id?.toLowerCase().includes(query);
        const productMatch = row.product?.toLowerCase().includes(query);
        const textMatch = row.review_text?.toLowerCase().includes(query);
        const summaryMatch = row.analysis?.summary?.toLowerCase().includes(query);
        if (!idMatch && !productMatch && !textMatch && !summaryMatch) {
          return false;
        }
      }

      // 2. Product Filter
      if (filterProduct !== 'all' && row.product !== filterProduct) {
        return false;
      }

      // 3. Sentiment / Needs Reply Filter
      if (filterSentiment !== 'all') {
        if (filterSentiment === 'needs_reply') {
          if (row.analysis?.needs_reply !== true) {
            return false;
          }
        } else {
          const rowSentiment = row.analysis?.sentiment;
          if (rowSentiment !== filterSentiment) {
            return false;
          }
        }
      }

      // 4. Topic Filter
      if (filterTopic !== 'all') {
        const rowTopics = row.analysis?.topics || [];
        if (!rowTopics.includes(filterTopic)) {
          return false;
        }
      }

      return true;
    });
  }, [reviews, filterProduct, filterSentiment, filterTopic, searchQuery]);

  const handleResetFilters = () => {
    setFilterProduct('all');
    setFilterSentiment('all');
    setFilterTopic('all');
    setSearchQuery('');
    showToast('Filters cleared');
  };

  return (
    <div className="app-shell">
      {/* 1. Left Sidebar Command Rail */}
      <Sidebar
        serverStatus={serverStatus}
        model={activeModel}
        selectedFile={selectedFile}
        onFileUpload={handleFileUpload}
        onAnalyze={handleAnalyze}
        isLoading={isLoading}
        error={error}
        onLoadSample={handleLoadSample}
        stats={stats}
        activeTab={filterSentiment}
        onTabChange={(tab) => setFilterSentiment(tab)}
      />

      {/* 2. Right Main Workspace Cockpit */}
      <main className="workspace-main">
        {/* Workspace Sticky Topbar */}
        <header className="workspace-topbar">
          <div className="topbar-left">
            <span className="topbar-title">Review Intelligence Cockpit</span>
            <span className="topbar-badge-tag">
              {stats ? `${stats.total_rows} Records Loaded` : 'Awaiting CSV Upload'}
            </span>
          </div>

          <div className="topbar-right">
            <div className="status-indicator-pill" title="Active Groq AI Model">
              <FiActivity size={13} color="#2563EB" />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#1E40AF' }}>
                {activeModel}
              </span>
            </div>

            {stats && (
              <button
                type="button"
                className="btn btn-secondary btn-xs"
                onClick={handleResetFilters}
                title="Reset all filters"
              >
                <FiRotateCcw size={12} />
                Reset
              </button>
            )}
          </div>
        </header>

        {/* Scrollable Workspace Content */}
        <div className="workspace-content-scroll">
          {/* Zero-State / Getting Started Hero Banner when no reviews analysed yet */}
          {!stats && (
            <div className="hero-welcome-card">
              <div className="hero-welcome-header">
                <div>
                  <h1 className="hero-headline">Customer Review Intelligence Platform</h1>
                  <p className="hero-subheadline">
                    Automated e-commerce customer review classification, dynamic issue extraction, and on-demand empathetic reply generation powered by Groq AI and Llama models.
                  </p>
                </div>
              </div>

              {/* 3 Architecture Pillars */}
              <div className="hero-pillars-grid">
                <div className="hero-pillar-item">
                  <div className="pillar-icon-box">
                    <FiShield size={16} />
                  </div>
                  <h3 className="pillar-title">Prompt Injection Defense</h3>
                  <p className="pillar-desc">
                    Review text is strictly isolated in user data boundaries. Malicious instructions in reviews like R012 &amp; R015 are neutralized.
                  </p>
                </div>

                <div className="hero-pillar-item">
                  <div className="pillar-icon-box">
                    <FiDatabase size={16} />
                  </div>
                  <h3 className="pillar-title">SHA-256 Deduplication</h3>
                  <p className="pillar-desc">
                    Normalized review texts are hashed with SHA-256 and cached locally. Duplicate rows and repeated uploads incur 0 API cost.
                  </p>
                </div>

                <div className="hero-pillar-item">
                  <div className="pillar-icon-box">
                    <FiZap size={16} />
                  </div>
                  <h3 className="pillar-title">Sequential Batch Processing</h3>
                  <p className="pillar-desc">
                    Reviews are processed in controlled batches of 5 with exponential backoff handling HTTP 429 rate limits and 5xx errors.
                  </p>
                </div>
              </div>

              {/* Hero Call To Action Bar */}
              <div className="hero-cta-bar">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-heading)' }}>
                    Ready to test?
                  </span>
                  <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                    Click below to load all 30 assessment records or use the sidebar to upload a file.
                  </span>
                </div>

                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={async () => {
                    await handleLoadSample();
                  }}
                  disabled={isLoading}
                >
                  <FiLayers size={14} />
                  Load Assessment Dataset (30 Reviews)
                </button>
              </div>
            </div>
          )}

          {/* When Data is Loaded: Executive Dashboard Cockpit */}
          {stats && (
            <>
              {/* Row 1: KPI Summary Cards (5 Executive Cards) */}
              <SummaryCards stats={stats} />

              {/* Row 2: Split Grid (Sentiment Spectrum on Left, Dynamic Insights on Right) */}
              <div className="middle-split-row">
                <SentimentChart stats={stats} />
                <InsightsSection insights={insights} />
              </div>

              {/* Row 3: Reviews Data Explorer Toolbar & Table */}
              <FilterSection
                products={uniqueProducts}
                selectedProduct={filterProduct}
                onProductChange={setFilterProduct}
                selectedSentiment={filterSentiment}
                onSentimentChange={setFilterSentiment}
                selectedTopic={filterTopic}
                onTopicChange={setFilterTopic}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onResetFilters={handleResetFilters}
                totalResults={filteredReviews.length}
                needsReplyCount={stats.needs_reply_count || 0}
              />

              <ReviewTable
                reviews={filteredReviews}
                onGenerateReply={handleOpenReplyModal}
                isGeneratingReply={isGeneratingReply}
              />
            </>
          )}
        </div>
      </main>

      {/* Dedicated Analysis Modal while Analysing (shows Model & Live Pipeline) */}
      {isLoading && (
        <Loader
          model={activeModel}
          message="Analyzing customer reviews in batches of 5 with Groq AI..."
        />
      )}

      {/* Suggested Reply Modal */}
      <ReplyModal
        isOpen={isReplyModalOpen}
        onClose={() => setIsReplyModalOpen(false)}
        review={activeReviewForReply}
        replyText={replyText}
        isLoading={isGeneratingReply}
      />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="toast-floating">
          <FiCheck size={14} color="#10B981" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
