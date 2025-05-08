import React, { useState, useEffect } from "react";
import "./Tasks.css";
import moment from "moment";

interface Task {
  id: number;
  subject: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface ApiResponse {
  requests: Task[];
}

const Tasks: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("http://127.0.0.1:5000/api/tasks")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data: ApiResponse) => setTasks(data.requests))
      .catch((err) => setError(err.message));
  }, []);

  const formatDate = (dateString: string): string => {
    const date = moment(dateString);
    if (date.isSame(moment(), "day")) {
      return `Today at ${date.format("h:mm A")}`;
    }
    return date.format("MMMM D, YYYY");
  };

  return (
    <div className="tasks-container">
      <h1 className="tasks-title">DemoAI Zendesk Tasks</h1>
      {error && <p className="tasks-error">Error: {error}</p>}
      <table className="tasks-table">
        <thead>
          <tr>
            <th>Ticket Status</th>
            <th>ID</th>
            <th>Subject</th>
            <th>Created At</th>
            <th>Updated At</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => (
            <tr key={task.id}>
              <td>{task.status || "Unknown"}</td>
              <td>{task.id}</td>
              <td>{task.subject || "No Subject"}</td>
              <td>{formatDate(task.created_at)}</td>
              <td>{formatDate(task.updated_at)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Tasks;
