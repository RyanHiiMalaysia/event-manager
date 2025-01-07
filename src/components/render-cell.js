import { User, Tooltip, Chip } from "@nextui-org/react";
import React from "react";
import { DeleteIcon } from "./icons/table/delete-icon";
import { EditIcon } from "./icons/table/edit-icon";
import { EyeIcon } from "./icons/table/eye-icon";

function getUserPictureUrl(name) {
  const formattedName = name.split(" ").join("+");
  return `https://ui-avatars.com/api/?name=${formattedName}&background=random`;
}

export const RenderCell = ({ user, creator, columnKey }) => {
  const cellValue = user[columnKey];
  switch (columnKey) {
    case "name":
      return (
        <User
          avatarProps={{
            src: getUserPictureUrl(user.name),
          }}
          name={cellValue}
        >
          {user.email}
        </User>
      );
    case "is_admin":
      return (
        // <div>
        //   <div>
        //     <span>{cellValue}</span>
        //   </div>
        //   <div>

        //     <span>{user.is_admin ? "Admin" : "Participant"}</span>
        //   </div>
        // </div>
        <Chip size="sm" variant="flat" color={user.id === creator ? "primary" : user.is_admin ? "success" : "default"}>
          <span className="capitalize text-xs">
            {user.id === creator ? "Creator" : user.is_admin ? "Admin" : "Participant"}
          </span>
        </Chip>
      );
    // case "status":
    //   return (
    //     <Chip
    //       size="sm"
    //       variant="flat"
    //       color={cellValue === "active" ? "success" : cellValue === "paused" ? "danger" : "warning"}
    //     >
    //       <span className="capitalize text-xs">{cellValue}</span>
    //     </Chip>
    //   );

    case "actions":
      if (user.id !== creator) {
        return (
          <div className="flex items-center gap-4 ">
            {/* <div>
            <Tooltip content="Details">
              <button onClick={() => console.log("View user", user.id)}>
                <EyeIcon size={20} fill="#979797" />
              </button>
            </Tooltip>
          </div>
          <div>
            <Tooltip content="Edit user" color="secondary">
              <button onClick={() => console.log("Edit user", user.id)}>
                <EditIcon size={20} fill="#979797" />
              </button>
            </Tooltip>
          </div> */}
            <div>
              <Tooltip
                content="Remove Participant"
                color="danger"
                onClick={() => console.log("Remove Participant", user.id)}
              >
                <button>
                  <DeleteIcon size={20} fill="#FF0080" />
                </button>
              </Tooltip>
            </div>
          </div>
        );
      }
    default:
      return cellValue;
  }
};
