import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SimpleStripeForm } from './simple-stripe-form';
import '@testing-library/jest-dom';

describe('SimpleStripeForm', () => {
  const mockProps = {
    selectedPlan: 'unlimited' as const,
    billingCycle: 'monthly' as const,
    onSuccess: jest.fn(),
    onCancel: jest.fn(),
  };

});
