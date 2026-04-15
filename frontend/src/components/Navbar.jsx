import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);

  return (
    <div style={styles.nav}>
      <h2>BuildStack</h2>

      <div>
        {user ? (
          <>
            <span style={{ marginRight: "10px" }}>{user.name}</span>
            <button onClick={logout}>Logout</button>
          </>
        ) : (
          <span>Not Logged In</span>
        )}
      </div>
    </div>
  );
};

const styles = {
  nav: {
    display: "flex",
    justifyContent: "space-between",
    padding: "10px 20px",
    background: "#111827",
    color: "white",
  },
};

export default Navbar;