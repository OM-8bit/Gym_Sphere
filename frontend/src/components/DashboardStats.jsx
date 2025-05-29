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
          gradient: 'from-primary/30 to-primary/10',
          iconBg: 'bg-primary/20',
          iconColor: 'text-primary',
          neonGlow: 'after:bg-blue-500/30 after:blur-2xl',
          boxShadow: 'shadow-[0_10px_20px_-5px_rgba(59,130,246,0.3)]'
        };
      case 'success':
        return {
          gradient: 'from-success/30 to-success/10',
          iconBg: 'bg-success/20',
          iconColor: 'text-success',
          neonGlow: 'after:bg-green-500/30 after:blur-2xl',
          boxShadow: 'shadow-[0_10px_20px_-5px_rgba(34,197,94,0.3)]'
        };
      case 'warning':
        return {
          gradient: 'from-warning/30 to-warning/10',
          iconBg: 'bg-warning/20',
          iconColor: 'text-warning',
          neonGlow: 'after:bg-yellow-500/30 after:blur-2xl',
          boxShadow: 'shadow-[0_10px_20px_-5px_rgba(234,179,8,0.3)]'
        };
      case 'error':
        return {
          gradient: 'from-error/30 to-error/10',
          iconBg: 'bg-error/20',
          iconColor: 'text-error',
          neonGlow: 'after:bg-red-500/30 after:blur-2xl',
          boxShadow: 'shadow-[0_10px_20px_-5px_rgba(239,68,68,0.3)]'
        };
      default:
        return {
          gradient: 'from-primary/30 to-primary/10',
          iconBg: 'bg-primary/20',
          iconColor: 'text-primary',
          neonGlow: 'after:bg-blue-500/30 after:blur-2xl',
          boxShadow: 'shadow-[0_10px_20px_-5px_rgba(59,130,246,0.3)]'
        };
    }
  };

  const styles = getStyles(color);

  return (
    <div 
      className={`relative overflow-hidden bg-gradient-to-br ${styles.gradient} backdrop-blur-sm 
      rounded-xl
      transform transition-all duration-300 hover:scale-105 cursor-pointer
      ${styles.boxShadow} hover:translate-y-[-5px]
      after:content-[''] after:absolute after:w-full after:h-full after:top-0 after:left-0 after:opacity-70 after:-z-10 ${styles.neonGlow} after:rounded-xl
      perspective-1000`}
      onClick={onClick}
      style={{
        transformStyle: 'preserve-3d',
        backfaceVisibility: 'hidden',
      }}
    >
      <div className="p-6 relative z-10">
        <div className="flex items-start justify-between">
          <div className="transform translate-z-5" style={{ transform: 'translateZ(5px)' }}>
            <h2 className="text-base font-semibold text-base-content/80">{title}</h2>
            <div className="mt-2 text-3xl font-bold" style={{ textShadow: '0 2px 5px rgba(0,0,0,0.15)' }}>{value}</div>
          </div>
          <div className={`${styles.iconBg} p-3 rounded-lg transform`} style={{ transform: 'translateZ(10px)' }}>
            <FontAwesomeIcon icon={icon} className={`text-xl ${styles.iconColor}`} />
          </div>
        </div>
      </div>
      
      {/* 3D edge effect with rounded corners */}
      <div className="absolute inset-x-0 bottom-0 h-1 bg-black/10 rounded-b-xl" style={{ transform: 'translateY(1px) rotateX(-90deg)', transformOrigin: 'bottom' }}></div>
      <div className="absolute inset-y-0 right-0 w-1 bg-black/10 rounded-r-xl" style={{ transform: 'translateX(1px) rotateY(90deg)', transformOrigin: 'right' }}></div>
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