import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUsers, faUserCheck, faExclamationTriangle, faUserTimes 
} from '@fortawesome/free-solid-svg-icons';

const StatCard = ({ title, value, icon, color, onClick }) => {
  // Create dynamic gradient and style properties
  const getStyles = (baseColor) => {
    switch(baseColor) {
      case 'primary':
        return {
          gradient: 'from-primary/20 to-primary/5',
          iconBg: 'bg-primary/10',
          iconColor: 'text-primary',
          borderColor: 'border-primary/20'
        };
      case 'success':
        return {
          gradient: 'from-success/20 to-success/5',
          iconBg: 'bg-success/10',
          iconColor: 'text-success',
          borderColor: 'border-success/20'
        };
      case 'warning':
        return {
          gradient: 'from-warning/20 to-warning/5',
          iconBg: 'bg-warning/10',
          iconColor: 'text-warning',
          borderColor: 'border-warning/20'
        };
      case 'error':
        return {
          gradient: 'from-error/20 to-error/5',
          iconBg: 'bg-error/10',
          iconColor: 'text-error',
          borderColor: 'border-error/20'
        };
      default:
        return {
          gradient: 'from-primary/20 to-primary/5',
          iconBg: 'bg-primary/10',
          iconColor: 'text-primary',
          borderColor: 'border-primary/20'
        };
    }
  };

  const styles = getStyles(color);

  return (
    <div 
      className={`bg-gradient-to-br ${styles.gradient} backdrop-blur-sm rounded-xl border ${styles.borderColor} shadow-sm transform transition-all duration-300 hover:scale-105 hover:shadow-lg cursor-pointer`}
      onClick={onClick}
    >
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-base font-semibold text-base-content/70">{title}</h2>
            <div className="mt-2 text-3xl font-bold">{value}</div>
          </div>
          <div className={`${styles.iconBg} p-3 rounded-lg`}>
            <FontAwesomeIcon icon={icon} className={`text-xl ${styles.iconColor}`} />
          </div>
        </div>
      </div>
    </div>
  );
};

const DashboardStats = ({ members, onFilterSelect }) => {
  // Calculate statistics
  const totalMembers = members.length;
  const activeMembers = members.filter(member => member.status === 'Active').length;
  const nearExpiryMembers = members.filter(member => member.status === 'Near Expiry').length;
  const expiredMembers = members.filter(member => member.status === 'Expired').length;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 mb-6">
      <StatCard 
        title="Total Members" 
        value={totalMembers} 
        icon={faUsers} 
        color="primary"
        onClick={() => onFilterSelect('All')}
      />
      <StatCard 
        title="Active Members" 
        value={activeMembers} 
        icon={faUserCheck} 
        color="success"
        onClick={() => onFilterSelect('Active')}
      />
      <StatCard 
        title="Near Expiry" 
        value={nearExpiryMembers} 
        icon={faExclamationTriangle} 
        color="warning"
        onClick={() => onFilterSelect('Near Expiry')}
      />
      <StatCard 
        title="Expired" 
        value={expiredMembers} 
        icon={faUserTimes} 
        color="error"
        onClick={() => onFilterSelect('Expired')}
      />
    </div>
  );
};

export default DashboardStats;