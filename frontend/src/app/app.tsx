import { Route, Routes as ReactRoutes } from "react-router";
import ProtectedRoute from "@/components/ProtectedRoute";
import RegisterPage from "@/views/auth/Register";

const App = () => {
  //  const [user, loading] = useAuthState(auth);

  // const getIdToken = async () => {
  //   await user?.getIdToken().then((value) => {
  //   });
  // };

  // useEffect(() => {
  //   if (!user) return;
  //   getIdToken();
  // }, [user]);

  return (
    <ReactRoutes>
      <Route path="/auth/register" element={<RegisterPage />} />
      {/* <Route path="/*" element={<ProtectedRoutesByPassed />} /> */}
      {/* <Route path="/*" element={<ProtectedRoute />} /> */}
      <h1>sss</h1>
    </ReactRoutes>
  );
};

export default App;
