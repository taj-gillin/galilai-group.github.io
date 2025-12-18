import React, { useEffect, useState } from 'react';
import './Opportunities.css';
import { Link, useLocation } from 'react-router-dom';
import { withPublicUrl } from '../utils/publicUrl';

const Opportunities = () => {
  const location = useLocation();
  const [opportunitiesData, setOpportunitiesData] = useState(null);

  useEffect(() => {
    fetch(withPublicUrl('/data/opportunities.json'))
      .then(response => response.json())
      .then(data => setOpportunitiesData(data))
      .catch(error => console.error('Error fetching opportunities data:', error));
  }, []);

  // Restore scroll position if returning from detail page
  useEffect(() => {
    if (location.state?.returning && location.state?.scrollKey === 'opportunitiesScroll') {
      const savedScroll = sessionStorage.getItem('opportunitiesScroll');
      if (savedScroll) {
        setTimeout(() => {
          window.scrollTo(0, parseInt(savedScroll, 10));
          sessionStorage.removeItem('opportunitiesScroll');
        }, 100);
      }
    }
  }, [location.state]);

  // Save scroll position before navigating
  const handleLinkClick = () => {
    sessionStorage.setItem('opportunitiesScroll', window.scrollY.toString());
  };

  if (!opportunitiesData) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="opportunities-page">
      {/* Section 1: Google Form Contact Option */}
      {/* <section className="opportunities-google-form">
        <h1>Get in Touch</h1>
        <p>
          We'd love to hear from you! Use our online form to send us your questions or comments, and we'll get back to you ASAP.
        </p>
        <a
          href="https://forms.gle/example"
          target="_blank"
          rel="noopener noreferrer"
          className="google-form-button"
        >
          Open Contact Form
        </a>
      </section> */}

      {/* Section 2: Research Opportunities */}
      <section className="opportunities-section opportunities-opportunities">
        <div className="opportunities-content">
          <div className="news-listings card-list opportunities-list">
            <ul>
              {opportunitiesData.items
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .map((item, index) => (
                  <li key={item.id || index} className="news-post opportunity-post">
                    <div className="post-content-wrapper">
                      <h2 className="post-title">
                        <Link 
                          to={`/opportunities/${item.id}`}
                          onClick={handleLinkClick}
                        >
                          {item.title}
                        </Link>
                      </h2>
                      <div className="post-meta">
                        <span className="post-updated">
                          {new Date(item.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                      {item.description && (
                        <p
                          className="post-description"
                          dangerouslySetInnerHTML={{ __html: item.description }}
                        />
                      )}
                    </div>
                  </li>
                ))}
            </ul>
          </div>
        </div>
      </section>

      {/* <div className="developer-watermark">
        <p className="dev-title">Meet Our Developers</p>
        <div className="dev-info-container">
          <div className="dev-info">
            <span className="dev-name">Kyle Lam</span>
            <div className="dev-social">
              <a
                href="https://twitter.com"
                className="social-icon"
                target="_blank"
                rel="noopener noreferrer"
              >
                <XIcon />
              </a>
              <a
                href="https://linkedin.com/in/yourprofile"
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon"
              >
                <Linkedin size={16} />
              </a>
              <a
                href="https://github.com/yourprofile"
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon"
              >
                <Github size={16} />
              </a>
            </div>
          </div>

          
        </div>
      </div> */}

    </div>
  );
};

export default Opportunities;

