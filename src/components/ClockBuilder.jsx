/**
 * ChronoMaster Piece - Clock Builder Component
 * Created by ELYES © 2024-2025
 * All rights reserved.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { Paper, Typography, Slider, ColorPicker, Select, Button, Box, CircularProgress, Snackbar, Alert } from '@mui/material';
import { Save, Share, Preview } from '@mui/icons-material';
import { ErrorBoundary } from 'react-error-boundary';
import debounce from 'lodash/debounce';

const ClockBuilder = ({ onSave, onPreview }) => {
  const [design, setDesign] = useState({
    shape: 'circle',
    backgroundColor: '#000000',
    handColor: '#ffffff',
    secondHandColor: '#ff0000',
    tickColor: '#ffffff',
    tickStyle: 'line',
    size: 400,
    sound: 'tick',
    showNumbers: true,
    showDate: false,
    customPattern: null
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  
  // Use ref to store the debounced function for cleanup
  const debouncedSizeChangeRef = useRef(null);

  const shapes = [
    { value: 'circle', label: 'Classic Circle' },
    { value: 'square', label: 'Modern Square' },
    { value: 'hexagon', label: 'Hexagonal' },
    { value: 'abstract', label: 'Abstract' }
  ];

  const tickStyles = [
    { value: 'line', label: 'Simple Lines' },
    { value: 'dot', label: 'Dots' },
    { value: 'roman', label: 'Roman Numerals' },
    { value: 'arabic', label: 'Arabic Numerals' }
  ];

  const sounds = [
    { value: 'none', label: 'No Sound' },
    { value: 'tick', label: 'Classic Tick' },
    { value: 'gentle', label: 'Gentle Chime' },
    { value: 'modern', label: 'Modern Beep' }
  ];

  const validateColor = (color) => {
    const colorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    if (!colorRegex.test(color)) {
      throw new Error('Invalid color format. Please use hex color (e.g., #FF0000)');
    }
    return true;
  };

  const validateCustomPattern = (pattern) => {
    if (!pattern) return true;
    
    // Validate pattern format (example: SVG path or custom JSON format)
    try {
      if (typeof pattern === 'string') {
        // Check if it's a valid SVG path
        if (pattern.startsWith('<svg') || pattern.startsWith('M')) {
          return true;
        }
        // Try parsing as JSON
        JSON.parse(pattern);
        return true;
      }
      return false;
    } catch (e) {
      throw new Error('Invalid custom pattern format');
    }
  };

  const validateDesign = () => {
    if (!design.backgroundColor || !design.handColor) {
      throw new Error('Please select all required colors');
    }
    validateColor(design.backgroundColor);
    validateColor(design.handColor);
    validateColor(design.secondHandColor);
    validateColor(design.tickColor);
    
    if (design.size < 200 || design.size > 800) {
      throw new Error('Clock size must be between 200px and 800px');
    }

    if (design.customPattern) {
      validateCustomPattern(design.customPattern);
    }
    
    return true;
  };

  const handleChange = (property, value) => {
    setError(null);
    try {
      if (property.includes('Color')) {
        validateColor(value);
      } else if (property === 'customPattern') {
        validateCustomPattern(value);
      }
      setDesign(prev => ({
        ...prev,
        [property]: value
      }));
    } catch (err) {
      setError(err.message);
    }
  };

  // Create debounced size change handler
  useEffect(() => {
    debouncedSizeChangeRef.current = debounce((value) => {
      handleChange('size', value);
    }, 300);

    // Cleanup function
    return () => {
      if (debouncedSizeChangeRef.current) {
        debouncedSizeChangeRef.current.cancel();
      }
    };
  }, []);

  const showNotification = (message, severity = 'success') => {
    setNotification({
      open: true,
      message,
      severity
    });
  };

  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      setError(null);
      validateDesign();
      await onSave(design);
      showNotification('Design saved successfully!');
    } catch (err) {
      setError(err.message);
      showNotification(err.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreview = () => {
    try {
      validateDesign();
      onPreview(design);
    } catch (err) {
      setError(err.message);
      showNotification(err.message, 'error');
    }
  };

  const handleShare = async () => {
    try {
      setIsLoading(true);
      setError(null);
      validateDesign();
      const designString = btoa(JSON.stringify(design));
      const shareUrl = `${window.location.origin}/piece/${designString}`;
      
      if (navigator.share) {
        await navigator.share({
          title: 'My ChronoMaster Piece',
          text: 'Check out my custom clock design!',
          url: shareUrl
        });
        showNotification('Design shared successfully!');
      } else {
        await navigator.clipboard.writeText(shareUrl);
        showNotification('Design URL copied to clipboard!');
      }
    } catch (error) {
      setError(error.message);
      showNotification(error.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ErrorBoundary componentName="ClockBuilder">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Paper
          elevation={3}
          className="p-6 bg-black/40 backdrop-blur-lg"
          sx={{
            borderRadius: 2,
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <Typography variant="h5" className="text-white mb-4">
            Create Your Masterpiece
          </Typography>

          <div className="space-y-6">
            {/* Shape Selection */}
            <div>
              <Typography variant="subtitle1" className="text-white mb-2">
                Clock Shape
              </Typography>
              <Select
                value={design.shape}
                onChange={(e) => handleChange('shape', e.target.value)}
                fullWidth
                className="bg-white/10 text-white"
              >
                {shapes.map(shape => (
                  <option key={shape.value} value={shape.value}>
                    {shape.label}
                  </option>
                ))}
              </Select>
            </div>

            {/* Color Pickers */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Typography variant="subtitle1" className="text-white mb-2">
                  Background Color
                </Typography>
                <ColorPicker
                  value={design.backgroundColor}
                  onChange={(color) => handleChange('backgroundColor', color)}
                />
              </div>
              <div>
                <Typography variant="subtitle1" className="text-white mb-2">
                  Hand Color
                </Typography>
                <ColorPicker
                  value={design.handColor}
                  onChange={(color) => handleChange('handColor', color)}
                />
              </div>
            </div>

            {/* Size Slider with debounce */}
            <div>
              <Typography variant="subtitle1" className="text-white mb-2">
                Size: {design.size}px
              </Typography>
              <Slider
                value={design.size}
                onChange={(e, value) => debouncedSizeChangeRef.current(value)}
                min={200}
                max={800}
                step={50}
                className="text-white"
              />
            </div>

            {/* Additional Options */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Typography variant="subtitle1" className="text-white mb-2">
                  Tick Style
                </Typography>
                <Select
                  value={design.tickStyle}
                  onChange={(e) => handleChange('tickStyle', e.target.value)}
                  fullWidth
                  className="bg-white/10 text-white"
                >
                  {tickStyles.map(style => (
                    <option key={style.value} value={style.value}>
                      {style.label}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Typography variant="subtitle1" className="text-white mb-2">
                  Sound
                </Typography>
                <Select
                  value={design.sound}
                  onChange={(e) => handleChange('sound', e.target.value)}
                  fullWidth
                  className="bg-white/10 text-white"
                >
                  {sounds.map(sound => (
                    <option key={sound.value} value={sound.value}>
                      {sound.label}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            {error && (
              <Typography color="error" className="mt-4">
                {error}
              </Typography>
            )}

            <div className="flex justify-end space-x-4 mt-6">
              <Button
                variant="outlined"
                startIcon={<Preview />}
                onClick={handlePreview}
                className="text-white border-white hover:bg-white/10"
                disabled={isLoading}
              >
                Preview
              </Button>
              <Button
                variant="outlined"
                startIcon={<Share />}
                onClick={handleShare}
                className="text-white border-white hover:bg-white/10"
                disabled={isLoading}
              >
                Share
              </Button>
              <Button
                variant="contained"
                startIcon={isLoading ? <CircularProgress size={20} /> : <Save />}
                onClick={handleSave}
                className="bg-white text-black hover:bg-white/90"
                disabled={isLoading}
              >
                {isLoading ? 'Saving...' : 'Save Design'}
              </Button>
            </div>
          </div>
        </Paper>

        <Snackbar
          open={notification.open}
          autoHideDuration={6000}
          onClose={handleCloseNotification}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert
            onClose={handleCloseNotification}
            severity={notification.severity}
            variant="filled"
          >
            {notification.message}
          </Alert>
        </Snackbar>
      </motion.div>
    </ErrorBoundary>
  );
};

ClockBuilder.propTypes = {
  onSave: PropTypes.func.isRequired,
  onPreview: PropTypes.func.isRequired
};

export default ClockBuilder; 