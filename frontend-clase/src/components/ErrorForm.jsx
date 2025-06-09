import React from 'react'
import './ErrorForm.css'

function ErrorForm({ error }) {
  return error && (
    <div className='error-form'>
      <p>{error}</p>
    </div>
  );
}

export default ErrorForm