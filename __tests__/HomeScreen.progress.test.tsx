import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { Alert, Text as RNText, TouchableOpacity } from 'react-native';

import { HomeScreen } from '../src/screens/HomeScreen';

jest.mock('lucide-react-native', () => {
  const MockIcon = () => null;
  return new Proxy(
    {},
    {
      get: () => MockIcon,
    },
  );
});

jest.mock('../src/components/Text', () => {
  const { Text } = require('react-native');
  return { Text };
});

jest.mock('../src/components/RecommendationsWidget', () => {
  return { RecommendationsWidget: () => null };
});

jest.mock('../src/components/PlanCardModal', () => {
  return {
    PlanCardModal: () => null,
  };
});

jest.mock('../src/lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: async () => ({ data: { user: null } }),
    },
  },
}));

const mockUseAppContext = jest.fn();
jest.mock('../src/context/AppContext', () => ({
  useAppContext: () => mockUseAppContext(),
}));

describe('HomeScreen progress alert', () => {
  let alertSpy: jest.SpyInstance;

  beforeEach(() => {
    alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    mockUseAppContext.mockReturnValue({
      assessmentHistory: [],
      weeklyTasks: [],
      progressSnapshot: {
        completedChallenges: 2,
        totalChallenges: 5,
        streakDays: 0,
        weeksActive: 0,
      },
      setShowNotifications: jest.fn(),
      setAIModalVisible: jest.fn(),
      setAIDraftMessage: jest.fn(),
      updateWeeklyTaskStatus: jest.fn(),
    });
  });

  afterEach(() => {
    alertSpy.mockRestore();
    jest.clearAllMocks();
  });

  test('shows dynamic completed/percent values', async () => {
    let tree: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(async () => {
      tree = ReactTestRenderer.create(<HomeScreen />);
    });

    const progressButtons = tree!.root.findAllByType(TouchableOpacity).filter(button => {
      try {
        const textNodes = button.findAllByType(RNText);
        return textNodes.some(node => node.props.children === 'Progress');
      } catch {
        return false;
      }
    });

    expect(progressButtons.length).toBeGreaterThan(0);

    await ReactTestRenderer.act(async () => {
      progressButtons[0].props.onPress();
    });

    expect(Alert.alert).toHaveBeenCalledWith(
      'Progress',
      expect.stringContaining('2/5'),
      expect.any(Array),
    );
    expect(Alert.alert).toHaveBeenCalledWith(
      'Progress',
      expect.stringContaining('40%'),
      expect.any(Array),
    );
  });
});
