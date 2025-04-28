// frontend/src/components/MemberForm.jsx
import { useState, useEffect } from 'react';

const MemberForm = ({ member, onSubmit, formTitle, submitButtonText, onCancel }) => {
  // Initialize with today's date and a default end date (30 days from now)
  const today = new Date().toISOString().split('T')[0];
  const defaultEndDate = new Date();
  defaultEndDate.setDate(defaultEndDate.getDate() + 30);
  const defaultEndDateStr = defaultEndDate.toISOString().split('T')[0];
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    join_date: today,
    end_date: defaultEndDateStr
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (member) {
      setFormData({
        name: member.name || '',
        email: member.email || '',
        phone: member.phone || '',
        join_date: member.join_date || today,
        end_date: member.end_date || defaultEndDateStr
      });
    }
  }, [member, today, defaultEndDateStr]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      // Convert form data to FormData object for API
      const submissionData = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        submissionData.append(key, value);
      });
      
      await onSubmit(submissionData);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="card bg-base-100 p-4">
      <h3 className="font-bold text-lg mb-4">{formTitle}</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text">Name</span>
            </label>
            <input 
              type="text" 
              name="name" 
              value={formData.name}
              onChange={handleChange}
              className="input input-bordered" 
              required 
            />
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text">Email</span>
            </label>
            <input 
              type="email" 
              name="email" 
              value={formData.email}
              onChange={handleChange}
              className="input input-bordered" 
              required 
            />
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text">Phone</span>
            </label>
            <input 
              type="tel" 
              pattern="[0-9]{10}" 
              minLength="10" 
              maxLength="10" 
              name="phone" 
              value={formData.phone}
              onChange={handleChange}
              className="input input-bordered" 
              required 
            />
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text">Join Date</span>
            </label>
            <input 
              type="date" 
              name="join_date" 
              value={formData.join_date}
              onChange={handleChange}
              className="input input-bordered" 
              required 
            />
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text">Expiry Date</span>
            </label>
            <input 
              type="date" 
              name="end_date" 
              value={formData.end_date}
              onChange={handleChange}
              className="input input-bordered" 
              required 
            />
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-6">
          {onCancel && (
            <button type="button" className="btn" onClick={onCancel}>
              Cancel
            </button>
          )}
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? 
              <span className="loading loading-spinner loading-xs mr-2"></span> : null}
            {submitButtonText}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MemberForm;