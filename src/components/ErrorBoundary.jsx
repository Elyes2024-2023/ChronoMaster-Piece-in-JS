/**
 * ChronoMaster Piece - Error Boundary Component
 * Created by ELYES © 2024-2025
 * All rights reserved.
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Paper, Typography, Button } from '@mui/material';
import { Refresh } from '@mui/icons-material';
import { config } from '../config/env';

const MAX_REPORT_RETRIES = 3;
const REPORT_RETRY_DELAY = 2000;

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
    this.reportRetries = 0;
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  async reportError(error, errorInfo) {
    if (this.reportRetries >= MAX_REPORT_RETRIES) {
      console.error('Failed to report error after multiple attempts');
      return;
    }

    try {
      const response = await fetch(`${config.API_URL}/error-reporting`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: error.message,
          stack: error.stack,
          info: errorInfo,
          timestamp: new Date().toISOString(),
          component: this.props.componentName || 'Unknown'
        })
      });

      if (!response.ok) {
        throw new Error(`Error reporting failed with status: ${response.status}`);
      }

      this.reportRetries = 0; // Reset retries on success
    } catch (reportError) {
      console.error('Failed to report error:', reportError);
      this.reportRetries++;
      
      // Retry after delay
      setTimeout(() => {
        this.reportError(error, errorInfo);
      }, REPORT_RETRY_DELAY);
    }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    
    // Report error to analytics service in production
    if (!config.ENABLE_LOGS) {
      this.reportError(error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    this.reportRetries = 0; // Reset retries on manual reset
    this.props.onReset?.();
  };

  render() {
    if (this.state.hasError) {
      return (
        <Paper
          elevation={3}
          className="p-6 bg-black/40 backdrop-blur-lg text-white"
          sx={{
            borderRadius: 2,
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <Typography variant="h5" className="mb-4">
            Something went wrong
          </Typography>
          <Typography variant="body1" className="mb-4">
            {this.state.error?.message || 'An unexpected error occurred'}
          </Typography>
          <Button
            variant="contained"
            startIcon={<Refresh />}
            onClick={this.handleReset}
          >
            Try Again
          </Button>
        </Paper>
      );
    }

    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
  componentName: PropTypes.string,
  onReset: PropTypes.func
};

ErrorBoundary.defaultProps = {
  componentName: 'Unknown',
  onReset: undefined
};

export default ErrorBoundary; 