import React from 'react';
import { getCurrentUser } from '../utils/auth';

const UserProfile = () => {
  const user = getCurrentUser();
  
  if (!user) {
    return null;
  }
  
  return (
    <div className="dropdown">
      <button 
        className="btn btn-outline-dark dropdown-toggle" 
        type="button" 
        id="userDropdown" 
        data-bs-toggle="dropdown" 
        aria-expanded="false"
      >
        <i className="bi bi-person-circle me-1"></i> {user.name}
      </button>
      <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
        <li>
          <div className="dropdown-item-text">
            <small className="text-muted">{user.email}</small>
          </div>
        </li>
        <li><hr className="dropdown-divider" /></li>
        <li>
          <button className="dropdown-item text-danger" id="logoutBtn">
            Logout
          </button>
        </li>
      </ul>
    </div>
  );
};

export default UserProfile;