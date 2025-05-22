import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';

interface FeatureToggle {
  id: string;
  name: string;
  enabled: boolean;
  description: string;
}

const AdminDashboard: React.FC = () => {
  const [, setLocation] = useLocation();
  const [features, setFeatures] = useState<FeatureToggle[]>([
    { 
      id: 'safesphere', 
      name: 'SafeSphere', 
      enabled: true, 
      description: 'Enables the SafeSphere feature for content filtering' 
    },
    { 
      id: 'supersafe', 
      name: 'SuperSafe', 
      enabled: true, 
      description: 'Enables advanced content filtering for sensitive users' 
    },
    { 
      id: 'daswosai', 
      name: 'DasWos AI', 
      enabled: true, 
      description: 'Enables AI-powered features across the platform' 
    },
    { 
      id: 'autoshop', 
      name: 'AutoShop', 
      enabled: true, 
      description: 'Enables automated shopping assistant' 
    }
  ]);

  const [pendingItems, setPendingItems] = useState([
    { id: 1, name: 'Vintage Chair', seller: 'VintageFurniture', price: '$120.00' },
    { id: 2, name: 'Smart Thermostat', seller: 'TechGadgets', price: '$89.99' },
    { id: 3, name: 'Handmade Pottery Set', seller: 'ArtisanCrafts', price: '$65.50' }
  ]);

  useEffect(() => {
    // Check if admin is authenticated
    const isAuthenticated = localStorage.getItem('adminAuthenticated') === 'true';
    if (!isAuthenticated) {
      setLocation('/admin/login');
    }
  }, [setLocation]);

  const handleToggleFeature = (id: string) => {
    setFeatures(features.map(feature => 
      feature.id === id ? { ...feature, enabled: !feature.enabled } : feature
    ));
  };

  const handleApproveItem = (id: number) => {
    setPendingItems(pendingItems.filter(item => item.id !== id));
    // In a real app, you would make an API call to approve the item
  };

  const handleRejectItem = (id: number) => {
    setPendingItems(pendingItems.filter(item => item.id !== id));
    // In a real app, you would make an API call to reject the item
  };

  const handleLogout = () => {
    localStorage.removeItem('adminAuthenticated');
    setLocation('/admin/login');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between">
            <div className="flex">
              <div className="flex flex-shrink-0 items-center">
                <h1 className="text-xl font-bold text-gray-900">DasWos Admin</h1>
              </div>
            </div>
            <div className="flex items-center">
              <button
                onClick={handleLogout}
                className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="mb-4 text-xl font-semibold text-gray-900">Feature Toggles</h2>
          <div className="overflow-hidden rounded-lg bg-white shadow">
            <ul className="divide-y divide-gray-200">
              {features.map((feature) => (
                <li key={feature.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{feature.name}</h3>
                      <p className="text-sm text-gray-500">{feature.description}</p>
                    </div>
                    <div className="flex items-center">
                      <span className="mr-3 text-sm font-medium text-gray-900">
                        {feature.enabled ? 'Enabled' : 'Disabled'}
                      </span>
                      <button
                        type="button"
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                          feature.enabled ? 'bg-indigo-600' : 'bg-gray-200'
                        }`}
                        onClick={() => handleToggleFeature(feature.id)}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            feature.enabled ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div>
          <h2 className="mb-4 text-xl font-semibold text-gray-900">Pending Items for Approval</h2>
          {pendingItems.length > 0 ? (
            <div className="overflow-hidden rounded-lg bg-white shadow">
              <ul className="divide-y divide-gray-200">
                {pendingItems.map((item) => (
                  <li key={item.id} className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">{item.name}</h3>
                        <p className="text-sm text-gray-500">Seller: {item.seller}</p>
                        <p className="text-sm text-gray-500">Price: {item.price}</p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleApproveItem(item.id)}
                          className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleRejectItem(item.id)}
                          className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="rounded-lg bg-white p-6 text-center shadow">
              <p className="text-gray-500">No pending items for approval</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
