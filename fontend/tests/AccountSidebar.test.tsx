import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from '../src/store';
import AccountSidebar from '../src/components/AccountSidebar/AccountSidebar';

const mockUser = {
  id: 1,
  username: "user_test",
  password_hash: "hash",
  role_id: 2,
  created_at: "2023-01-01T00:00:00Z",
  email: "test@example.com",
  phone: "0123456789",
  full_name: "Test User",
  membership_level: "Silver",
  lotte_points: 100
};

describe('AccountSidebar Component', () => {
  const renderSidebar = () => {
    return render(
      <Provider store={store}>
        <BrowserRouter>
          <AccountSidebar currentUser={mockUser as any} />
        </BrowserRouter>
      </Provider>
    );
  };

  beforeEach(() => {
    localStorage.clear();
  });

  it('renders menu items', () => {
    renderSidebar();
    expect(screen.getByText('Tổng quan')).toBeTruthy();
    expect(screen.getByText('Đơn hàng')).toBeTruthy();
    expect(screen.getByText('Địa chỉ')).toBeTruthy();
  });

  it('highlights active item', () => {
    renderSidebar();
    const dashboardLink = screen.getByText('Tổng quan').closest('a');
    expect(dashboardLink?.className).toContain('text-primary');
  });

});
