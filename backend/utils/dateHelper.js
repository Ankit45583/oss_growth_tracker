// utils/dateHelper.js

/**
 * Aaj ki date return karo (time remove karke)
 */
const getToday = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
};

/**
 * Kal ki date return karo
 */
const getYesterday = () => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(0, 0, 0, 0);
  return yesterday;
};

/**
 * Do dates same din ki hain?
 */
const isSameDay = (date1, date2) => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth()    === d2.getMonth()    &&
    d1.getDate()     === d2.getDate()
  );
};

/**
 * Kitne minutes pehle tha?
 */
const minutesAgo = (date) => {
  if (!date) return Infinity;
  return (Date.now() - new Date(date).getTime()) / (1000 * 60);
};

/**
 * Date ko readable format me karo
 */
const formatDate = (date) => {
  if (!date) return null;
  return new Date(date).toLocaleDateString("en-IN", {
    day:   "2-digit",
    month: "short",
    year:  "numeric",
  });
};

module.exports = {
  getToday,
  getYesterday,
  isSameDay,
  minutesAgo,
  formatDate,
};