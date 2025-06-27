import React from 'react';

interface UserProfileProps {
  src: string;
  alt: string;
}

const UserProfile: React.FC<UserProfileProps> = ({ src, alt }) => (
  <img
    className="h-10 w-10 rounded-full object-cover border border-gray-200"
    src={src}
    alt={alt}
  />
);

export default UserProfile; 