// frontend/src/pages/Dashboard.jsx
import { useState, useEffect } from 'react';
import { getMembers, deleteMember, addMember, updateMember } from '../services/api';
import Header from '../components/Header';
import MemberCard from '../components/MemberCard';
import MemberListItem from '../components/MemberListItem';
import SearchFilter from '../components/SearchFilter';
import MemberForm from '../components/MemberForm';
import DashboardStats from '../components/DashboardStats';
import { useToast } from '../components/ToastContainer';
import ConfirmationModal from '../components/ConfirmationModal';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { useTheme } from '../contexts/ThemeContext';

const Dashboard = () => {
  const [members, setMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilters, setActiveFilters] = useState([]);
  const [viewMode, setViewMode] = useState(() => {
    // Get view mode from localStorage or default to 'grid'
    return localStorage.getItem('viewMode') || 'grid';
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentMember, setCurrentMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    fetchMembers();
    
    // Set initial theme
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  useEffect(() => {
    filterMembers();
  }, [members, searchTerm, activeFilters]);

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

  // Update the useEffect for handling view mode based on screen size
  useEffect(() => {
    // Force grid view on small screens
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setViewMode('grid');
      }
    };
    
    // Initial check
    handleResize();
    
    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const data = await getMembers();
      setMembers(data.members);
      setFilteredMembers(data.members);
      
      if (data.messages && data.messages.length > 0) {
        data.messages.forEach(msg => {
          addToast(msg.category, msg.message);
        });
      }
    } catch (error) {
      console.error('Error loading members:', error);
      addToast('error', 'Failed to load members');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (memberId) => {
    try {
      await deleteMember(memberId);
      setMembers(members.filter(member => member.id !== memberId));
      addToast('success', 'Member deleted successfully');
    } catch (error) {
      console.error('Error deleting member:', error);
      addToast('error', 'Failed to delete member');
    }
  };

  const handleAddMember = async (formData) => {
    try {
      await addMember(formData);
      setShowAddModal(false);
      addToast('success', 'Member added successfully');
      fetchMembers();
    } catch (error) {
      console.error('Error adding member:', error);
      addToast('error', 'Failed to add member');
    }
  };

  const handleEditMember = async (formData) => {
    try {
      await updateMember(currentMember.id, formData);
      setShowEditModal(false);
      addToast('success', 'Member updated successfully');
      fetchMembers();
    } catch (error) {
      console.error('Error updating member:', error);
      addToast('error', 'Failed to update member');
    }
  };

  // Modify the filterMembers function to handle single filter selection instead of combinations
  const filterMembers = () => {
    let filtered = [...members];
    
    // Apply status filter (now we'll only have one status filter at a time)
    if (activeFilters.length > 0) {
      const statusFilter = activeFilters[0]; // Just use the first filter
      if (['Active', 'Near Expiry', 'Expired'].includes(statusFilter)) {
        filtered = filtered.filter(member => member.status === statusFilter);
      }
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

  // Modify the handleFilterSelect function to only allow one filter at a time
  const handleFilterSelect = (filter) => {
    if (filter === 'All') {
      setActiveFilters([]);
      return;
    }
    
    // Check if this filter is already active
    const isActive = activeFilters.includes(filter);
    
    if (isActive) {
      // If active, remove it (clear filter)
      setActiveFilters([]);
    } else {
      // If not active, replace any existing filter with this one
      setActiveFilters([filter]);
    }
  };

  const handleClearFilters = () => {
    setActiveFilters([]);
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

  // Update the handleViewChange function
  const handleViewChange = (view) => {
    // Only allow changing view on sm screens and larger
    if (window.innerWidth >= 640 || view === 'grid') {
      setViewMode(view);
      localStorage.setItem('viewMode', view);
    }
  };

  return (
    <div className="min-h-screen bg-base-200 overflow-x-hidden">
      <Header 
        theme={theme} 
        toggleTheme={toggleTheme} 
        openAddModal={() => setShowAddModal(true)} 
      />
      
      <div className="container mx-auto max-w-7xl px-2 sm:px-4 pt-2">
        {loading ? (
          <LoadingSkeleton />
        ) : (
          <>
            {/* Pass handleFilterSelect to DashboardStats */}
            <DashboardStats 
              members={members} 
              onFilterSelect={handleFilterSelect} 
            />
            
            <SearchFilter 
              searchTerm={searchTerm} 
              onSearchChange={setSearchTerm} 
              onFilterSelect={handleFilterSelect}
              activeFilters={activeFilters}
              onClearFilters={handleClearFilters}
              viewMode={viewMode}
              onViewChange={handleViewChange}
            />
            
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
                {filteredMembers.map(member => (
                  <MemberCard 
                    key={member.id} 
                    member={member} 
                    onDelete={handleDelete}
                    onEdit={() => openEditModal(member)}
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-2 member-list-view">
                {filteredMembers.map(member => (
                  <MemberListItem
                    key={member.id}
                    member={member}
                    onDelete={handleDelete}
                    onEdit={() => openEditModal(member)}
                  />
                ))}
              </div>
            )}
            
            {filteredMembers.length === 0 && (
              <div className="text-center py-10 bg-base-100 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold mb-2">No members found</h3>
                <p className="text-gray-500 mb-4">
                  {searchTerm 
                    ? "No members match your search criteria." 
                    : activeFilters.length > 0 
                      ? "No members match the selected filters." 
                      : "There are no members in the system yet."}
                </p>
                <button 
                  className="btn btn-primary"
                  onClick={() => setShowAddModal(true)}
                >
                  Add your first member
                </button>
              </div>
            )}
          </>
        )}
      </div>
      
      {/* Add Member Modal */}
      {showAddModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 overflow-y-auto"
          onClick={closeModal}
        >
          <div 
            className="bg-base-100 rounded-lg shadow-xl w-full max-w-3xl my-4 animate-fade-in"
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
            className="bg-base-100 rounded-lg shadow-xl w-full max-w-3xl my-4 animate-fade-in"
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