import React, { useState, useEffect } from "react";
import "./Tasks.css";
import moment from "moment";
import Modal from "../Modal/Modal";
import EditTaskForm, { type EditableTask } from "../EditTaskForm/EditTaskForm";

interface Task {
  id: number;
  subject: string;
  status: string;
  priority: string;
  created_at: string;
  updated_at: string;
}

const Tasks: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_URL}/api/tasks`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => setTasks(data.requests))
      .catch((err) => setError(err.message));
  }, []);

  const formatDate = (dateString: string): string => {
    const date = moment(dateString);
    if (date.isSame(moment(), "day")) {
      return `Today at ${date.format("h:mm A")}`;
    }
    return date.format("MMMM D, YYYY");
  };

  const openModal = (task: Task) => {
    setCurrentTask(task);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setCurrentTask(null);
    setIsModalOpen(false);
  };

  const openCreateModal = () => {
    setIsCreateModalOpen(true);
  };

  const closeCreateModal = () => {
    setIsCreateModalOpen(false);
  };

  const handleTaskUpdate = (updatedTask: EditableTask) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === updatedTask.id ? { ...task, ...updatedTask } : task
      )
    );
  };

  const handleCreateTask = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const newTicket = {
      subject: formData.get("subject") as string,
      description: formData.get("description") as string,
      status: formData.get("status") as string,
      priority: formData.get("priority") as string,
    };

    fetch(`${import.meta.env.VITE_URL}/api/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newTicket),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(() => {
        setTimeout(() => {
          // Refetch all tasks after successful creation
          fetch(`${import.meta.env.VITE_URL}/api/tasks`)
            .then((response) => {
              if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
              }
              return response.json();
            })
            .then((data) => {
              setTasks(data.requests);
              setLoading(false);
              closeCreateModal();
            })
            .catch((err) => {
              setError(err.message);
              setLoading(false);
            });
        }, 3500);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  };

  return (
    <div className="tasks-container">
      <h1 className="tasks-title">DemoAI Zendesk Tasks</h1>
      <button onClick={openCreateModal} className="create-button">
        Create Ticket
      </button>
      {error && <p className="tasks-error">Error: {error}</p>}
      <table className="tasks-table">
        <thead>
          <tr>
            <th>Ticket Status</th>
            <th>ID</th>
            <th>Subject</th>
            <th>Priority</th>
            <th>Created At</th>
            <th>Updated At</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => (
            <tr key={task.id}>
              <td>{task.status || "Unknown"}</td>
              <td>{task.id}</td>
              <td>{task.subject || "No Subject"}</td>
              <td>{task.priority || "None"}</td>
              <td>{formatDate(task.created_at)}</td>
              <td>{formatDate(task.updated_at)}</td>
              <td>
                {task.status === "closed" ? null : (
                  <button
                    onClick={() => openModal(task)}
                    className="edit-button"
                    aria-label="Edit Task"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      height="18"
                      width="18"
                    >
                      <path
                        fill="#2D2E2E"
                        d="m16.92 5 3.51 3.52 1.42-1.42-4.93-4.93L3 16.09V21h4.91L19.02 9.9 17.6 8.48 7.09 19H5v-2.09L16.92 5Z"
                      ></path>
                    </svg>
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="tasks-note">* Closed tasks cannot be edited.</p>
      <Modal isOpen={isModalOpen} onClose={closeModal}>
        {currentTask && (
          <EditTaskForm
            task={{
              id: currentTask.id,
              subject: currentTask.subject,
              status: currentTask.status,
              priority: currentTask.priority,
            }}
            onCancel={closeModal}
            onTaskUpdate={handleTaskUpdate}
          />
        )}
      </Modal>

      <Modal isOpen={isCreateModalOpen} onClose={closeCreateModal}>
        {loading ? (
          <div className="loading-message">
            <p>Creating ticket, please wait...</p>
          </div>
        ) : (
          <>
            <h2>Create New Ticket</h2>
            <form className="create-task-form" onSubmit={handleCreateTask}>
              <label>
                Subject:
                <input type="text" name="subject" required />
              </label>
              <label>
                Description:
                <textarea name="description" required></textarea>
              </label>
              <label>
                Status:
                <select name="status" required>
                  <option value="open">Open</option>
                  <option value="pending">Pending</option>
                  <option value="closed">Closed</option>
                </select>
              </label>
              <label>
                Priority:
                <select name="priority" required>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </label>
              <div className="form-actions">
                <button type="submit" className="save-button">
                  Create
                </button>
                <button
                  type="button"
                  onClick={closeCreateModal}
                  className="cancel-button"
                >
                  Cancel
                </button>
              </div>
            </form>
          </>
        )}
      </Modal>
    </div>
  );
};

export default Tasks;
