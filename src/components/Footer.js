import React from 'react';
import './Footer.css';
import { SiX, SiGithub, SiBluesky, SiThreads } from 'react-icons/si';
import { HiMail } from 'react-icons/hi';

const Footer = () => {
  return (
    <footer className="page-footer">
      <div className="footer-content">
        <div className="footer-copyright">
          © {new Date().getFullYear()} GalilAI Group @ Brown. All Rights Reserved.
        </div>
        <div className="footer-contact">
          <span className="footer-label">Contact Us</span>
          <a
            href="mailto:galilaigroup@gmail.com"
            className="social-icon"
            aria-label="Email us at galilaigroup@gmail.com"
            title="galilaigroup@gmail.com"
          >
            <HiMail size={20} />
          </a>
        </div>
        <div className="footer-social">
          <span className="footer-label">Follow Us</span>
          <a
            href="https://x.com/GalilAI_Group"
            className="social-icon"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Follow us on X"
          >
            <SiX size={20} />
          </a>
          <a
            href="https://github.com/rbalestr-lab"
            className="social-icon"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Follow us on GitHub"
          >
            <SiGithub size={20} />
          </a>
          <a href="https://bsky.app/profile/galilai.bsky.social" className="social-icon" target="_blank" rel="noopener noreferrer" aria-label="Follow us on Bluesky">
            <SiBluesky size={20} />
          </a>
          <a href="https://www.threads.com/@galilai_group" className="social-icon" target="_blank" rel="noopener noreferrer" aria-label="Follow us on Threads">
            <SiThreads size={20} />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
