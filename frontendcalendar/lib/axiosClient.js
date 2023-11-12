import axios from "axios";
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
const axiosClient = axios.create({
  baseURL: BACKEND_URL,
});
// axiosClient.interceptors.request.use((config) => {
//   const accessToken = getItem("accessToken", "session");
//   if (accessToken) {
//     config.headers.common.Authorization = `Bearer ${accessToken}`;
//   }
//   return config;
// });

// let isJWTErrorEncountered = false;

// axiosClient.interceptors.response.use(
//   (response) => {
//     return response;
//   },
//   (error) => {
//     const status = error.response.status;
//     const data = error.response.data;
//     if (status == 501) {
//       if (data.name === "TokenExpiredError" && !isJWTErrorEncountered) {
//         isJWTErrorEncountered = true;
//         clear("session");
//         window.location.pathname = "/session-error";
//       } 
//       return Promise.reject();
//     }
//     return Promise.reject(error);
//   }
// );

export default axiosClient;
