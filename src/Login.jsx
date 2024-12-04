import { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
// import Invoice from "./Invoice";
import './App.css'
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [credentials, setCredentials] = useState({ username: "", password: "" });
  const [isLoggedIn] = useState(false);
  const navigate = useNavigate()

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({ ...prev, [name]: value }));
  };

  // Handle login
  const handleLogin = () => {
    const { username, password } = credentials;
    if (username === "admin" && password === "sahu123") {
      // setIsLoggedIn(true);
      navigate('/invoice')
    } else {
      alert("Invalid Username or Password!");
    }
  };

  // Render the billing page if logged in


  console.log(isLoggedIn, '---- isLoggedIn')

  return (
    <div className="d-flex brand-logo justify-content-center align-items-center vh-100 bg-light">
      <div className="card shadow p-4" style={{ width: "400px" }}>
        <h3 className="text-center mb-4">Login</h3>
        <div className="mb-3">
          <label className="form-label">Username</label>
          <input
            type="text"
            className="form-control"
            name="username"
            value={credentials.username}
            onChange={handleChange}
            placeholder="Enter username"
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Password</label>
          <input
            type="password"
            className="form-control"
            name="password"
            value={credentials.password}
            onChange={handleChange}
            placeholder="Enter password"
          />
        </div>
        <button className="btn btn-primary w-100" onClick={handleLogin}>
          Login
        </button>
      </div>
    </div>
  );
};

export default Login;
