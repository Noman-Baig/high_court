import React, { useState } from "react";
import { useAuth } from "../auth/Auth";

const AdminSettings = () => {
  const { permissions, updatePermissions } = useAuth();
  const [selectedRole, setSelectedRole] = useState("president");
  const [pageList, setPageList] = useState(permissions[selectedRole] || []);

  const allPages = ["Dashboard", "Library", "Complaints", "Finance"]; // Add more pages as needed

  const handleAddPage = (page) => {
    if (!pageList.includes(page)) {
      setPageList([...pageList, page]);
    }
  };

  const handleRemovePage = (page) => {
    setPageList(pageList.filter((p) => p !== page));
  };

  const saveChanges = () => {
    updatePermissions(selectedRole, pageList);
  };

  return (
    <div>
      <h1>Admin Settings</h1>
      <select
        value={selectedRole}
        onChange={(e) => {
          setSelectedRole(e.target.value);
          setPageList(permissions[e.target.value] || []);
        }}
      >
        <option value="president">President</option>
        <option value="vice_president">Vice President</option>
        <option value="general_secretary">General Secretary</option>
        <option value="joint_secretary">Joint Secretary</option>
        <option value="library_secretary">Library Secretary</option>
        <option value="treasurer">Treasurer</option>
        <option value="committee_chairman">Committee Chairman</option>
      </select>
      <h2>Accessible Pages for {selectedRole}</h2>
      <ul>
        {pageList.map((page) => (
          <li key={page}>
            {page}{" "}
            <button onClick={() => handleRemovePage(page)}>Remove</button>
          </li>
        ))}
      </ul>
      <h3>Add Page</h3>
      <select onChange={(e) => handleAddPage(e.target.value)}>
        <option value="">Select Page</option>
        {allPages
          .filter((p) => !pageList.includes(p))
          .map((page) => (
            <option key={page} value={page}>
              {page}
            </option>
          ))}
      </select>
      <button onClick={saveChanges}>Save Changes</button>
    </div>
  );
};

export default AdminSettings;
