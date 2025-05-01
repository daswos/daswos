import fetch from 'node-fetch';

async function createTestUser() {
  try {
    const response = await fetch('http://localhost:5000/api/register/standard', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'testuser',
        email: 'test@example.com',
        fullName: 'Test User',
        password: 'password123'
      }),
    });

    const data = await response.json();
    console.log('Response status:', response.status);
    console.log('Response data:', data);
  } catch (error) {
    console.error('Error creating test user:', error);
  }
}

createTestUser();
