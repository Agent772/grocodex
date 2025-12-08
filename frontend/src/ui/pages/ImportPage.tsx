import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  LinearProgress,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { ParsedShoppingListItem } from '../../utils/shoppingListParser';
import { useImportMatcher } from '../hooks/useImportMatcher';
import { MatchResult } from '../../types/importMatching';
import ImportForm from '../components/import/ImportForm';
import MatchResultsView from '../components/import/MatchResultsView';
import { useAppConfig } from '../../db/hooks/logic/appConfigDBHooks';

const ImportPage: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [matchResults, setMatchResults] = useState<MatchResult[]>([]);
  const [isMatching, setIsMatching] = useState<boolean>(false);
  const [matchProgress, setMatchProgress] = useState<number>(0);
  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({
    inStock: true,
    outOfStock: true,
    ambiguous: true,
    debug: false,
  });

  const config = useAppConfig();
  const fuzzyThreshold = config?.fuzzy_match_threshold ?? 0.7;
  const { matchItemsInBatches } = useImportMatcher({ fuzzyThreshold });

  const handleImportComplete = async (items: ParsedShoppingListItem[]) => {
    // Start matching in batches
    setIsMatching(true);
    setMatchProgress(0);
    setMatchResults([]);
    
    try {
      // Process batches with progress updates
      const allResults: MatchResult[] = [];
      
      for await (const batchResult of matchItemsInBatches(items, 10)) {
        // Add batch results to accumulated results
        allResults.push(...batchResult.results);
        setMatchResults([...allResults]);
        setMatchProgress(batchResult.progress);
        
        // If not the last batch, give UI a moment to update
        if (!batchResult.isComplete) {
          await new Promise(resolve => setTimeout(resolve, 50));
        }
      }
    } catch (error) {
      console.error('Error matching items:', error);
    } finally {
      setIsMatching(false);
      setMatchProgress(1);
    }
  };

  const handleClear = () => {
    setMatchResults([]);
    setMatchProgress(0);
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  return (
    <Container 
      maxWidth="md" 
      sx={{ 
        py: { xs: 1, md: 3 },
        px: { xs: 0, md: 0 }
      }}
    >
      <Paper 
        elevation={isMobile ? 0 : 2} 
        sx={{ 
          p: { xs: 2, md: 3 },
          backgroundColor: { xs: 'transparent', md: 'background.paper' },
          height: '85vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Typography variant="h5" component="h1" gutterBottom>
          {t('import.title', 'Import Shopping List')}
        </Typography>
        
        {/* Import Form */}
        {matchResults.length === 0 && (
          <ImportForm
            isMatching={isMatching}
            onImportComplete={handleImportComplete}
          />
        )}

        {/* Matching Progress */}
        {isMatching && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {t('import.matching', 'Matching items against pantry inventory...')}
            </Typography>
            <LinearProgress variant="determinate" value={matchProgress * 100} />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
              {Math.round(matchProgress * 100)}% {t('common.complete', 'complete')}
            </Typography>
          </Box>
        )}

        {/* Match Results */}
        {matchResults.length > 0 && !isMatching && (
          <MatchResultsView
            matchResults={matchResults}
            setMatchResults={setMatchResults}
            expandedSections={expandedSections}
            onClear={handleClear}
            onToggleSection={toggleSection}
          />
        )}
      </Paper>
    </Container>
  );
};

export default ImportPage;
