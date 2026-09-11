const getDeviceInfo = (userAgent = '') => {
  const agent = String(userAgent || '');
  const isMobile = /Android|webOS|iPhone|iPad|iPod|Mobile/i.test(agent);
  let os = 'Unknown OS';
  let device = isMobile ? 'Mobile Device' : 'Computer';
  let browser = 'Unknown Browser';

  if (/iPad/i.test(agent)) {
    os = 'iPadOS';
    device = 'iPad';
  } else if (/iPhone|iPod/i.test(agent)) {
    os = 'iOS';
    device = 'iPhone';
  } else if (/Android/i.test(agent)) {
    os = 'Android';
    device = 'Android Device';
  } else if (/Windows/i.test(agent)) {
    os = 'Windows';
    device = 'Windows PC';
  } else if (/Mac OS X|Macintosh/i.test(agent)) {
    os = 'macOS';
    device = 'Mac Computer';
  } else if (/Linux/i.test(agent)) {
    os = 'Linux';
    device = 'Linux Computer';
  }

  if (/Edg\//i.test(agent)) browser = 'Edge';
  else if (/Firefox\//i.test(agent)) browser = 'Firefox';
  else if (/Chrome\//i.test(agent) && !/Edg\//i.test(agent)) browser = 'Chrome';
  else if (/Safari\//i.test(agent) && !/Chrome\//i.test(agent)) browser = 'Safari';

  return {
    deviceName: browser === 'Unknown Browser' ? device : `${device} - ${browser}`,
    deviceType: isMobile ? 'mobile' : 'web',
    os,
    browser
  };
};

module.exports = { getDeviceInfo };
