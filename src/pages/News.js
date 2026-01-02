import React, {useEffect, useState} from 'react';
import { Link, useLocation } from 'react-router-dom';
import './News.css';
import { withPublicUrl } from '../utils/publicUrl';

const News = () => {
  const location = useLocation();
  const [posts, setPosts] = useState(null);
  const [events, setEvents] = useState(null);

  // Helper function to parse YYYY-MM-DD as local date (avoiding timezone issues)
  const parseLocalDate = (dateString) => {
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
  };

  // Helper function to format date range
  const formatDateRange = (startDate, endDate) => {
    const start = parseLocalDate(startDate);
    const end = parseLocalDate(endDate);
    
    const startFormatted = start.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    const endFormatted = end.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });

    // If same year and month, use compact format: "February 4-6, 2026"
    if (start.getFullYear() === end.getFullYear() && start.getMonth() === end.getMonth()) {
      const monthName = start.toLocaleDateString('en-US', { month: 'long' });
      const startDay = start.getDate();
      const endDay = end.getDate();
      const year = start.getFullYear();
      return `${monthName} ${startDay}-${endDay}, ${year}`;
    }
    
    // If same year but different month: "February 4 - March 6, 2026"
    if (start.getFullYear() === end.getFullYear()) {
      const startMonth = start.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
      const endMonth = end.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
      const year = start.getFullYear();
      return `${startMonth} - ${endMonth}, ${year}`;
    }
    
    // Different years: "February 4, 2025 - March 6, 2026"
    return `${startFormatted} - ${endFormatted}`;
  };

  useEffect(() => {
    fetch(withPublicUrl('/data/news.json'))
      .then(res => res.json())
      .then(setPosts)
      .catch(e => console.log(e));
    
    fetch(withPublicUrl('/data/events.json'))
      .then(res => res.json())
      .then(setEvents)
      .catch(e => console.log(e));
  }, []);

  // Restore scroll position if returning from detail page
  useEffect(() => {
    if (location.state?.returning && location.state?.scrollKey === 'newsScroll') {
      const savedScroll = sessionStorage.getItem('newsScroll');
      if (savedScroll) {
        setTimeout(() => {
          window.scrollTo(0, parseInt(savedScroll, 10));
          sessionStorage.removeItem('newsScroll');
        }, 100);
      }
    }
  }, [location.state]);

  // Save scroll position before navigating
  const handleLinkClick = () => {
    sessionStorage.setItem('newsScroll', window.scrollY.toString());
  };

  if(!posts || !events) return (<div>Loading...</div>);

  const sortedPosts = posts.news.sort((a, b) => new Date(b.date) - new Date(a.date));
  const sortedEvents = events.events.sort((a, b) => parseLocalDate(b.date) - parseLocalDate(a.date));

  return (
    <div className="news-container">
      {/* News Section */}
      <div className="news-section-header">
        <h2 className="news-section-title">News</h2>
      </div>
      <div className="news-grid">
          {sortedPosts.map((post, index) => (
                  <Link 
            key={index}
                    to={`/news/${post.id}`}
                    onClick={handleLinkClick}
            className={`news-card ${post.thumbnail_image ? 'news-card-with-image' : ''}`}
            style={post.thumbnail_image ? { backgroundImage: `url(${withPublicUrl(post.thumbnail_image)})` } : {}}
          >
            <div className="news-card-content">
              <h2 className="news-card-title">{post.title}</h2>
              {post.date && (
                <span className="news-card-date">{new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              )}
              {post.summary && (
                <p className="news-card-summary">{post.summary}</p>
              )}
                </div>
          </Link>
          ))}
      </div>

      {/* Events Section */}
      <div className="news-section-header events-section-header">
        <h2 className="news-section-title">Events</h2>
      </div>
      <div className="events-grid">
        {sortedEvents.length > 0 ? (
          sortedEvents.map((event, index) => (
            <a
              key={index}
              href={event.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`event-card ${event.thumbnail_image ? 'event-card-with-image' : ''}`}
              style={event.thumbnail_image ? { backgroundImage: `url(${withPublicUrl(event.thumbnail_image)})` } : {}}
            >
              <div className="event-card-content">
                <h2 className="event-card-title">{event.title}</h2>
                {event.type && (
                  <div className="event-card-type">{event.type}</div>
                )}
                {event.date && (
                  <div className="event-card-date">
                    {event.endDate 
                      ? formatDateRange(event.date, event.endDate)
                      : parseLocalDate(event.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
                    }
                  </div>
                )}
                {event.at && (
                  <div className="event-card-location">@ {event.at}</div>
                )}
              </div>
            </a>
          ))
        ) : (
          <p className="events-placeholder">Coming soon...</p>
        )}
      </div>
    </div>
  );
}

export default News;

