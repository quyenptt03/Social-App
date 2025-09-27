const createUserToken = (user: any) => {
  return {
    name: `${user.first_name} ${user.last_name}`,
    email: user.email,
    userId: user._id,
    role: user.role,
  };
};

export default createUserToken;
