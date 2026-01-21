import Can from "../can/Can";
const PermissionButton = ({ permission, anyOf, children, ...props }) => {
  return (
    <Can perform={permission} anyOf={anyOf}>
      <button {...props}>{children}</button>
    </Can>
  );
};

export default PermissionButton;
