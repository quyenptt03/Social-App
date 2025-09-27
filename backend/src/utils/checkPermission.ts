import CustomError from "../errors";

const checkPermission = (requestUser: object, resouceUserId: string) => {
  // @ts-ignore
  if (requestUser.role === "admin") return;
  // @ts-ignore
  if (requestUser.userId === resouceUserId.toString()) return;

  throw new CustomError.UnauthorizedError(
    "Not authorized to access this route"
  );
};

export default checkPermission;
