import { format } from 'timeago.js';

export const formatDate = (date) => {
  if (!date) return '';
  return format(date);
};

export const getInitials = (firstName, lastName) => {
  return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
};

export const isFriend = (user, targetUserId) => {
  return user?.friends?.includes(targetUserId);
};

export const hasSentRequest = (user, targetUserId) => {
  return user?.sentRequests?.includes(targetUserId);
};

export const hasPendingRequest = (user, targetUserId) => {
  return user?.friendRequests?.includes(targetUserId);
};
