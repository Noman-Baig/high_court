import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../auth/Auth";
import logo from "../logo.png";

const Sidebar = ({ collapsed, setCollapsed, isMobile }) => {
  const { permissions, role, logout, user } = useAuth();
  const location = useLocation();
  const pages = permissions[role] || [];

  const icons = {
    dashboard: "mdi:view-dashboard",
    library: "mdi:bookshelf",
    complaints: "mdi:message-alert",
    finance: "mdi:finance",
    adminSettings: "mdi:cog",
    committees: "mdi:group",
    register: "mdi:person",
    welfare: "mdi:donate",
    members: "mdi:database",
    settings: "mdi:settings",
    profile: "mdi:person",
    elections: "mdi:vote",
    bookings: "mdi:calendar",
  };

  const width = collapsed ? 76 : 264;

  return (
    <aside
      style={{
        width,
        position: "fixed",
        inset: "0 auto 0 0",
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.7), rgba(255,255,255,0.55))",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        borderRight: "1px solid rgba(255,255,255,0.35)",
        transform:
          isMobile && collapsed ? "translateX(-100%)" : "translateX(0)",
        transition: "transform 280ms ease, width 300ms ease",
        display: "flex",
        flexDirection: "column",
        zIndex: 1000,
        fontFamily: "Lato",
      }}
    >
      {/* Header */}

      {/* <div> */}

      {collapsed ? (
        <div
          style={{
            padding: 20,

            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {" "}
          <img src={logo} width="30px" />
        </div>
      ) : (
        <></>
      )}
      {/* </div> */}

      <div
        style={{
          padding: 20,
          display: "flex",

          alignItems: "center",
          justifyContent: collapsed ? "center" : "space-between",
        }}
      >
        {!collapsed && (
          <div
            style={{
              // background: "red",
              width: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div>
              <img src={logo} />
            </div>
            {/* <h2 style={{ margin: 0, fontWeight: 700, color: "#018f41" }}>
              High Court Bar
            </h2> */}
            <span style={{ fontSize: 12, color: "#666" }}>
              {user.role.toUpperCase()} DASHBOARD
            </span>
            <br />
            {user.is_chairman ? (
              <>
                <div
                  style={{
                    borderTop: "1px solid black",
                    marginTop: "10px",
                    paddingTop: "5px",
                    fontSize: 12,
                    color: "#666",
                  }}
                >
                  {/* {user.committee_role.toUpperCase()} OF{" "}
                  {user.committee_name.toUpperCase()} */}
                  {user.committees.map((c) => (
                    <div>
                      <span>{c.committee_role.toUpperCase()}</span>
                      <span> OF </span>
                      <span>{c.committee_name.toUpperCase()}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <></>
            )}
          </div>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          style={{
            width: 38,
            height: 38,
            borderRadius: 12,
            border: "none",
            position: "absolute",
            bottom: "2px",
            right: "-42px",
            background: "rgba(1,143,65,0.15)",
            cursor: "pointer",
            fontSize: 18,
          }}
        >
          {collapsed ? "→" : "←"}
        </button>
      </div>

      {/* Navigation */}
      <nav
        style={{
          flex: 1,
          padding: "12px 8px",
          height: "70%",
          //   background: "red",
          overflowY: "auto",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          "&::-webkit-scrollbar": {
            display: "none",
          },
        }}
      >
        {pages.map((page) => {
          const active =
            location.pathname === `/${page.toLowerCase().replace(" ", "-")}`;

          return (
            <Link
              key={page}
              to={`/${page.toLowerCase().replace(" ", "-")}`}
              onClick={() => isMobile && setCollapsed(true)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                padding: "14px 16px",
                margin: "6px 8px",
                borderRadius: 14,
                textDecoration: "none",
                background: active
                  ? "linear-gradient(135deg,#3B7D58,#5da97f)"
                  : "transparent",
                color: active ? "white" : "#222",
                justifyContent: collapsed ? "center" : "flex-start",
                transition: "all 200ms ease",
                boxShadow: active
                  ? "0 10px 30px rgba(1, 143, 65, 0.09)"
                  : "none",
              }}
            >
              <img
                src={`https://api.iconify.design/${icons[page]}.svg?color=${
                  active ? "white" : "018f41"
                }`}
                width="26"
                alt=""
              />
              {!collapsed && (
                <span style={{ textTransform: "capitalize" }}>{page}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div style={{ padding: 16 }}>
        <button
          onClick={logout}
          style={{
            width: "100%",
            height: 48,
            borderRadius: 14,
            border: "none",
            background: "#ff4757",
            color: "#fff",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          {collapsed ? "⏻" : "Logout"}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
