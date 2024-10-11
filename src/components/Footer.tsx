// src/components/Footer.tsx
import React from 'react';
import './css/AnimeList.css';

interface FooterProps {
  showFooter: boolean;
  showPagination: boolean;
}

const Footer: React.FC<FooterProps> = ({ showFooter, showPagination }) => {
  return (
    <footer className={`footer ${showFooter ? 'show' : ''} ${showPagination ? 'show-pagination' : ''}`}>
      <div className="background-head">
        <div className="logo"></div>
      </div>
    </footer>
  );
};

export default Footer;
