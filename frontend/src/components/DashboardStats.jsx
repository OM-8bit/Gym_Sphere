import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUsers, faUserCheck, faExclamationTriangle, faUserTimes 
} from '@fortawesome/free-solid-svg-icons';

const StatCard = ({ title, value, icon, color }) => {
  return (
    <div className={`card-hover shadow-md bg-base-100 stats-card rounded-xl`}>
      <div className="p-4 flex items-center gap-3">
        <div className={`rounded-full p-3 ${color}`}>
          <FontAwesomeIcon icon={icon} className="text-white text-lg" />
        </div>
        <div>
          <div className="stat-title text-xs sm:text-sm opacity-70">{title}</div>
          <div className="stat-value text-xl sm:text-2xl font-bold">{value}</div>
        </div>
      </div>
    </div>
  );
};

const DashboardStats = ({ members }) => {
  // Calculate statistics
  const totalMembers = members.length;
  
  const activeMembers = members.filter(member => member.status === 'Active').length;
  
  const nearExpiryMembers = members.filter(member => member.status === 'Near Expiry').length;
  
  const expiredMembers = members.filter(member => member.status === 'Expired').length;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
      <StatCard 
        title="Total Members" 
        value={totalMembers} 
        icon={faUsers} 
        color="bg-primary" 
      />
      <StatCard 
        title="Active Members" 
        value={activeMembers} 
        icon={faUserCheck} 
        color="bg-success" 
      />
      <StatCard 
        title="Near Expiry" 
        value={nearExpiryMembers} 
        icon={faExclamationTriangle} 
        color="bg-warning" 
      />
      <StatCard 
        title="Expired" 
        value={expiredMembers} 
        icon={faUserTimes} 
        color="bg-error" 
      />
    </div>
  );
};

export default DashboardStats;