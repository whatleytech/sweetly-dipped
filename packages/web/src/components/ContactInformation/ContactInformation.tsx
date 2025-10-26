import { useState } from "react";
import styles from "./ContactInformation.module.css";
import type { FormData } from "@/types/formTypes";

interface ContactInformationProps {
  formData: FormData;
  onUpdate: (updates: Partial<FormData>) => void;
}

interface EditableFieldProps {
  field: string;
  label: string;
  value: string;
  inputType?: string;
  isEditing: boolean;
  editingField: string | null;
  editValue: string;
  onStartEditing: (field: string, value: string) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onEditValueChange: (value: string) => void;
}

const EditableField = ({
  field,
  label,
  value,
  inputType = 'text',
  isEditing,
  editingField,
  editValue,
  onStartEditing,
  onSaveEdit,
  onCancelEdit,
  onEditValueChange,
}: EditableFieldProps) => (
  <div className={styles.fieldGroup}>
    <label htmlFor={field}>{label}:</label>
    <div className={styles.fieldValue}>
      {isEditing && editingField === field ? (
        <div className={styles.editMode}>
          <input
            id={field}
            type={inputType}
            value={editValue}
            onChange={(e) => onEditValueChange(e.target.value)}
            className={styles.editInput}
          />
          <button onClick={onSaveEdit} className={styles.saveBtn}>
            Save
          </button>
          <button onClick={onCancelEdit} className={styles.cancelBtn}>
            Cancel
          </button>
        </div>
      ) : (
        <div className={styles.displayMode}>
          <span>{value}</span>
          <button
            onClick={() => onStartEditing(field, value)}
            className={styles.editBtn}
          >
            Edit
          </button>
        </div>
      )}
    </div>
  </div>
);

export const ContactInformation = ({
  formData,
  onUpdate,
}: ContactInformationProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const startEditing = (field: string, value: string) => {
    setEditingField(field);
    setEditValue(value);
    setIsEditing(true);
  };

  const saveEdit = () => {
    if (!editingField) return;

    if (editingField === 'name') {
      const [firstName, ...lastNameParts] = editValue.split(' ');
      const lastName = lastNameParts.join(' ');
      onUpdate({
        firstName: firstName || '',
        lastName: lastName || '',
      });
    } else {
      onUpdate({ [editingField]: editValue });
    }

    setIsEditing(false);
    setEditingField(null);
    setEditValue('');
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setEditingField(null);
    setEditValue('');
  };

  const handleEditValueChange = (value: string) => {
    setEditValue(value);
  };

  const getContactMethodDisplay = () => {
    switch (formData.communicationMethod) {
      case 'email':
        return 'Email';
      case 'text':
        return 'Text Message';
      default:
        return 'Not specified';
    }
  };

  return (
    <div className={styles.section}>
      <h3>Contact Information</h3>

      <EditableField
        field="name"
        label="Name"
        value={`${formData.firstName} ${formData.lastName}`}
        inputType="text"
        isEditing={isEditing}
        editingField={editingField}
        editValue={editValue}
        onStartEditing={startEditing}
        onSaveEdit={saveEdit}
        onCancelEdit={cancelEdit}
        onEditValueChange={handleEditValueChange}
      />

      <EditableField
        field="email"
        label="Email"
        value={formData.email}
        inputType="email"
        isEditing={isEditing}
        editingField={editingField}
        editValue={editValue}
        onStartEditing={startEditing}
        onSaveEdit={saveEdit}
        onCancelEdit={cancelEdit}
        onEditValueChange={handleEditValueChange}
      />

      <EditableField
        field="phone"
        label="Phone"
        value={formData.phone}
        inputType="tel"
        isEditing={isEditing}
        editingField={editingField}
        editValue={editValue}
        onStartEditing={startEditing}
        onSaveEdit={saveEdit}
        onCancelEdit={cancelEdit}
        onEditValueChange={handleEditValueChange}
      />

      <div className={styles.fieldGroup}>
        <label>Preferred Contact Method:</label>
        <span className={styles.fieldValue}>{getContactMethodDisplay()}</span>
      </div>
    </div>
  );
};
