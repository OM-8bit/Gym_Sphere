// frontend/src/pages/EditMember.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getMember, updateMember } from '../services/api';
import MemberForm from '../components/MemberForm';
import FlashMessage from '../components/FlashMessage';

const EditMember = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [flashMessages, setFlashMessages] = useState([]);

  useEffect(() => {
    fetchMember();
    
    // Apply saved theme
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, [id]);

  const fetchMember = async () => {
    try {
      setLoading(true);
      const data = await getMember(id);
      
      // Format dates if needed (backend returns HTML template data)
      if (data.member) {
        // Convert date format from DD/MM/YYYY to YYYY-MM-DD for input fields
        ['join_date', 'end_date'].forEach(field => {
          try {
            if (data.member[field] && data.member[field].includes('/')) {
              const [day, month, year] = data.member[field].split('/');
              data.member[field] = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
            }
          } catch (e) {
            console.error(`Error formatting date ${field}:`, e);
          }
        });
      }
      
      setMember(data.member);
    } catch (error) {
      console.error('Error fetching member:', error);
      addFlashMessage('error', 'Failed to load member details');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateMember = async (formData) => {
    try {
      await updateMember(id, formData);
      addFlashMessage('success', 'Member updated successfully');
      navigate('/'); // Navigate back to the members list after successful update
    } catch (error) {
      console.error('Error updating member:', error);
      addFlashMessage('error', 'Failed to update member');
    }
  };

  const addFlashMessage = (category, message) => {
    const newMessage = { id: Date.now(), category, message };
    setFlashMessages(prev => [...prev, newMessage]);
  };

  const removeFlashMessage = (id) => {
    setFlashMessages(prev => prev.filter(msg => msg.id !== id));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200 p-4 overflow-x-hidden">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Edit Member</h1>
          <Link to="/" className="btn btn-ghost">Back to List</Link>
        </div>

        {flashMessages.map(msg => (
          <FlashMessage 
            key={msg.id} 
            message={msg} 
            onClose={() => removeFlashMessage(msg.id)} 
          />
        ))}

        {member && (
          <MemberForm 
            member={member}
            formTitle="Edit Member" 
            submitButtonText="Update Member" 
            onSubmit={handleUpdateMember} 
          />
        )}
      </div>
    </div>
  );
};

export default EditMember;