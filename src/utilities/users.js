const users = [];

const addUser = ({ id, displayName, room }) => {
  displayName = displayName.trim().toLowerCase();
  room = room.trim().toLowerCase();

  if (!displayName || !room) {
    return {
      err: "Display name and room are required!",
    };
  }

  const duplicateUser = users.find((user) => {
    return user.displayName === displayName && user.room === room;
  });
  if (duplicateUser) return { err: "Display name already in use!" };

  const user = { id, displayName, room };
  users.push(user);
  return { user };
};

const deleteUser = (id) => {
  const index = users.findIndex((user) => user.id === id);
  if (index !== -1) return users.splice(index, 1)[0];
};

const fetchUser = (id) => {
  const index = users.find((user) => user.id === id);
  if (!index) return undefined;
  return index;
};
const fetchUsersInRoom = (room) => {
  room = room.trim().toLowerCase();
  return users.filter((user) => user.room === room);
};

module.exports = {
  addUser,
  deleteUser,
  fetchUser,
  fetchUsersInRoom,
};
