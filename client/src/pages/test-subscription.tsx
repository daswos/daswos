import React, { useEffect, useState } from 'react';
import { apiRequest } from '@/lib/queryClient';

export default function TestSubscription() {
  const [user, setUser] = useState<any>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch user data
        const userResponse = await fetch('/api/user', {
          credentials: 'include'
        });

        if (userResponse.ok) {
          const userData = await userResponse.json();
          setUser(userData);

          // If we have a user, fetch subscription data
          const subscriptionResponse = await fetch('/api/user/subscription', {
            credentials: 'include'
          });

          if (subscriptionResponse.ok) {
            const subscriptionData = await subscriptionResponse.json();
            setSubscription(subscriptionData);
          } else {
            setError('Failed to fetch subscription data');
          }
        } else {
          setError('Not logged in');
        }
      } catch (err) {
        setError('Error fetching data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  if (error) {
    return <div className="p-8 text-red-500">{error}</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Subscription Test Page</h1>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">User Data</h2>
        <pre className="bg-gray-100 p-4 rounded">
          {JSON.stringify(user, null, 2)}
        </pre>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Subscription Data</h2>
        <pre className="bg-gray-100 p-4 rounded">
          {JSON.stringify(subscription, null, 2)}
        </pre>
      </div>

      <div className="p-4 bg-yellow-100 rounded">
        <h3 className="font-medium">Current Status:</h3>
        <p className="mt-2">
          Has subscription: <strong>{subscription?.hasSubscription ? 'Yes' : 'No'}</strong>
        </p>
        {subscription?.hasSubscription && (
          <>
            <p className="mt-1">
              Subscription type: <strong>{subscription?.type || 'N/A'}</strong>
            </p>
            <p className="mt-1">
              Billing cycle: <strong>{subscription?.billingCycle || 'N/A'}</strong>
            </p>
            <p className="mt-1">
              Expires at: <strong>{subscription?.expiresAt ? new Date(subscription.expiresAt).toLocaleString() : 'N/A'}</strong>
            </p>
          </>
        )}
      </div>
    </div>
  );
}