import { Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { NavBar } from "@/components/NavBar";
import { TeachersPage } from "@/pages/TeachersPage";
import { AddTeacherPage } from "@/pages/AddTeacherPage";
import { ClassesPage } from "@/pages/ClassesPage";
import { AddClassPage } from "@/pages/AddClassPage";

function App() {
  return (
    <div className="min-h-svh bg-background">
      <NavBar />
      <Routes>
        <Route path="/" element={<Navigate to="/classes" replace />} />
        <Route path="/teachers" element={<TeachersPage />} />
        <Route path="/teachers/new" element={<AddTeacherPage />} />
        <Route path="/teachers/:id/edit" element={<AddTeacherPage />} />
        <Route path="/classes" element={<ClassesPage />} />
        <Route path="/classes/new" element={<AddClassPage />} />
        <Route path="/classes/:id/edit" element={<AddClassPage />} />
      </Routes>
      <Toaster />
    </div>
  );
}

export default App;
