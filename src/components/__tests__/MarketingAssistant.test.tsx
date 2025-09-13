import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MarketingAssistant } from './MarketingAssistant';
import * as apiService from '../services/api';

// Mock the apiService
jest.mock('../services/api', () => ({
  apiService: {
    getAIAssist: jest.fn()
  }
}));

describe('MarketingAssistant', () => {
  const mockUserId = '123';
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('renders correctly', () => {
    render(<MarketingAssistant userId={mockUserId} />);
    
    expect(screen.getByText('AI Marketing Assistant')).toBeInTheDocument();
    expect(screen.getByText('Generate engaging content for social media, email campaigns, and customer outreach')).toBeInTheDocument();
  });
  
  it('allows user to switch between content types', () => {
    render(<MarketingAssistant userId={mockUserId} />);
    
    // Check initial state (social media)
    expect(screen.getByText('Platform')).toBeInTheDocument();
    
    // Switch to email
    fireEvent.click(screen.getByText('Email Campaign'));
    expect(screen.getByText('Tone')).toBeInTheDocument();
    expect(screen.queryByText('Platform')).not.toBeInTheDocument();
    
    // Switch to customer outreach
    fireEvent.click(screen.getByText('Customer Outreach'));
    expect(screen.getByPlaceholderText('Enter customer name')).toBeInTheDocument();
  });
  
  it('calls API when generating content', async () => {
    const mockResponse = { response: 'Generated marketing content' };
    (apiService.apiService.getAIAssist as jest.Mock).mockResolvedValue(mockResponse);
    
    render(<MarketingAssistant userId={mockUserId} />);
    
    // Fill in prompt
    const promptInput = screen.getByPlaceholderText('Describe what you want to create... e.g., \'Create a promotional post for our new insurance plan for small businesses\'');
    fireEvent.change(promptInput, { target: { value: 'Create a promotional post' } });
    
    // Click generate
    const generateButton = screen.getByText('Generate Content');
    fireEvent.click(generateButton);
    
    // Wait for API call
    await waitFor(() => {
      expect(apiService.apiService.getAIAssist).toHaveBeenCalledWith(
        expect.stringContaining('Create a promotional post')
      );
    });
    
    // Check that content is displayed
    await waitFor(() => {
      expect(screen.getByText('Generated marketing content')).toBeInTheDocument();
    });
  });
});