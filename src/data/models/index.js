import sequelize from '../sequelize';
import User from './User';
import UserProfile from './UserProfile';
function sync(...args) {
    return sequelize.sync(...args);
  }
  User.hasOne(UserProfile, {
    foreignKey: 'userId',
    as: 'profile',
    onUpdate: 'cascade',
    onDelete: 'cascade',
  });
  export default { sync };
  export {
    User
  }