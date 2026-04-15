import API from "../services/api";

const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const res = await API.post("/auth/register", form);
    console.log(res.data);

    alert("Registered successfully");
  } catch (error) {
    console.error(error.response?.data?.message);
    alert(error.response?.data?.message || "Error");
  }
};