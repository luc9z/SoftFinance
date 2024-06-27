import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './style.module.scss';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.notFound}>
      <h1>404 - Page Not Found</h1>
      <p>The page you are looking for does not exist.</p>
      <button onClick={() => navigate('/dashboard')}>Go to Home</button>
    </div>
  );
};

export default NotFound;
