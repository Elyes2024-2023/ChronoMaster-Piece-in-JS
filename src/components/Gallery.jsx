/**
 * ChronoMaster Piece - Gallery Component
 * Created by ELYES © 2024-2025
 * All rights reserved.
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Paper, Typography, Grid, Card, CardContent, CardActions, Button, Chip } from '@mui/material';
import { Favorite, Share, Visibility } from '@mui/icons-material';

const Gallery = ({ designs = [] }) => {
  const [filteredDesigns, setFilteredDesigns] = useState(designs);
  const [sortBy, setSortBy] = useState('popular');

  useEffect(() => {
    // Sort designs based on selected criteria
    const sorted = [...designs].sort((a, b) => {
      switch (sortBy) {
        case 'popular':
          return b.likes - a.likes;
        case 'recent':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'trending':
          return b.views - a.views;
        default:
          return 0;
      }
    });
    setFilteredDesigns(sorted);
  }, [designs, sortBy]);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
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
        <div className="flex justify-between items-center mb-6">
          <Typography variant="h5" className="text-white">
            Gallery of Masterpieces
          </Typography>
          <div className="flex space-x-2">
            <Chip
              label="Most Popular"
              onClick={() => setSortBy('popular')}
              color={sortBy === 'popular' ? 'primary' : 'default'}
              className="text-white"
            />
            <Chip
              label="Recent"
              onClick={() => setSortBy('recent')}
              color={sortBy === 'recent' ? 'primary' : 'default'}
              className="text-white"
            />
            <Chip
              label="Trending"
              onClick={() => setSortBy('trending')}
              color={sortBy === 'trending' ? 'primary' : 'default'}
              className="text-white"
            />
          </div>
        </div>

        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredDesigns.map((design) => (
            <motion.div key={design.id} variants={item}>
              <Card className="bg-white/10 backdrop-blur-lg text-white">
                <CardContent>
                  <div className="aspect-square relative">
                    {/* Clock Preview */}
                    <div
                      className="w-full h-full rounded-lg"
                      style={{
                        backgroundColor: design.backgroundColor,
                        border: `2px solid ${design.handColor}`
                      }}
                    >
                      {/* Clock hands would be rendered here */}
                    </div>
                  </div>
                  <Typography variant="h6" className="mt-4">
                    {design.name}
                  </Typography>
                  <Typography variant="body2" className="text-gray-300">
                    by {design.creator}
                  </Typography>
                </CardContent>
                <CardActions className="justify-between px-4 pb-4">
                  <div className="flex space-x-2">
                    <Button
                      size="small"
                      startIcon={<Favorite />}
                      className="text-white"
                    >
                      {design.likes}
                    </Button>
                    <Button
                      size="small"
                      startIcon={<Visibility />}
                      className="text-white"
                    >
                      {design.views}
                    </Button>
                  </div>
                  <Button
                    size="small"
                    startIcon={<Share />}
                    className="text-white"
                  >
                    Share
                  </Button>
                </CardActions>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </Paper>
    </motion.div>
  );
};

export default Gallery; 