import { useState } from "react";
import styles from "./ContactInformation.module.css";
import type { FormData } from "../../types/formTypes";

interface ContactInformationProps {
  formData: FormData;
  onUpdate: (updates: Partial<FormData>) => void;
}

export const ContactInformation = ({
  formData,
  onUpdate,
}: ContactInformationProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  const startEditing = (field: string, value: string) => {
    setEditingField(field);
    setEditValue(value);
    setIsEditing(true);
  };

  const saveEdit = () => {
    if (!editingField) return;

    if (editingField === "name") {
      const [firstName, ...lastNameParts] = editValue.split(" ");
      const lastName = lastNameParts.join(" ");
      onUpdate({
        firstName: firstName || "",
        lastName: lastName || "",
      });
    } else {
      onUpdate({ [editingField]: editValue });
    }

    setIsEditing(false);
    setEditingField(null);
    setEditValue("");
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setEditingField(null);
    setEditValue("");
  };

  const renderEditableField = (
    field: string,
    label: string,
    value: string,
    inputType: string = "text"
  ) => (
    <div className={styles.fieldGroup}>
      <label>{label}:</label>
      <div className={styles.fieldValue}>
        {isEditing && editingField === field ? (
          <div className={styles.editMode}>
            <input
              type={inputType}
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className={styles.editInput}
            />
            <button onClick={saveEdit} className={styles.saveBtn}>
              Save
            </button>
            <button onClick={cancelEdit} className={styles.cancelBtn}>
              Cancel
            </button>
          </div>
        ) : (
          <div className={styles.displayMode}>
            <span>{value}</span>
            <button
              onClick={() => startEditing(field, value)}
              className={styles.editBtn}
            >
              Edit
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const getContactMethodDisplay = () => {
    switch (formData.communicationMethod) {
      case "email":
        return "Email";
      case "text":
        return "Text Message";
      default:
        return "Not specified";
    }
  };

  return (
    <div className={styles.section}>
      <h3>Contact Information</h3>

      {renderEditableField(
        "name",
        "Name",
        `${formData.firstName} ${formData.lastName}`,
        "text"
      )}

      {renderEditableField("email", "Email", formData.email, "email")}

      {renderEditableField("phone", "Phone", formData.phone, "tel")}

      <div className={styles.fieldGroup}>
        <label>Preferred Contact Method:</label>
        <span className={styles.fieldValue}>{getContactMethodDisplay()}</span>
      </div>
    </div>
  );
};
