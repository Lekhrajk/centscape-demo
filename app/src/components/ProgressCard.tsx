import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { theme } from '../theme';

interface ProgressData {
  totalValue: number;
  goalAmount: number;
  remainingAmount: number;
  progressPercentage: number;
  daysToGoal: number;
}

interface ProgressCardProps {
  progressData: ProgressData;
}

const ProgressCard: React.FC<ProgressCardProps> = ({ progressData }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const handleCardPress = () => {
    setShowTooltip(!showTooltip);
  };

  return (
    <View style={styles.progressCardContainer}>
      <TouchableOpacity style={styles.progressCard} onPress={handleCardPress} activeOpacity={0.8}>
        <Text style={styles.progressLabel}>Your progress</Text>
        {/* Amount and Goal in same line */}
        <View style={styles.amountRow}>
          <Text style={styles.savedAmount}>You have saved ${progressData.totalValue.toFixed(2)}</Text>
          <Text style={styles.goalText}>Goal ${progressData.goalAmount}</Text>
        </View>
        
        {/* Progress Bar */}
        <View style={styles.progressBarContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${Math.min(progressData.progressPercentage, 100)}%` }
              ]} 
            />
            <View style={styles.progressMarkers}>
              <View style={styles.marker} />
              <View style={styles.marker} />
              <View style={styles.marker} />
              <View style={styles.marker} />
            </View>
          </View>
          
          {/* Tooltip positioned relative to progress bar */}
          {showTooltip && (
            <View style={styles.tooltipContainer}>
              <View style={styles.tooltipArrow} />
              <View style={styles.tooltipContent}>
                <Text style={styles.tooltipText}>${progressData.remainingAmount.toFixed(2)} to go</Text>
              </View>
            </View>
          )}
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  progressCardContainer: {
    position: 'relative',
    marginHorizontal: theme.spacing.md,
    marginVertical: theme.spacing.sm,
  },
  progressCard: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.small,
  },
  progressLabel: {
    ...theme.typography.caption,
    color: theme.colors.textLight,
    marginBottom: theme.spacing.xs,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  savedAmount: {
    ...theme.typography.h1,
    color: theme.colors.primary,
    flex: 1,
  },
  progressBarContainer: {
    marginBottom: theme.spacing.md,
    position: 'relative', // For tooltip positioning
  },
  progressBar: {
    height: 8,
    backgroundColor: theme.colors.progressBackground,
    borderRadius: theme.borderRadius.pill,
    position: 'relative',
    marginBottom: theme.spacing.xs,
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.pill,
  },
  progressMarkers: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 2,
  },
  marker: {
    width: 4,
    height: 4,
    backgroundColor: theme.colors.surface,
    borderRadius: 2,
  },
  goalText: {
    ...theme.typography.caption,
    color: theme.colors.textLight,
    textAlign: 'right',
    marginLeft: theme.spacing.md,
  },
  remainingContainer: {
    alignItems: 'flex-end',
  },
  remainingTag: {
    backgroundColor: theme.colors.text,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  },
  remainingText: {
    ...theme.typography.bodySmall,
    color: theme.colors.surface,
    fontWeight: '600',
  },
  tooltipContainer: {
    position: 'absolute',
    top: '100%',
    left: '50%',
    transform: [{ translateX: -50 }], // Center horizontally
    backgroundColor: theme.colors.text,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    marginTop: theme.spacing.xs,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
    zIndex: 1000,
  },
  tooltipArrow: {
    position: 'absolute',
    top: -6,
    right: 20,
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderBottomWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: theme.colors.text,
  },
  tooltipContent: {
    alignItems: 'center',
  },
  tooltipText: {
    ...theme.typography.bodySmall,
    color: theme.colors.surface,
    fontWeight: '600',
  },
});

export default ProgressCard;
