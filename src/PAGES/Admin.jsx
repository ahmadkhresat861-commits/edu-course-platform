{/* =========================
    Users Management
========================= */}

{activeTab === 'users' && (
  <>
    {/* Create User */}

    <div
      style={{
        background: 'white',
        borderRadius: '12px',
        padding: '30px',
        marginBottom: '30px',
        boxShadow:
          '0 4px 15px rgba(0,0,0,0.08)',
      }}
    >
      <h2
        style={{
          color: '#003366',
          marginTop: 0,
        }}
      >
        <i className="fas fa-user-plus"></i>{' '}
        Create New User
      </h2>

      <form onSubmit={createUser}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '15px',
          }}
        >
          <input
            type="email"
            placeholder="Email"
            value={newUserEmail}
            onChange={(e) =>
              setNewUserEmail(e.target.value)
            }
            style={{
              padding: '14px',
              border: '1px solid #ddd',
              borderRadius: '8px',
            }}
          />

          <input
            type="password"
            placeholder="Password"
            value={newUserPassword}
            onChange={(e) =>
              setNewUserPassword(e.target.value)
            }
            style={{
              padding: '14px',
              border: '1px solid #ddd',
              borderRadius: '8px',
            }}
          />

          <input
            type="text"
            placeholder="Username"
            value={newUserUsername}
            onChange={(e) =>
              setNewUserUsername(e.target.value)
            }
            style={{
              padding: '14px',
              border: '1px solid #ddd',
              borderRadius: '8px',
            }}
          />

          <select
            value={newUserType}
            onChange={(e) =>
              setNewUserType(e.target.value)
            }
            style={{
              padding: '14px',
              border: '1px solid #ddd',
              borderRadius: '8px',
            }}
          >
            <option value="user">
              User
            </option>

            <option value="admin">
              Admin
            </option>
          </select>
        </div>

        {userStatus && (
          <p
            style={{
              color:
                userStatus.includes(
                  'successfully'
                )
                  ? '#10b981'
                  : '#ef4444',
              marginTop: '15px',
            }}
          >
            {userStatus}
          </p>
        )}

        <button
          type="submit"
          disabled={userActionLoading}
          style={{
            marginTop: '20px',
            background: userActionLoading
              ? '#999'
              : '#003366',
            color: 'white',
            border: 'none',
            padding: '12px 25px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '600',
          }}
        >
          <i
            className={
              userActionLoading
                ? 'fas fa-spinner fa-spin'
                : 'fas fa-user-plus'
            }
          ></i>{' '}

          {userActionLoading
            ? 'Processing...'
            : 'Create User'}
        </button>
      </form>
    </div>

    {/* Users Table */}

    <div
      style={{
        background: 'white',
        borderRadius: '12px',
        padding: '30px',
        boxShadow:
          '0 4px 15px rgba(0,0,0,0.08)',
        overflowX: 'auto',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
        }}
      >
        <h2
          style={{
            color: '#003366',
            margin: 0,
          }}
        >
          <i className="fas fa-users"></i>{' '}
          All Users
        </h2>

        <button
          onClick={fetchUsers}
          disabled={usersLoading}
          style={{
            background: '#003366',
            color: 'white',
            border: 'none',
            padding: '10px 18px',
            borderRadius: '8px',
            cursor: 'pointer',
          }}
        >
          <i
            className={
              usersLoading
                ? 'fas fa-spinner fa-spin'
                : 'fas fa-sync'
            }
          ></i>{' '}

          Refresh
        </button>
      </div>

      {usersLoading ? (
        <p
          style={{
            textAlign: 'center',
            color: '#888',
            padding: '40px',
          }}
        >
          <i className="fas fa-spinner fa-spin"></i>{' '}
          Loading users...
        </p>
      ) : users.length === 0 ? (
        <p
          style={{
            textAlign: 'center',
            color: '#888',
            padding: '40px',
          }}
        >
          No users found.
        </p>
      ) : (
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
          }}
        >
          <thead>
            <tr
              style={{
                background: '#003366',
                color: 'white',
              }}
            >
              <th style={{ padding: '15px' }}>
                ID
              </th>

              <th style={{ padding: '15px' }}>
                Email
              </th>

              <th style={{ padding: '15px' }}>
                Created At
              </th>

              <th style={{ padding: '15px' }}>
                Status
              </th>

              <th style={{ padding: '15px' }}>
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {users.map((user) => (
              <tr
                key={user.id}
                style={{
                  borderBottom:
                    '1px solid #f0f0f0',
                }}
              >
                <td
                  style={{
                    padding: '15px',
                    fontSize: '12px',
                  }}
                >
                  {user.id}
                </td>

                <td
                  style={{
                    padding: '15px',
                    fontWeight: '600',
                  }}
                >
                  {user.email || '-'}
                </td>

                <td
                  style={{
                    padding: '15px',
                  }}
                >
                  {user.created_at
                    ? new Date(
                        user.created_at
                      ).toLocaleString()
                    : '-'}
                </td>

                <td
                  style={{
                    padding: '15px',
                  }}
                >
                  {user.email_confirmed_at ? (
                    <span
                      style={{
                        color: '#10b981',
                        fontWeight: '600',
                      }}
                    >
                      Confirmed
                    </span>
                  ) : (
                    <span
                      style={{
                        color: '#f0a500',
                        fontWeight: '600',
                      }}
                    >
                      Not Confirmed
                    </span>
                  )}
                </td>

                <td
                  style={{
                    padding: '15px',
                  }}
                >
                  <button
                    onClick={() =>
                      deleteUser(user.id)
                    }
                    disabled={
                      userActionLoading
                    }
                    style={{
                      background: '#ef4444',
                      color: 'white',
                      border: 'none',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                    }}
                  >
                    <i className="fas fa-trash"></i>{' '}
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  </>
)}
