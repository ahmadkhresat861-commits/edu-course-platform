import React from "react";
import CourseCard from "../components/CourseCard";

const courses = [
  { id: 1, title: "React Basics", description: "Learn React step by step" },
  { id: 2, title: "JavaScript Advanced", description: "Deep dive into JS" }
];

const Home = () => {
  return (
    <div style={{ padding: "20px" }}>
      <h1>Welcome to Edu Courses</h1>
      <div style={{ display: "flex", gap: "20px", marginTop: "20px" }}>
        {courses.map(course => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>
    </div>
  );
};

export default Home;