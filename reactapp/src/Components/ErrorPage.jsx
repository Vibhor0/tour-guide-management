import React from 'react';
import { Link } from 'react-router-dom';
import './ErrorPage.css';

// If the image is in /src/assets or similar, adjust the path accordingly:
// e.g. if placed alongside the component: './1000182042.png'

function ErrorPage() {
  return (
    <div className="error-wrapper" data-testid="error-page" role="document" aria-labelledby="error-title">
      <main className="error-main">

        {/* Abstract Background Blobs */}
        <div className="blob-bg blob-1" aria-hidden="true"></div>
        <div className="blob-bg blob-2" aria-hidden="true"></div>

        <div className="container">
          <div className="row align-items-center justify-content-center g-4">
            {/* Left: Text */}
            <div className="col-lg-5 error-text-section">
              <h1 className="error-code" aria-label="Error 404">404</h1>
              <h2 className="error-title" id="error-title">Ooops! Page Not Found</h2>
              <p className="error-subtitle">
                This page doesn’t exist or was removed. <br />
                Let’s take you back home.
              </p>

              <div className="action-row">
                <Link to="/" className="btn-primary-pill" aria-label="Back to Home">
                  Back to Home
                </Link>
              </div>
            </div>

            {/* Right: Illustration */}
            <div className="col-lg-6 error-visual-section">
              <div className="illustration-container">
                <img
                  src= "/assets/1000182042 (2).png"
                  alt="Two friendly robots, one confused, representing a missing page"
                  className="error-illustration"
                  loading="eager"
                />

                {/* Soft decorative dust/gears */}
                <div className="mini-blob mint" aria-hidden="true"></div>
                <div className="mini-blob lavender" aria-hidden="true"></div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default ErrorPage;