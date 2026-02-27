/**
 * Format date to readable format with AM/PM
 * @param {string|Date} date - ISO date string or Date object
 * @returns {string} Formatted date (MM/DD/YYYY)
 */
export const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const year = d.getFullYear();
  return `${month}/${day}/${year}`;
};

/**
 * Format date with time in AM/PM format
 * @param {string|Date} date - ISO date string or Date object
 * @returns {string} Formatted datetime (MM/DD/YYYY hh:mm AM/PM)
 */
export const formatDateTime = (date) => {
  if (!date) return '';
  const d = new Date(date);
  const dateStr = formatDate(d);
  const hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${dateStr} ${displayHours}:${minutes} ${ampm}`;
};

/**
 * Get days until due date
 * @param {string|Date} dueDate - ISO date string or Date object
 * @returns {number} Number of days until due date (negative if overdue)
 */
export const getDaysUntilDue = (dueDate) => {
  if (!dueDate) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  const diffTime = due - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

/**
 * Get due status message
 * @param {string|Date} dueDate - ISO date string or Date object
 * @param {string} status - Bill status
 * @returns {object} Status info with message, type, daysLeft
 */
export const getDueStatus = (dueDate, status) => {
  if (!dueDate || status === 'paid') {
    return null;
  }

  const daysLeft = getDaysUntilDue(dueDate);

  if (daysLeft < 0) {
    return {
      message: 'Your payment is OVERDUE! Please pay now.',
      type: 'error',
      daysLeft: Math.abs(daysLeft),
      isOverdue: true,
    };
  }

  if (daysLeft <= 5) {
    return {
      message: `⚠️ Your payment is due in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}. Please pay soon!`,
      type: 'warning',
      daysLeft,
      isOverdue: false,
    };
  }

  return null;
};
