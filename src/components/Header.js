// // src/components/Header.js
// import React from "react";
// import { useAuth } from "../auth/Auth";

// const Header = () => {
//   const { logout, role } = useAuth();

//   return (
//     <header
//       style={{
//         // backgroundColor: "#018f41",
//         color: "black",
//         padding: "15px 20px",
//         display: "flex",
//         justifyContent: "space-between",
//         alignItems: "center",
//       }}
//     >
//       <h1 style={{ margin: 0 }}>
//         Welcome, {role.charAt(0).toUpperCase() + role.slice(1)}
//       </h1>
//       <button
//         onClick={logout}
//         style={{
//           padding: "10px 20px",
//           backgroundColor: "#016d32",
//           color: "white",
//           border: "none",
//           borderRadius: "5px",
//           cursor: "pointer",
//         }}
//       >
//         Logout
//       </button>
//     </header>
//   );
// };

// export default Header;
