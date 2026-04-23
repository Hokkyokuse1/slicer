const axios = require("axios");

const triggerSlicing = async (stlPath) => {
  const repo = "your-username/your-repo"; // Replace with your GitHub repo
  const githubToken = process.env.GITHUB_TOKEN; // Store securely in .env

  const url = `https://api.github.com/repos/${repo}/actions/workflows/slicing.yml/dispatches`;

  try {
    const response = await axios.post(
      url,
      {
        ref: "main",
        inputs: {
          stl_path: stlPath,
        },
      },
      {
        headers: {
          Accept: "application/vnd.github.v3+json",
          Authorization: `Bearer ${githubToken}`,
        },
      }
    );

    console.log("Slicing job triggered:", response.status);
    return response.status;
  } catch (error) {
    console.error("Error triggering slicing job:", error.response?.data || error.message);
  }
};

module.exports = { triggerSlicing };
