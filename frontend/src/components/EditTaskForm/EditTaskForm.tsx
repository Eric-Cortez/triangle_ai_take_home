import React, { useState } from "react";
import "./EditTaskForm.css";

export interface EditableTask {
  id: number;
  subject: string;
  status: string;
  priority: string;
}

interface EditTaskFormProps {
  task: EditableTask;
  onCancel: () => void;
  onTaskUpdate: (updatedTask: EditableTask) => void;
}

const EditTaskForm: React.FC<EditTaskFormProps> = ({
  task,
  onCancel,
  onTaskUpdate,
}) => {
  const [formData, setFormData] = useState<EditableTask>(task);

  const handleFieldChange = (field: keyof EditableTask, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch(
        `${import.meta.env.VITE_URL}/api/tasks/edit`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ticket_id: formData.id,
            subject: formData.subject,
            status: formData.status,
            priority: formData.priority,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update the ticket");
      }

      const updatedTask = await response.json();
      console.log("Ticket updated successfully:", updatedTask);

      onTaskUpdate(formData);
      onCancel();
    } catch (error) {
      console.error("Error updating ticket:", error);
    }
  };

  return (
    <form className="edit-task-form" onSubmit={handleFormSubmit}>
      <h2>Edit Ticket</h2>
      <label>
        Subject:
        <input
          type="text"
          value={formData.subject}
          onChange={(e) => handleFieldChange("subject", e.target.value)}
        />
      </label>
      <label>
        Status:
        <select
          value={formData.status}
          onChange={(e) => handleFieldChange("status", e.target.value)}
        >
          <option value="open">Open</option>
          <option value="pending">Pending</option>
          <option value="closed">Closed</option>
        </select>
      </label>
      <label>
        Priority:
        <select
          value={formData.priority}
          onChange={(e) => handleFieldChange("priority", e.target.value)}
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </label>
      <div className="form-actions">
        <button type="submit" className="save-button">
          Save
        </button>
        <button type="button" className="cancel-button" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
};

export default EditTaskForm;
