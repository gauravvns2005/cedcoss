import React, { useState, useEffect, useMemo } from 'react';
import { FiCheck } from 'react-icons/fi';
import Navbar from './components/Navbar.jsx';
import UploadSection from './components/UploadSection.jsx';
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
    <div className="app-layout">
      <Navbar serverStatus={serverStatus} model={activeModel} />

      <main className="main-content">
        {/* Upload Hero Section */}
        <UploadSection
          onFileUpload={handleFileUpload}
          onAnalyze={handleAnalyze}
          selectedFile={selectedFile}
          isLoading={isLoading}
          error={error}
          onLoadSample={handleLoadSample}
          model={activeModel}
        />

        {/* Dedicated Analysis Modal while Analysing (shows Model & Live Pipeline) */}
        {isLoading && (
          <Loader
            model={activeModel}
            message="Analyzing customer reviews in batches of 5 with Groq AI..."
          />
        )}

        {/* Dashboard Analytics */}
        {!isLoading && stats && (
          <>
            {/* 1. Summary Metric Cards */}
            <SummaryCards stats={stats} />

            {/* 2. Sentiment Distribution Chart */}
            <SentimentChart stats={stats} />

            {/* 3. Top 3 Complaints & Praises Insights */}
            <InsightsSection insights={insights} />

            {/* 4. Filter & Search Bar */}
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

            {/* 5. Detailed Review Table */}
            <ReviewTable
              reviews={filteredReviews}
              onGenerateReply={handleOpenReplyModal}
              isGeneratingReply={isGeneratingReply}
            />
          </>
        )}
      </main>

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
          <FiCheck size={15} color="#10B981" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
