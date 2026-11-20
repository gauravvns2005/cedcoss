/**
 * Dynamically computes Top 3 Complaints and Top 3 Praises
 * from the actual analyzed reviews.
 * 
 * @param {Array} reviews - Analyzed review rows
 * @returns {{ topComplaints: Array, topPraises: Array }}
 */
export function generateInsights(reviews) {
  const validAnalyzed = reviews.filter(
    (r) => r.status === 'analyzed' && r.analysis
  );

  const complaintsList = [];
  const praisesList = [];

  for (const r of validAnalyzed) {
    const { sentiment, topics, summary } = r.analysis;

    if (sentiment === 'negative') {
      complaintsList.push({
        review_id: r.review_id,
        product: r.product,
        topics: topics || ['other'],
        summary: summary || r.review_text.substring(0, 80)
      });
    } else if (sentiment === 'positive') {
      praisesList.push({
        review_id: r.review_id,
        product: r.product,
        topics: topics || ['other'],
        summary: summary || r.review_text.substring(0, 80)
      });
    }
  }

  // Aggregate complaints by primary topic
  const topComplaints = aggregateInsights(complaintsList, 'complaint').slice(0, 3);
  
  // Aggregate praises by primary topic
  const topPraises = aggregateInsights(praisesList, 'praise').slice(0, 3);

  return {
    topComplaints,
    topPraises
  };
}

/**
 * Aggregates reviews into category insight cards with counts and sample summaries
 * @param {Array} items 
 * @param {string} type 
 * @returns {Array}
 */
function aggregateInsights(items, type) {
  const topicMap = new Map();

  for (const item of items) {
    const primaryTopic = item.topics[0] || 'other';

    if (!topicMap.has(primaryTopic)) {
      topicMap.set(primaryTopic, {
        topic: primaryTopic,
        count: 0,
        type,
        summaries: []
      });
    }

    const entry = topicMap.get(primaryTopic);
    entry.count += 1;
    if (entry.summaries.length < 2 && item.summary) {
      entry.summaries.push(item.summary);
    }
  }

  // Sort by highest count
  const sorted = Array.from(topicMap.values()).sort((a, b) => b.count - a.count);

  return sorted.map((entry) => ({
    topic: formatTopicName(entry.topic),
    count: entry.count,
    headline: entry.summaries[0] || `Key ${type} regarding ${formatTopicName(entry.topic)}`,
    details: entry.summaries.slice(1).join('; ')
  }));
}

/**
 * Formats topic code to human readable title
 * @param {string} topic 
 * @returns {string}
 */
function formatTopicName(topic) {
  const map = {
    quality: 'Product Quality',
    delivery: 'Delivery & Shipping',
    price: 'Pricing & Value',
    packaging: 'Packaging',
    support: 'Customer Support',
    size_fit: 'Size & Fit',
    other: 'General Experience'
  };
  return map[topic] || topic.charAt(0).toUpperCase() + topic.slice(1);
}
