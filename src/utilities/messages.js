const generateMessage = (displayName, message) => {
  return {
    displayName,
    message,
    createdAt: new Date().getTime(),
  };
};
const generateLocation = (displayName, location) => {
  return {
    displayName,
    location,
    createdAt: new Date().getTime(),
  };
};

module.exports = {
  generateMessage,
  generateLocation,
};
