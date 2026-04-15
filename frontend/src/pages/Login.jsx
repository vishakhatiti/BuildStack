import API from "../services/api";

const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const res = await API.post("/auth/login", form);

    // Save token
    localStorage.setItem("token", res.data.token);

    alert("Login successful");

    console.log(res.data);
  } catch (error) {
    alert(error.response?.data?.message || "Error");
  }
};

const Login = () => {
  return <div>Login Page</div>;
};

export default Login;   // ✅ MUST EXIST