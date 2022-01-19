let users = [];
const userJoin = (userId, name, room) => {
  const user = { userId, name, room };
  users.push(user);
};

const getUsers = (room) => {
  //   console.log(room);
  //   console.log(users);
  return users.filter((user) => user.room === room);
};

const userLeft = (userId) => {
  //   console.log("left");
  const newUsers = users.filter((user) => user.userId !== userId);
  users = newUsers;
};

module.exports = {
  userJoin,
  getUsers,
  userLeft,
};
