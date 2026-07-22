// =========================
// Fetch Users
// =========================

const fetchUsers = async () => {
  setUsersLoading(true);
  setUserStatus('');

  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.access_token) {
      throw new Error('You are not logged in');
    }

    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-users`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
          'Content-Type': 'application/json',
        },
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.error || 'Failed to load users'
      );
    }

    setUsers(result.users || []);

  } catch (error) {
    console.error(
      'Error fetching users:',
      error
    );

    setUserStatus(
      'Failed to load users: ' +
        error.message
    );

  } finally {
    setUsersLoading(false);
  }
};


// =========================
// Create User
// =========================

const createUser = async (e) => {
  e.preventDefault();

  if (
    !newUserEmail.trim() ||
    !newUserPassword.trim()
  ) {
    setUserStatus(
      'Email and password are required.'
    );

    return;
  }

  setUserActionLoading(true);
  setUserStatus('');

  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.access_token) {
      throw new Error(
        'You are not logged in'
      );
    }

    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-users`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'create',
          email: newUserEmail.trim(),
          password: newUserPassword,
          username:
            newUserUsername.trim(),
          type: newUserType,
        }),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.error ||
          'Failed to create user'
      );
    }

    setUserStatus(
      'User created successfully!'
    );

    // Clear form
    setNewUserEmail('');
    setNewUserPassword('');
    setNewUserUsername('');
    setNewUserType('user');

    // Refresh users
    await fetchUsers();

  } catch (error) {
    console.error(
      'Error creating user:',
      error
    );

    setUserStatus(
      'Failed to create user: ' +
        error.message
    );

  } finally {
    setUserActionLoading(false);
  }
};


// =========================
// Delete User
// =========================

const deleteUser = async (userId) => {
  const confirmed = window.confirm(
    'Are you sure you want to delete this user?'
  );

  if (!confirmed) {
    return;
  }

  setUserActionLoading(true);
  setUserStatus('');

  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.access_token) {
      throw new Error(
        'You are not logged in'
      );
    }

    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-users`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'delete',
          userId: userId,
        }),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.error ||
          'Failed to delete user'
      );
    }

    setUserStatus(
      'User deleted successfully!'
    );

    // Remove user immediately from UI
    setUsers((currentUsers) =>
      currentUsers.filter(
        (user) =>
          user.id !== userId
      )
    );

  } catch (error) {
    console.error(
      'Error deleting user:',
      error
    );

    setUserStatus(
      'Failed to delete user: ' +
        error.message
    );

  } finally {
    setUserActionLoading(false);
  }
};
