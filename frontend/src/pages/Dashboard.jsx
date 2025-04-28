// frontend/src/pages/Dashboard.jsx
import { useState, useEffect } from 'react';
import { getMembers, deleteMember, addMember, updateMember } from '../services/api';
import Header from '../components/Header';
import MemberCard from '../components/MemberCard';
import SearchFilter from '../components/SearchFilter';
import MemberForm from '../components/MemberForm';
import FlashMessage from '../components/FlashMessage';

const Dashboard = () => {
  const [members, setMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentFilter, setCurrentFilter] = useState('All');
  const [theme, setTheme] = useState(() => {
    // Get theme from localStorage or default to 'light'
    return localStorage.getItem('theme') || 'light';
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentMember, setCurrentMember] = useState(null);
  const [flashMessages, setFlashMessages] = useState([]);

  useEffect(() => {
    fetchMembers();
    
    // Set initial theme
    document.documentElement.setAttribute('data-theme', theme);
  }, []);

  useEffect(() => {
    filterMembers();
  }, [members, searchTerm, currentFilter]);

  // Add body lock when modal is open
  useEffect(() => {
    if (showAddModal || showEditModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [showAddModal, showEditModal]);

  const fetchMembers = async () => {
    try {
      const data = await getMembers();
      setMembers(data.members);
      setFilteredMembers(data.members);
      
      if (data.messages && data.messages.length > 0) {
        setFlashMessages(data.messages);
      }
    } catch (error) {
      console.error('Error loading members:', error);
      addFlashMessage('error', 'Failed to load members');
    }
  };

  const handleDelete = async (memberId) => {
    try {
      await deleteMember(memberId);
      setMembers(members.filter(member => member.id !== memberId));
      addFlashMessage('success', 'Member deleted successfully');
    } catch (error) {
      console.error('Error deleting member:', error);
      addFlashMessage('error', 'Failed to delete member');
    }
  };

  const handleAddMember = async (formData) => {
    try {
      await addMember(formData);
      setShowAddModal(false);
      addFlashMessage('success', 'Member added successfully');
      fetchMembers();
    } catch (error) {
      console.error('Error adding member:', error);
      addFlashMessage('error', 'Failed to add member');
    }
  };

  const handleEditMember = async (formData) => {
    try {
      await updateMember(currentMember.id, formData);
      setShowEditModal(false);
      addFlashMessage('success', 'Member updated successfully');
      fetchMembers();
    } catch (error) {
      console.error('Error updating member:', error);
      addFlashMessage('error', 'Failed to update member');
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme); // Save theme to localStorage
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const addFlashMessage = (category, message) => {
    const newMessage = { id: Date.now(), category, message };
    setFlashMessages(prev => [...prev, newMessage]);
  };

  const removeFlashMessage = (id) => {
    setFlashMessages(prev => prev.filter(msg => msg.id !== id));
  };

  const filterMembers = () => {
    let filtered = [...members];
    
    // Apply status filter
    if (currentFilter !== 'All') {
      filtered = filtered.filter(member => member.status === currentFilter);
    }
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(member => 
        member.name.toLowerCase().includes(term) || 
        member.email.toLowerCase().includes(term) || 
        member.phone.includes(term)
      );
    }
    
    setFilteredMembers(filtered);
  };

  const openEditModal = (member) => {
    // Format dates for the edit form if needed
    const formattedMember = { ...member };
    
    // Convert date format from DD/MM/YYYY to YYYY-MM-DD for input fields
    ['join_date', 'end_date'].forEach(field => {
      try {
        if (formattedMember[field] && formattedMember[field].includes('/')) {
          const [day, month, year] = formattedMember[field].split('/');
          formattedMember[field] = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        }
      } catch (e) {
        console.error(`Error formatting date ${field}:`, e);
      }
    });
    
    setCurrentMember(formattedMember);
    setShowEditModal(true);
  };

  const closeModal = () => {
    setShowAddModal(false);
    setShowEditModal(false);
  };
  
  const stopPropagation = (e) => {
    e.stopPropagation();
  };

  return (
    <div className="min-h-screen bg-base-200 p-2 sm:p-4 overflow-x-hidden">
      <div className="container mx-auto max-w-7xl px-2 sm:px-4">
        <Header 
          theme={theme} 
          toggleTheme={toggleTheme} 
          openAddModal={() => setShowAddModal(true)} 
        />
        
        <div className="space-y-3">
          {flashMessages.map(msg => (
            <FlashMessage 
              key={msg.id} 
              message={msg} 
              onClose={() => removeFlashMessage(msg.id)} 
            />
          ))}
        </div>
        
        <SearchFilter 
          searchTerm={searchTerm} 
          onSearchChange={setSearchTerm} 
          onFilterSelect={setCurrentFilter} 
        />
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
          {filteredMembers.map(member => (
            <MemberCard 
              key={member.id} 
              member={member} 
              onDelete={handleDelete}
              onEdit={() => openEditModal(member)}
            />
          ))}
          
          {filteredMembers.length === 0 && (
            <div className="col-span-full text-center py-10">
              <p className="text-gray-500">No members found</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Add Member Modal */}
      {showAddModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 overflow-y-auto"
          onClick={closeModal}
        >
          <div 
            className="bg-base-100 rounded-lg shadow-xl w-full max-w-3xl my-4"
            onClick={stopPropagation}
          >
            <div className="p-2 text-right">
              <button 
                className="btn btn-sm btn-circle btn-ghost" 
                onClick={closeModal}
              >
                ✕
              </button>
            </div>
            <div className="px-3 sm:px-4 pb-6">
              <MemberForm 
                formTitle="Add New Member" 
                submitButtonText="Add Member" 
                onSubmit={handleAddMember} 
                onCancel={closeModal} 
              />
            </div>
          </div>
        </div>
      )}
      
      {/* Edit Member Modal */}
      {showEditModal && currentMember && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 overflow-y-auto"
          onClick={closeModal}
        >
          <div 
            className="bg-base-100 rounded-lg shadow-xl w-full max-w-3xl my-4"
            onClick={stopPropagation}
          >
            <div className="p-2 text-right">
              <button 
                className="btn btn-sm btn-circle btn-ghost" 
                onClick={closeModal}
              >
                ✕
              </button>
            </div>
            <div className="px-3 sm:px-4 pb-6">
              <MemberForm 
                member={currentMember}
                formTitle="Edit Member" 
                submitButtonText="Update Member" 
                onSubmit={handleEditMember} 
                onCancel={closeModal} 
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;