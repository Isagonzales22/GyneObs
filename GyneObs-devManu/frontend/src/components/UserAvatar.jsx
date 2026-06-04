import React, { useState } from 'react';
import { getUserFotoUrl } from '../utils/photo';

const UserAvatar = ({
  user,
  size = 40,
  style = {},
  className = '',
  fallbackName = 'U',
}) => {
  const [imgError, setImgError] = useState(false);
  const foto = getUserFotoUrl(user);
  const nombre =
    user?.primer_nombre ||
    user?.nombre ||
    user?.usuario?.primer_nombre ||
    fallbackName;
  const inicial = (nombre.charAt(0) || 'U').toUpperCase();

  const baseStyle = {
    width: size,
    height: size,
    borderRadius: '50%',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    background: 'linear-gradient(135deg, var(--primary-blue), var(--primary-pink))',
    color: 'white',
    fontWeight: 'bold',
    fontSize: size * 0.38,
    ...style,
  };

  if (foto && !imgError) {
    return (
      <div className={className} style={baseStyle}>
        <img
          src={foto}
          alt=""
          referrerPolicy="no-referrer"
          onError={() => setImgError(true)}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </div>
    );
  }

  return (
    <div className={className} style={baseStyle}>
      {inicial}
    </div>
  );
};

export default UserAvatar;
